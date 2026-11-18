'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ejs = require('ejs');
const app = require('../backend/server');
const pool = require('../backend/config/database');
const bcrypt = require('bcryptjs');

let server;
let base;

test.before(async () => {
    server = await new Promise((resolve) => {
        const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
    });
    base = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test('login and registration forms render with CSRF tokens', async () => {
    for (const route of ['/login', '/register']) {
        const response = await fetch(`${base}${route}`);
        const html = await response.text();
        assert.equal(response.status, 200);
        assert.match(html, /name="csrf_token" value="[a-f0-9]{64}"/);
    }
});

test('login rejects missing CSRF tokens without contacting the database', async () => {
    const first = await fetch(`${base}/login`);
    const cookie = first.headers.get('set-cookie').split(';')[0];
    const response = await fetch(`${base}/login`, {
        method: 'POST',
        redirect: 'manual',
        headers: { cookie, 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email: 'admin@velvetplate.com', password: 'password' }),
    });
    assert.equal(response.status, 302);
    assert.equal(response.headers.get('location'), '/login');

    const retry = await fetch(`${base}/login`, { headers: { cookie } });
    assert.match(await retry.text(), /Phiên đăng nhập không hợp lệ\. Vui lòng thử lại\./);
});

test('unauthenticated API requests and protected pages are rejected cleanly', async () => {
    const removedLocations = await fetch(`${base}/api/location-addresses`);
    assert.equal(removedLocations.status, 404);
    const removedZones = await fetch(`${base}/api/zone-list`);
    assert.equal(removedZones.status, 404);

    const api = await fetch(`${base}/api/order-list`);
    assert.equal(api.status, 401);
    assert.equal((await api.json()).redirect, '/login');

    const page = await fetch(`${base}/dashboard`, { redirect: 'manual' });
    assert.equal(page.status, 302);
    assert.equal(page.headers.get('location'), '/login');

    const qrPage = await fetch(`${base}/qr`, { redirect: 'manual' });
    assert.equal(qrPage.status, 302);
    assert.equal(qrPage.headers.get('location'), '/login');

    const order = await fetch(`${base}/api/order-place`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ type: 'DINE_IN', cart: [] }),
    });
    assert.equal(order.status, 403);
    assert.match((await order.json()).error, /Phiên đăng nhập không hợp lệ/);
});

