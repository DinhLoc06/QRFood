-- Add normalized topping support to an existing QRFood database.
-- MariaDB / MySQL 5.7+; safe to run repeatedly.
SET NAMES utf8mb4;

CREATE UNIQUE INDEX IF NOT EXISTS `uk_menu_category_name`
  ON `menu_items` (`category_id`, `name`);
CREATE INDEX IF NOT EXISTS `idx_menu_name`
  ON `menu_items` (`name`);
CREATE INDEX IF NOT EXISTS `idx_menu_active_price`
  ON `menu_items` (`is_active`, `price`);

CREATE TABLE IF NOT EXISTS `toppings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `image_path` VARCHAR(512) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_toppings_name` (`name`),
  KEY `idx_toppings_category` (`category_id`),
  KEY `idx_toppings_active_price` (`is_active`, `price`),
  CONSTRAINT `fk_toppings_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `product_toppings` (
  `product_id` INT UNSIGNED NOT NULL,
  `topping_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`product_id`, `topping_id`),
  KEY `idx_product_toppings_topping` (`topping_id`),
  CONSTRAINT `fk_pt_product` FOREIGN KEY (`product_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pt_topping` FOREIGN KEY (`topping_id`) REFERENCES `toppings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
