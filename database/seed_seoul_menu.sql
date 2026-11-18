-- QRFood: tên món và mô tả tham khảo từ trang thực đơn chính thức của Mì Cay SEOUL.
-- Website không công bố bảng giá cố định; toàn bộ giá bên dưới là GIÁ MẪU, cần xác nhận theo chi nhánh.
-- Import sau database/schema.sql. Chạy lại an toàn: không xóa món cũ, không ghi đè giá đã chỉnh.
SET NAMES utf8mb4;
START TRANSACTION;

INSERT INTO `categories` (`name`, `sort_order`) VALUES
  ('Mì Kim Chi', 1),
  ('Mì Lẩu Thái', 2),
  ('Lẩu Seoul', 3),
  ('Món Trộn', 4),
  ('Tokbokki', 5),
  ('Các Loại Bánh', 6),
  ('Món Gà Seoul', 7),
  ('Phố Ăn Vặt Seoul', 8),
  ('Các Loại Nước', 9)
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`);

INSERT INTO `menu_items` (`category_id`, `name`, `description`, `price`, `image_path`, `is_active`)
SELECT c.id, v.name, v.description, v.price, v.image_path, 1
FROM (
  SELECT 'Mì Kim Chi' category_name, 'Mì Kim Chi Bò' name, 'Mì cay kim chi với thịt bò mềm và rau tươi.' description, 45000 price, 'assets/seoul-ramen-hero.png' image_path UNION ALL
  SELECT 'Mì Kim Chi', 'Mì Kim Chi Cá', 'Cá basa mềm trong nước dùng kim chi chua cay.', 39000, 'assets/seoul-ramen-hero.png' UNION ALL
  SELECT 'Mì Kim Chi', 'Mì Kim Chi Sườn Sụn', 'Sườn sụn giòn nhẹ, mì dai và nước dùng nóng hổi.', 45000, 'assets/seoul-ramen-hero.png' UNION ALL
  SELECT 'Mì Kim Chi', 'Mì Kim Chi Đùi Gà', 'Đùi gà đậm vị cùng nước dùng kim chi.', 45000, 'assets/seoul-ramen-hero.png' UNION ALL
  SELECT 'Mì Kim Chi', 'Mì Kim Chi Xúc Xích Trứng / Cá Viên', 'Mì kim chi cay với xúc xích, trứng hoặc cá viên.', 39000, 'assets/seoul-ramen-hero.png' UNION ALL
  SELECT 'Mì Kim Chi', 'Mì Kim Chi Hải Sản', 'Tôm và mực trong nước dùng kim chi chua cay.', 49000, 'assets/seoul-ramen-hero.png' UNION ALL
  SELECT 'Mì Kim Chi', 'Mì Kim Chi Bạch Tuộc', 'Bạch tuộc giòn ngọt ăn cùng mì kim chi.', 49000, 'assets/seoul-ramen-hero.png' UNION ALL
  SELECT 'Mì Kim Chi', 'Mì Kim Chi Bò Mỹ Cuộn Nấm', 'Bò Mỹ cuộn nấm kim châm trong nước dùng kim chi.', 51000, 'assets/seoul-ramen-hero.png' UNION ALL
  SELECT 'Mì Kim Chi', 'Mì Kim Chi Bò Mỹ Trứng', 'Bò Mỹ và trứng trong tô mì kim chi nóng.', 51000, 'assets/seoul-ramen-hero.png' UNION ALL
  SELECT 'Mì Kim Chi', 'Mì Kim Chi Cá Hồi', 'Cá hồi béo mềm hòa cùng nước súp kim chi.', 59000, 'assets/seoul-ramen-hero.png' UNION ALL
  SELECT 'Mì Kim Chi', 'Mì Kim Chi Thập Cẩm', 'Tô mì đầy đặn với bò, hải sản và rau.', 60000, 'assets/seoul-ramen-hero.png' UNION ALL

  SELECT 'Mì Lẩu Thái', 'Mì Lẩu Thái Bò', 'Nước dùng lẩu Thái chua cay và thịt bò.', 45000, 'assets/seoul-ramen-hero.png' UNION ALL
  SELECT 'Mì Lẩu Thái', 'Mì Lẩu Thái Cá', 'Cá basa cùng nước lẩu Thái thơm sả.', 42000, 'assets/seoul-ramen-hero.png' UNION ALL
  SELECT 'Mì Lẩu Thái', 'Mì Lẩu Thái Xúc Xích Trứng / Cá Viên', 'Mì lẩu Thái cay với xúc xích, trứng hoặc cá viên.', 39000, 'assets/seoul-ramen-hero.png' UNION ALL
  SELECT 'Mì Lẩu Thái', 'Mì Lẩu Thái Sườn Sụn', 'Sườn sụn giòn trong nước lẩu Thái thơm sả.', 45000, 'assets/seoul-ramen-hero.png' UNION ALL
  SELECT 'Mì Lẩu Thái', 'Mì Lẩu Thái Đùi Gà', 'Đùi gà mềm cùng mì và nước lẩu Thái.', 45000, 'assets/seoul-ramen-hero.png' UNION ALL
  SELECT 'Mì Lẩu Thái', 'Mì Lẩu Thái Bạch Tuộc', 'Bạch tuộc giòn ngọt trong nước lẩu Thái.', 49000, 'assets/seoul-ramen-hero.png' UNION ALL
  SELECT 'Mì Lẩu Thái', 'Mì Lẩu Thái Bò Mỹ Trứng', 'Bò Mỹ và trứng trong tô mì lẩu Thái.', 51000, 'assets/seoul-ramen-hero.png' UNION ALL
  SELECT 'Mì Lẩu Thái', 'Mì Lẩu Thái Cá Hồi', 'Cá hồi béo mềm hòa cùng nước dùng lẩu Thái.', 59000, 'assets/seoul-ramen-hero.png' UNION ALL
  SELECT 'Mì Lẩu Thái', 'Mì Lẩu Thái Thập Cẩm', 'Bò, cá và hải sản trong tô mì lẩu Thái.', 60000, 'assets/seoul-ramen-hero.png' UNION ALL
  SELECT 'Mì Lẩu Thái', 'Mì Lẩu Thái Hải Sản', 'Tôm, mực và mì trong nước dùng chua cay.', 48000, 'assets/seoul-ramen-hero.png' UNION ALL
  SELECT 'Mì Lẩu Thái', 'Mì Lẩu Thái Bạch Tuộc', 'Bạch tuộc giòn và nước lẩu Thái đậm vị.', 49000, 'assets/seoul-ramen-hero.png' UNION ALL
  SELECT 'Mì Lẩu Thái', 'Mì Lẩu Thái Bò Mỹ Cuộn Nấm', 'Bò Mỹ cuộn nấm kim châm cùng mì lẩu Thái.', 51000, 'assets/seoul-ramen-hero.png' UNION ALL

  SELECT 'Lẩu Seoul', 'Lẩu Bò', 'Nồi lẩu bò, nấm và rau cho bữa ăn cùng bạn bè.', 159000, 'assets/seoul-hotpot.png' UNION ALL
  SELECT 'Lẩu Seoul', 'Lẩu Bò Mỹ', 'Ba chỉ bò Mỹ ăn cùng nước lẩu và rau nấm.', 179000, 'assets/seoul-hotpot.png' UNION ALL
  SELECT 'Lẩu Seoul', 'Lẩu Hải Sản', 'Lẩu cay với tôm, mực, nấm và rau.', 189000, 'assets/seoul-hotpot.png' UNION ALL
  SELECT 'Lẩu Seoul', 'Lẩu Thập Cẩm', 'Bò, hải sản và rau nấm trong nồi lẩu nóng hổi.', 199000, 'assets/seoul-hotpot.png' UNION ALL

  SELECT 'Món Trộn', 'Bibimbap Bò', 'Cơm trộn thịt bò, trứng, rau củ và tương ớt Hàn Quốc.', 69000, NULL UNION ALL
  SELECT 'Món Trộn', 'Bibimbap', 'Cơm trộn rau củ, trứng và tương ớt Hàn Quốc.', 59000, NULL UNION ALL
  SELECT 'Món Trộn', 'Mì Trộn Hải Sản', 'Mì trộn xốt đậm vị với tôm và mực.', 69000, NULL UNION ALL
  SELECT 'Món Trộn', 'Mì Trộn Thập Cẩm', 'Mì trộn với bò, hải sản và xúc xích.', 75000, NULL UNION ALL
  SELECT 'Món Trộn', 'Miến Trộn Hàn Quốc', 'Miến trộn kiểu Hàn với bò và rau củ.', 59000, NULL UNION ALL
  SELECT 'Món Trộn', 'Mì Trộn Bò', 'Mì dai, thịt bò và rau tươi trộn xốt đậm vị.', 59000, NULL UNION ALL
  SELECT 'Món Trộn', 'Mì Tương Đen', 'Mì xốt tương đen với rau củ và trứng.', 59000, NULL UNION ALL

  SELECT 'Tokbokki', 'Tokbokki Truyền Thống', 'Bánh gạo và chả cá trong xốt cay ngọt.', 49000, 'assets/seoul-tteokbokki.png' UNION ALL
  SELECT 'Tokbokki', 'Tokbokki Lắc Phô Mai', 'Bánh gạo chiên giòn phủ bột phô mai.', 49000, 'assets/seoul-tteokbokki.png' UNION ALL
  SELECT 'Tokbokki', 'Tokbokki Thập Cẩm', 'Bánh gạo với bò, hải sản, chả cá và trứng cút.', 79000, 'assets/seoul-tteokbokki.png' UNION ALL
  SELECT 'Tokbokki', 'Tokbokki Bò', 'Bánh gạo xốt cay với thịt bò mềm.', 65000, 'assets/seoul-tteokbokki.png' UNION ALL
  SELECT 'Tokbokki', 'Tokbokki Hải Sản', 'Bánh gạo cùng tôm mực và xốt cay Hàn Quốc.', 69000, 'assets/seoul-tteokbokki.png' UNION ALL

  SELECT 'Các Loại Bánh', 'Bánh Takoyaki', 'Bánh viên nướng nhân bạch tuộc, phủ xốt và cá bào.', 49000, NULL UNION ALL
  SELECT 'Các Loại Bánh', 'Bánh Kimbap Chiên', 'Kimbap cuộn rong biển chiên giòn.', 49000, NULL UNION ALL
  SELECT 'Các Loại Bánh', 'Bánh Nón Hàn Quốc', 'Bánh chiên kiểu Hàn nhân đậm vị.', 39000, NULL UNION ALL
  SELECT 'Các Loại Bánh', 'Bánh Xếp Mini Lắc Phô Mai', 'Bánh xếp mini chiên giòn phủ phô mai.', 39000, NULL UNION ALL
  SELECT 'Các Loại Bánh', 'Bánh Ho-tteok', 'Bánh pancake Hàn nhân đường nâu quế.', 39000, NULL UNION ALL
  SELECT 'Các Loại Bánh', 'Bánh Sữa Tươi', 'Bánh sữa tươi chiên giòn, nhân mềm béo.', 39000, NULL UNION ALL
  SELECT 'Các Loại Bánh', 'Bánh Kimbap', 'Cơm cuộn rong biển với rau củ và nhân đậm vị.', 49000, NULL UNION ALL
  SELECT 'Các Loại Bánh', 'Bánh Xếp Hàn Quốc', 'Bánh mandu nhân thịt rau, chiên vàng giòn.', 45000, NULL UNION ALL

  SELECT 'Món Gà Seoul', 'Đùi Gà Chiên Seoul', 'Đùi gà chiên vàng giòn, thịt mềm mọng.', 69000, 'assets/seoul-chicken.png' UNION ALL
  SELECT 'Món Gà Seoul', 'Gà Cay Phô Mai', 'Gà xốt cay phủ phô mai nóng chảy.', 79000, 'assets/seoul-chicken.png' UNION ALL
  SELECT 'Món Gà Seoul', 'Gà Cuộn Rong Biển Chiên', 'Gà cuộn rong biển chiên giòn, thơm bùi.', 69000, 'assets/seoul-chicken.png' UNION ALL

  SELECT 'Phố Ăn Vặt Seoul', 'Khoai Tây Chiên', 'Khoai chiên giòn ăn cùng xốt cay.', 35000, NULL UNION ALL
  SELECT 'Phố Ăn Vặt Seoul', 'Phô Mai Que Sữa', 'Phô mai que chiên giòn, nóng và béo.', 39000, NULL UNION ALL
  SELECT 'Phố Ăn Vặt Seoul', 'Xúc Xích Chiên', 'Xúc xích chiên nóng giòn để ăn vặt.', 29000, NULL UNION ALL
  SELECT 'Phố Ăn Vặt Seoul', 'Bánh Đậu Hũ Phô Mai', 'Đậu hũ cá chiên vàng với nhân phô mai.', 39000, NULL UNION ALL
  SELECT 'Phố Ăn Vặt Seoul', 'Khoai Tây Lắc Phô Mai', 'Khoai tây chiên lắc bột phô mai.', 39000, NULL UNION ALL
  SELECT 'Phố Ăn Vặt Seoul', 'Tôm Tempura', 'Tôm tẩm bột chiên xù giòn nhẹ.', 59000, NULL UNION ALL
  SELECT 'Phố Ăn Vặt Seoul', 'Ăn Vặt Thập Cẩm', 'Khoai tây, xúc xích, há cảo và món chiên ăn kèm.', 79000, NULL UNION ALL

  SELECT 'Các Loại Nước', 'Trà Chanh', 'Trà chanh thanh mát cân bằng vị cay.', 25000, NULL UNION ALL
  SELECT 'Các Loại Nước', 'Trà Sữa Seoul', 'Trà sữa đậm vị trà, béo nhẹ.', 35000, NULL UNION ALL
  SELECT 'Các Loại Nước', 'Trà Sữa Thái', 'Trà sữa Thái thơm dịu và mát lạnh.', 35000, NULL
  UNION ALL SELECT 'Các Loại Nước', 'Trà Sữa Trân Châu', 'Trà sữa truyền thống với trân châu dai mềm.', 39000, NULL
  UNION ALL SELECT 'Các Loại Nước', 'Trà Đào Seoul', 'Trà đào thanh mát với đào ngâm.', 35000, NULL
  UNION ALL SELECT 'Các Loại Nước', 'Trà Dâu', 'Trà trái cây vị dâu chua ngọt.', 35000, NULL
  UNION ALL SELECT 'Các Loại Nước', 'Trà Ổi Hồng', 'Trà ổi hồng thanh mát.', 35000, NULL
  UNION ALL SELECT 'Các Loại Nước', 'Trà Trái Cây Nhiệt Đới', 'Trà lạnh pha cùng hương vị trái cây.', 39000, NULL
  UNION ALL SELECT 'Các Loại Nước', 'Nước Ép Thơm', 'Nước ép thơm vị chua ngọt tự nhiên.', 35000, NULL
  UNION ALL SELECT 'Các Loại Nước', 'Nước Ép Dưa Hấu', 'Nước ép dưa hấu tươi mát.', 35000, NULL
  UNION ALL SELECT 'Các Loại Nước', 'Nước Ép Cam', 'Nước ép cam tươi chua ngọt.', 35000, NULL
  UNION ALL SELECT 'Các Loại Nước', 'Yogurt Đá', 'Sữa chua đá mát lạnh.', 35000, NULL
  UNION ALL SELECT 'Các Loại Nước', 'Yogurt Xoài', 'Sữa chua mát lạnh với vị xoài.', 39000, NULL
  UNION ALL SELECT 'Các Loại Nước', 'Yogurt Dâu', 'Sữa chua mát lạnh với vị dâu.', 39000, NULL
  UNION ALL SELECT 'Các Loại Nước', 'Yogurt Việt Quất', 'Sữa chua mát lạnh với vị việt quất.', 39000, NULL
) v
JOIN `categories` c ON c.name = v.category_name
ON DUPLICATE KEY UPDATE
  `description` = IF(`menu_items`.`description` IS NULL OR `menu_items`.`description` = '', VALUES(`description`), `menu_items`.`description`),
  `image_path` = IF(`menu_items`.`image_path` IS NULL OR `menu_items`.`image_path` = '', VALUES(`image_path`), `menu_items`.`image_path`);

COMMIT;