test('delivery orders are rejected and kitchen accounts cannot order', async () => {
    const loginPage = await fetch(`${base}/login`);
    const cookie = loginPage.headers.get('set-cookie').split(';')[0];
    const token = (await loginPage.text()).match(/name="csrf_token" value="([a-f0-9]{64})"/)[1];
    const delivery = await fetch(`${base}/api/order-place`, {
        method: 'POST',
        headers: { cookie, 'x-csrf-token': token, 'content-type': 'application/json' },
        body: JSON.stringify({ type: 'DELIVERY', cart: [{ menu_item_id: 1, quantity: 1 }] }),
    });
    assert.equal(delivery.status, 400);
    assert.match((await delivery.json()).error, /Chỉ hỗ trợ đặt món dùng tại quán/);

    const originalExecute = pool.execute;
    pool.execute = async () => [[{
        id: 99,
        email: 'kitchen@example.test',
        role: 'kitchen',
        full_name: 'Kitchen',
        password_hash: bcrypt.hashSync('password', 4),
    }]];
    let kitchenCookie;
    try {
        const login = await fetch(`${base}/login`, {
            method: 'POST',
            redirect: 'manual',
            headers: { cookie, 'content-type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ email: 'kitchen@example.test', password: 'password', csrf_token: token }),
        });
        assert.equal(login.status, 302);
        assert.equal(login.headers.get('location'), '/kitchen');
        kitchenCookie = login.headers.get('set-cookie').split(';')[0];
    } finally {
        pool.execute = originalExecute;
    }
    const menu = await fetch(`${base}/menu`, { headers: { cookie: kitchenCookie } });
    assert.equal(menu.status, 403);
    const kitchen = await fetch(`${base}/kitchen`, { headers: { cookie: kitchenCookie } });
    assert.equal(kitchen.status, 200);
    const pos = await fetch(`${base}/pos`, { headers: { cookie: kitchenCookie } });
    assert.equal(pos.status, 403);
    const order = await fetch(`${base}/api/order-place`, {
        method: 'POST',
        headers: { cookie: kitchenCookie, 'content-type': 'application/json' },
        body: JSON.stringify({ type: 'DINE_IN', cart: [{ menu_item_id: 1, quantity: 1 }], table_id: 1 }),
    });
    assert.equal(order.status, 403);
    assert.match((await order.json()).error, /Tài khoản bếp không có quyền đặt món/);
});

test('static browser assets and the EJS 404 page are served', async () => {
    const asset = await fetch(`${base}/frontend/js/srms-api.js`);
    assert.equal(asset.status, 200);
    assert.match(await asset.text(), /apiPostJson/);

    const missing = await fetch(`${base}/missing`);
    assert.equal(missing.status, 404);
    assert.match(await missing.text(), /404 — Không tìm thấy trang/);

    const privateTemplate = await fetch(`${base}/frontend/views/pages/home.ejs`);
    assert.equal(privateTemplate.status, 404);
});

test('all EJS screens render with representative request data', async () => {
    const locals = {
        baseUrl: '',
        csrfToken: 'a'.repeat(64),
        user: { id: 1, email: 'staff@example.test', role: 'admin', full_name: 'Staff' },
        role: 'admin',
        current: 'dashboard',
        title: 'Test | Velvet Plate',
        extraScripts: [],
        extraCss: null,
        minimalLayout: false,
        gstRate: 18,
        e: (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
        })[char]),
        assetUrl: (value) => `/frontend/${value}`,
        appUrl: (value = '') => `/${value}`,
        jsonForScript: JSON.stringify,
        flashError: '',
        featured: [],
        tables: [{ id: 1, label: 'T1', capacity: 4, status: 'available' }],
        menu: [],
        menuInitial: [],
        categories: [],
        items: [],
        itemsPayload: [],
        catsPayload: [],
        orders: [],
        stats: { total_orders: 0, revenue: 0, orders_today: 0, revenue_today: 0, tables_occupied: 0, tables_available: 0 },
        popular: [],
        statusCounts: [],
        chartRevenue: [],
        dashPayload: {},
        order: { id: 1, order_code: 'ORD-X', type: 'DINE_IN', status: 'pending', created_at: 'now', table_label: 'T1', customer_name: 'Guest', customer_phone: '', subtotal: 10, gst_amount: 2, total: 12, gst_rate: 18 },
        items: [{ item_name: 'Meal', quantity: 1, unit_price: 10, line_total: 10 }],
        doneLabel: 'Served',
        orderUrl: 'http://192.168.1.2:3000/menu',
        qrImage: 'data:image/png;base64,ZmFrZQ==',
    };
    const directory = path.join(__dirname, '..', 'frontend', 'views', 'pages');
    const templates = fs.readdirSync(directory).filter((name) => name.endsWith('.ejs'));
    for (const role of ['guest', 'customer', 'staff', 'kitchen', 'admin']) {
        locals.role = role;
        locals.user = role === 'guest' ? null : { id: 1, email: 'user@example.test', role, full_name: 'User' };
        for (const filename of templates) {
            const html = await ejs.renderFile(path.join(directory, filename), locals);
            assert.match(html, /<!DOCTYPE html>/, `${filename} should render a complete document for ${role}`);
            if (filename === 'public_menu.ejs' && role === 'guest') {
                assert.match(html, /id="btnPlace"/);
                assert.match(html, /Chọn bàn/);
                assert.doesNotMatch(html, /DELIVERY|Giao tận nơi|Địa chỉ giao hàng/);
                assert.doesNotMatch(html, /Sign in to Order/);
            }
            if (filename === 'pos.ejs') assert.doesNotMatch(html, /DELIVERY|Giao tận nơi|Địa chỉ giao hàng/);
        }
    }
});
