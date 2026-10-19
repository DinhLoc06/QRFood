# Cơ sở dữ liệu menu Mì Kim Chi

## Cấu trúc

- `categories`: danh mục dùng chung với QRFood.
- `menu_items`: 10 món mì chính, tương thích trực tiếp với backend hiện tại.
- `toppings`: 13 món thêm/topping, không lặp lại theo từng món chính.
- `product_toppings`: quan hệ nhiều-nhiều giữa món chính và topping.

`product_toppings` ban đầu để trống vì menu nguồn không quy định topping nào áp dụng cho từng món. `description` và `image_path` cũng để `NULL`; không dùng nguyên ảnh menu và không tạo nội dung hoặc URL giả.

## Cài đặt trên XAMPP/MariaDB

Với database hiện hữu, chọn database `restaurant_system` trong phpMyAdmin và import theo thứ tự:

1. `database/menu_toppings_schema.sql`
2. `database/seed_mi_kim_chi.sql`

Với database mới, import `database/schema.sql`, sau đó import `database/seed_mi_kim_chi.sql`.

Seed dùng transaction và `ON DUPLICATE KEY UPDATE`, nên có thể chạy lại mà không tạo bản ghi trùng. MariaDB dùng cú pháp này thay cho PostgreSQL `ON CONFLICT`.

## Kiểm tra

```sql
SELECT COUNT(*) FROM categories
WHERE name IN ('Mì Kim Chi', 'Mì Lẩu Thái', 'Món Thêm Mì', 'Topping Thêm');

SELECT COUNT(*) FROM menu_items;
SELECT COUNT(*) FROM toppings;
SELECT COUNT(*) FROM product_toppings;
```

Kết quả dữ liệu menu trên database sạch lần lượt là `4`, `10`, `13`, `0`. Các truy vấn nghiệp vụ mẫu nằm trong `database/menu_queries.sql`; dấu `:name` là placeholder cần được bind ở backend, không chạy trực tiếp như SQL literal trong phpMyAdmin.

Có thể chạy kiểm tra tự động từ thư mục dự án:

```bash
node database/verify_menu.js
```
