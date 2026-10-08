# QRFood

QRFood là hệ thống quản lý bàn, phiên đặt món và đặt hàng qua mã QR cho nhà hàng, được xây dựng bằng Java Spring Boot cho backend và React + TypeScript cho frontend. Ứng dụng hướng tới quy trình đặt món nhanh, tối ưu cho khách hàng khi ngồi tại bàn và hỗ trợ nhân viên, bếp và quản trị viên theo dõi trạng thái đơn hàng trong thời gian thực.

## Tóm tắt dự án

- Khách hàng quét mã QR tại bàn
- Hệ thống tự động chọn bàn phù hợp theo số người
- Khách chọn món, thêm vào giỏ hàng và đặt hàng
- Nhân viên xác nhận hoặc từ chối đơn
- Bếp cập nhật tiến độ: đang chuẩn bị -> sẵn sàng
- Nhân viên phục món và đóng phiên bàn
- Bàn trở về trạng thái trống sau khi session kết thúc

## Tính năng chính

### Cho khách hàng
- Màn hình bắt đầu bằng mã QR và nhập số lượng người ngồi
- Tự động gán bàn phù hợp dựa trên sức chứa tối thiểu
- Hiển thị menu theo danh mục món ăn, đồ uống và món tráng miệng
- Thêm món vào giỏ hàng và tạo đơn hàng
- Giới hạn thao tác đặt hàng chỉ khi phiên hoạt động còn hợp lệ

### Cho nhân viên nhà hàng
- Xem danh sách bàn, trạng thái và sức chứa
- Xem đơn hàng của từng session
- Duyệt hoặc từ chối đơn từ khách hàng
- Theo dõi trạng thái phục vụ và đóng phiên bàn

### Cho bếp
- Cập nhật tiến độ đơn hàng: đang chuẩn bị / đã sẵn sàng
- Theo dõi các món đang cần phục vụ

### Cho quản trị viên
- Quản lý bàn, danh mục món và sản phẩm
- Quản lý tài khoản nhân sự theo role: ADMIN, STAFF, KITCHEN
- Theo dõi tổng quan hệ thống và quy trình kinh doanh

## Kiến trúc hệ thống

### Backend
- Java 21
- Spring Boot 3.4
- Spring Web
- Spring Security + JWT
- Spring Data JPA
- PostgreSQL
- Flyway cho migration database
- OpenAPI / Swagger

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Zustand cho state management
- Axios cho gọi API

### Mô hình kiến trúc
Dự án theo kiểu monolith theo module, với các phần chính:
- auth
- table
- session
- category
- product
- order
- qr

## Cấu trúc thư mục

```text
QRFood/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/qrfood
│   │   │   └── resources/
│   │   └── test/
│   ├── pom.xml
│   └── README.md
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
├── docs/
│   ├── api.md
│   ├── architecture.md
│   ├── database.md
│   ├── requirements.md
│   ├── setup.md
│   └── progress.md
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## Luồng nghiệp vụ chính

1. Khách quét mã QR trên bàn
2. Hệ thống yêu cầu nhập số lượng người ngồi
3. Backend tìm bàn trống phù hợp theo sức chứa nhỏ nhất
4. Tạo dining session và gán bàn cho khách
5. Khách xem menu và thêm các món vào giỏ hàng
6. Khách tạo order
7. Nhân viên kiểm tra order và xác nhận hoặc từ chối
8. Bếp cập nhật trạng thái món: đang xử lý / đã sẵn sàng
9. Nhân viên phục món và đóng session
10. Bàn được trả về trạng thái AVAILABLE

## Quy tắc nghiệp vụ

- Một bàn không thể chứa hai session đang hoạt động cùng lúc
- Khách chỉ được đặt hàng khi session đang ở trạng thái ACTIVE
- Sản phẩm không còn khả dụng sẽ bị chặn
- Giá món được lưu lại tại thời điểm order được tạo
- Trạng thái đơn hàng không được bỏ qua hoặc nhảy cóc trong vòng đời
- Bàn chỉ được trả về trống sau khi phiên đã đóng và đơn hàng hoàn tất

## Yêu cầu môi trường

Trước khi chạy dự án, bạn cần:
- Java 21
- Maven
- Node.js 20+ và npm
- PostgreSQL 15+ hoặc Docker Desktop
- Git

## Thiết lập môi trường

### 1. Sao chép file cấu hình

Tại thư mục gốc, tạo file `.env` dựa trên `.env.example`:

```bash
copy .env.example .env
```

hoặc tạo thủ công với nội dung tương tự:

```env
DATABASE_URL=jdbc:postgresql://localhost:5432/qrfood
DATABASE_USERNAME=qrfood
DATABASE_PASSWORD=qrfood
JWT_SECRET=qrfood-super-secret-key-change-me
JWT_EXPIRATION=86400000
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## Chạy dự án ở local

