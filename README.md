# Vĩnh Khánh Food Tour

Hệ thống gồm backend Spring Boot, **Admin dashboard** (React), **ứng dụng du khách** (React), dịch & TTS qua service Python.

## Yêu cầu

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (khuyến nghị để chạy DB + API + dịch/TTS)
- Hoặc: JDK 21, Maven, Node.js 18+, MySQL 8

## Cách 1: Chạy bằng Docker (khuyến nghị)

Từ thư mục `backend`:

```bash
cd backend
docker compose up -d --build
```

Các service:

| Service            | Port  | Mô tả                    |
|--------------------|-------|--------------------------|
| API (Spring Boot)  | 8080  | REST API chính           |
| MySQL              | 3306  | Database `food_tour`     |
| translate-service  | 5000  | Dịch văn bản             |
| tts-service        | 8000  | Tạo file MP3             |

API đã được cấu hình `TRANSLATE_URL` và `TTS_SERVICE_URL` nội bộ trong Docker network.

Sau khi container `foodtour_api` chạy, kiểm tra: `http://localhost:8080` (hoặc endpoint có sẵn của bạn).

Tạo tài khoản **Admin** lần đầu: dùng API đăng ký/seed tùy cấu hình dự án, hoặc insert user role `ADMIN` trong MySQL theo bảng `users`.

## Cách 2: Chạy backend local (không Docker)

1. Khởi động MySQL, tạo DB `food_tour` (có thể import `backend/init_schema.sql`).
2. Chạy hai service Python (hoặc chỉ cần nếu dùng chức năng dịch/TTS):

   ```bash
   cd backend/translate-service
   # cài dependency & chạy theo Dockerfile/README của thư mục
   ```

   Tương tự `backend/tts-service`.

3. Cấu hình biến môi trường cho API (ví dụ trong IDE hoặc `.env`):

   - `TRANSLATE_URL=http://localhost:5000/translate`
   - `TTS_SERVICE_URL=http://localhost:8000/generate`
   - `SPRING_DATASOURCE_*` trỏ tới MySQL

4. Build & chạy API:

   ```bash
   cd backend/api
   ./mvnw.cmd spring-boot:run
   ```

   (Linux/macOS: `./mvnw spring-boot-run`)

## Chạy Admin Dashboard

```bash
cd frontend-admin
npm install
npm run dev
```

Mặc định Vite: **http://localhost:3001** — proxy `/api` → `http://localhost:8080`.

- Đăng nhập Admin / Chủ quán theo tài khoản backend.
- Mục **Phân tích & Thống kê**: Admin xem **tổng quan** (`/api/analytics/dashboard`) và **Top POI**; Chủ quán chỉ xem phần Top POI (nếu được phép vào trang).

## Chạy ứng dụng du khách (Guest)

```bash
cd frontend-guest
npm install
npm run dev
```

Mặc định: **http://localhost:3000** — proxy `/api` → `http://localhost:8080`.

## Ghi chú

- File audio tạo ra thường nằm dưới `backend/audio/` (volume Docker map vào container API).
- Nếu dịch/TTS lỗi, kiểm tra log `translate_service` và `tts_service`, và biến `TRANSLATE_URL` / `TTS_SERVICE_URL`.
