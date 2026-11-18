'use strict';

const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

async function main() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT || 3306),
        database: process.env.DB_NAME || 'restaurant_system',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        charset: 'utf8mb4',
        multipleStatements: true,
    });
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'seed_seoul_menu.sql'), 'utf8');
        await connection.query(sql);
        const [rows] = await connection.query(`SELECT COUNT(*) AS menu_items FROM menu_items
            WHERE category_id IN (SELECT id FROM categories WHERE name IN
            ('Mì Kim Chi', 'Mì Lẩu Thái', 'Lẩu Seoul', 'Món Trộn', 'Tokbokki',
             'Các Loại Bánh', 'Món Gà Seoul', 'Phố Ăn Vặt Seoul', 'Các Loại Nước'))`);
        console.log(`Đã cập nhật thực đơn Seoul; tổng món trong 9 nhóm: ${rows[0].menu_items}.`);
    } catch (error) {
        await connection.query('ROLLBACK').catch(() => {});
        throw error;
    } finally {
        await connection.end();
    }
}

main().catch((error) => {
    console.error(`Không thể cập nhật database: ${error.code || error.message}`);
    process.exitCode = 1;
});