### Backend

```bash
cd backend
mvn test
mvn spring-boot:run
```

Backend mặc định chạy tại:
- http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/v3/api-docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend mặc định chạy tại:
- http://localhost:5173

### Docker Compose

```bash
docker compose up --build
```

Sau khi chạy:
- Frontend: http://localhost:5173
- Backend: http://localhost:8080
- PostgreSQL: localhost:5433 trên máy host
- Container nội bộ kết nối PostgreSQL qua port 5432

Dừng dịch vụ:

```bash
docker compose down
```

Lưu ý: PostgreSQL trong Docker được expose ra cổng 5433 để tránh xung đột với PostgreSQL local đang chạy trên cổng 5432.

## Cơ sở dữ liệu

Project sử dụng PostgreSQL và Flyway migration. File migration khởi tạo schema và dữ liệu mẫu nằm ở:

- [backend/src/main/resources/db/migration/V1__init.sql](backend/src/main/resources/db/migration/V1__init.sql)

Các bảng chính gồm:
- users
- tables
- dining_sessions
- categories
- products
- orders
- order_items

Dữ liệu mẫu được khởi tạo sẵn gồm:
- 4 bàn: A01, A02, A03, A04
- 4 danh mục: Burger, Pizza, Drink, Dessert
- 1 tài khoản admin mặc định

## Tài khoản mặc định

```text
Username: admin
Password: admin123
```

Thông tin tài khoản mặc định được khởi tạo khi migration chạy lần đầu.

## API chính

Các endpoint quan trọng của hệ thống:

- Auth
  - POST /api/auth/login
  - POST /api/auth/refresh
  - POST /api/auth/logout

- Tables
  - GET /api/tables
  - GET /api/tables/available
  - POST /api/tables

- Sessions
  - POST /api/sessions
  - GET /api/sessions/{id}
  - POST /api/sessions/{id}/close

- Products
  - GET /api/products
  - GET /api/products/{id}
  - POST /api/products
  - PUT /api/products/{id}

- Orders
  - POST /api/orders
  - GET /api/orders
  - GET /api/orders/{id}
  - PUT /api/orders/{id}/confirm
  - PUT /api/orders/{id}/reject
  - PUT /api/orders/{id}/status

Thông tin chi tiết API được lưu ở [docs/api.md](docs/api.md).

## Tài liệu tham khảo trong dự án

- [docs/requirements.md](docs/requirements.md) — yêu cầu chức năng và nghiệp vụ
- [docs/architecture.md](docs/architecture.md) — kiến trúc và mô hình hệ thống
- [docs/setup.md](docs/setup.md) — hướng dẫn chạy local
- [docs/api.md](docs/api.md) — tổng quan API
- [docs/database.md](docs/database.md) — thiết kế dữ liệu
- [docs/progress.md](docs/progress.md) — tiến độ phát triển
- [docs/architecture-decisions.md](docs/architecture-decisions.md) — quyết định kiến trúc

## Khắc phục sự cố phổ biến

### 1. PostgreSQL port conflict
Nếu local PostgreSQL đã chạy trên cổng 5432, hãy dùng docker-compose với cổng 5433 hoặc đổi cấu hình trong file `.env` và `docker-compose.yml`.

### 2. Backend không khởi động
- Kiểm tra Java 21 đã được cài đặt
- Kiểm tra PostgreSQL đang chạy
- Kiểm tra file `.env` và biến môi trường `DATABASE_URL`

### 3. Frontend không truy cập API
- Đảm bảo backend đang chạy trên port 8080
- Kiểm tra `CORS_ALLOWED_ORIGINS` trong `.env`

### 4. Swagger không hiển thị
- Kiểm tra backend đang chạy
- Truy cập: http://localhost:8080/swagger-ui.html

## Mục tiêu phát triển và mở rộng

Dự án này có tiềm năng phát triển tiếp theo như:
- tích hợp thanh toán online và QR code từng bàn
- quản lý kho và nguyên liệu
- dashboard báo cáo doanh thu theo ngày/tháng
- tính năng loyalty / voucher / membership
- mobile app riêng cho khách hàng và nhân viên
- realtime notification với WebSocket

## Kết luận

QRFood là một project mẫu thực tế về xây dựng hệ thống đặt món trên nhà hàng theo mô hình QR ordering, gắn với quy trình nghiệp vụ rõ ràng, kiến trúc backend frontend tách biệt nhưng đồng bộ, và thể hiện tốt khả năng phát triển theo hướng production-ready. Nó phù hợp để học tập, demo, hoặc làm nền tảng cho các dự án tương tự.
