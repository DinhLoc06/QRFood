-- Idempotent seed for the Mì Kim Chi source menu.
SET NAMES utf8mb4;
START TRANSACTION;

INSERT INTO `categories` (`name`, `sort_order`) VALUES
  ('Mì Kim Chi', 1), ('Mì Lẩu Thái', 2), ('Món Thêm Mì', 3), ('Topping Thêm', 4)
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`);

INSERT INTO `menu_items` (`category_id`, `name`, `description`, `price`, `image_path`, `is_active`)
SELECT c.id, v.name, NULL, v.price, NULL, 1
FROM (
  SELECT 'Mì Kim Chi' category_name, 'Mì Kim Chi Cá' name, 39000 price UNION ALL
  SELECT 'Mì Kim Chi', 'Mì Kim Chi Sườn Sụn', 45000 UNION ALL
  SELECT 'Mì Kim Chi', 'Mì Kim Chi Đùi Gà', 45000 UNION ALL
  SELECT 'Mì Kim Chi', 'Mì Kim Chi Xúc Xích Cá Viên', 35000 UNION ALL
  SELECT 'Mì Kim Chi', 'Mì Kim Chi Thập Cẩm', 60000 UNION ALL
  SELECT 'Mì Lẩu Thái', 'Mì Lẩu Thái Bạch Tuộc', 49000 UNION ALL
  SELECT 'Mì Lẩu Thái', 'Mì Lẩu Thái Bò Mỹ Cuộn Nấm', 51000 UNION ALL
  SELECT 'Mì Lẩu Thái', 'Mì Lẩu Thái Cá', 42000 UNION ALL
  SELECT 'Mì Lẩu Thái', 'Mì Lẩu Thái Hải Sản', 48000 UNION ALL
  SELECT 'Mì Lẩu Thái', 'Mì Lẩu Thái Bò', 45000
) v JOIN `categories` c ON c.name = v.category_name
ON DUPLICATE KEY UPDATE `price` = VALUES(`price`), `is_active` = 1;

INSERT INTO `toppings` (`category_id`, `name`, `description`, `price`, `image_path`, `is_active`)
SELECT c.id, v.name, NULL, v.price, NULL, 1
FROM (
  SELECT 'Món Thêm Mì' category_name, 'Bạch tuộc thêm mì' name, 15000 price UNION ALL
  SELECT 'Món Thêm Mì', 'Sườn sụn thêm mì', 15000 UNION ALL
  SELECT 'Món Thêm Mì', 'Mực thêm mì', 15000 UNION ALL
  SELECT 'Món Thêm Mì', 'Đùi gà thêm mì', 15000 UNION ALL
  SELECT 'Món Thêm Mì', 'Bò Mỹ thêm mì', 15000 UNION ALL
  SELECT 'Món Thêm Mì', 'Mì thêm', 22000 UNION ALL
  SELECT 'Topping Thêm', 'Kim chi thêm mì', 12000 UNION ALL
  SELECT 'Topping Thêm', 'Rau thêm mì', 12000 UNION ALL
  SELECT 'Topping Thêm', 'Kim châm thêm mì', 12000 UNION ALL
  SELECT 'Topping Thêm', 'Xúc xích thêm mì', 12000 UNION ALL
  SELECT 'Topping Thêm', 'Cá viên thêm mì', 12000 UNION ALL
  SELECT 'Topping Thêm', 'Bò thêm mì', 15000 UNION ALL
  SELECT 'Topping Thêm', 'Tôm thêm mì', 18000
) v JOIN `categories` c ON c.name = v.category_name
ON DUPLICATE KEY UPDATE `category_id` = VALUES(`category_id`), `price` = VALUES(`price`), `is_active` = 1;

-- product_toppings deliberately remains empty: the source menu specifies no
-- rule that says which topping is allowed for which main product.
COMMIT;
