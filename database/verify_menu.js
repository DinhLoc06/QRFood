'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const db = require('../backend/config/database');

const expectedProducts = new Map([
    ['Mì Kim Chi Cá', 39000], ['Mì Kim Chi Sườn Sụn', 45000],
    ['Mì Kim Chi Đùi Gà', 45000], ['Mì Kim Chi Xúc Xích Cá Viên', 35000],
    ['Mì Kim Chi Thập Cẩm', 60000], ['Mì Lẩu Thái Bạch Tuộc', 49000],
    ['Mì Lẩu Thái Bò Mỹ Cuộn Nấm', 51000], ['Mì Lẩu Thái Cá', 42000],
    ['Mì Lẩu Thái Hải Sản', 48000], ['Mì Lẩu Thái Bò', 45000],
]);
const expectedToppings = new Map([
    ['Bạch tuộc thêm mì', 15000], ['Sườn sụn thêm mì', 15000],
    ['Mực thêm mì', 15000], ['Đùi gà thêm mì', 15000], ['Bò Mỹ thêm mì', 15000],
    ['Mì thêm', 22000], ['Kim chi thêm mì', 12000], ['Rau thêm mì', 12000],
    ['Kim châm thêm mì', 12000], ['Xúc xích thêm mì', 12000],
    ['Cá viên thêm mì', 12000], ['Bò thêm mì', 15000], ['Tôm thêm mì', 18000],
]);

(async () => {
    const [[counts]] = await db.query(`
        SELECT
          (SELECT COUNT(*) FROM categories
           WHERE name IN ('Mì Kim Chi', 'Mì Lẩu Thái', 'Món Thêm Mì', 'Topping Thêm')) AS categories,
          (SELECT COUNT(*) FROM menu_items) AS products,
          (SELECT COUNT(*) FROM toppings) AS toppings,
          (SELECT COUNT(*) FROM product_toppings) AS mappings
    `);
    const [duplicates] = await db.query(`
        SELECT name, COUNT(*) AS occurrences
        FROM (
          SELECT name FROM menu_items
          UNION ALL
          SELECT name FROM toppings
        ) items
        GROUP BY name HAVING COUNT(*) > 1
    `);
    const [[prices]] = await db.query(`
        SELECT MIN(price) AS min_product_price, MAX(price) AS max_product_price
        FROM menu_items
    `);
    const [products] = await db.query('SELECT name, price FROM menu_items ORDER BY name');
    const productDataMatches = products.length === expectedProducts.size && products.every(
        (item) => expectedProducts.get(item.name) === Number(item.price)
    );
    const [toppings] = await db.query('SELECT name, price FROM toppings ORDER BY name');
    const toppingDataMatches = toppings.length === expectedToppings.size && toppings.every(
        (item) => expectedToppings.get(item.name) === Number(item.price)
    );
    const [categoryBreakdown] = await db.query(`
        SELECT c.name AS category, COUNT(m.id) AS products,
          (SELECT COUNT(*) FROM toppings t WHERE t.category_id = c.id) AS toppings
        FROM categories c LEFT JOIN menu_items m ON m.category_id = c.id
        WHERE c.name IN ('Mì Kim Chi', 'Mì Lẩu Thái', 'Món Thêm Mì', 'Topping Thêm')
        GROUP BY c.id, c.name, c.sort_order ORDER BY c.sort_order
    `);

    let foreignKeyTest = 'FAILED_TO_REJECT';
    try {
        await db.query(
            'INSERT INTO product_toppings (product_id, topping_id) VALUES (?, ?)',
            [4294967294, 4294967294]
        );
    } catch (error) {
        foreignKeyTest = error.code;
    }

    console.log(JSON.stringify({
        counts, categoryBreakdown, duplicates, prices,
        productDataMatches, toppingDataMatches, foreignKeyTest,
    }, null, 2));
})().finally(() => db.end());
