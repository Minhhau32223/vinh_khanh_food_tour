# Food Tour – Backend API

Spring Boot 3.2 · MySQL 8 · JWT Authentication

---

## Yêu cầu

| Công cụ | Phiên bản |
|---|---|
| Java | 21+ |
| Maven (hoặc dùng `mvnw`) | 3.9+ |
| Docker & Docker Compose | Bất kỳ bản ổn định |

---

## Cách chạy

### ✅ Cách 1: Docker Compose (khuyến nghị)

Chạy toàn bộ (MySQL + API) chỉ với một lệnh:

```bash
cd backend/api
docker-compose up -d --build
```

API sẽ chạy tại: `http://localhost:8080`
MySQL: `localhost:3306`, database: `food_tour`, password: `password`

Dừng:
```bash
docker-compose down
```

---

### ✅ Cách 2: Chỉ Docker MySQL + chạy API local

**Bước 1:** Khởi động MySQL bằng Docker:
```bash
docker run -d \
  --name foodtour_db \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=food_tour \
  -p 3306:3306 \
  -v "$(pwd)/../init_schema.sql:/docker-entrypoint-initdb.d/init_schema.sql" \
  mysql:8.0
```

**Bước 2:** Chạy API:
```bash
cd backend/api
./mvnw spring-boot:run
```

---

## Cấu hình

File: `src/main/resources/application.yml`

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/food_tour?useSSL=false&serverTimezone=UTC
    username: root
    password: password
app:
  jwt:
    secret: <your-secret-key>
    expiration-ms: 86400000   # 24 giờ
```

---

## API Endpoints

### 🔓 Auth (Public)

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/register` | Tự đăng ký (`USER` hoặc `OWNER`) |

### 🔒 Users (Chỉ ADMIN)

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/users` | Danh sách tất cả user |
| POST | `/api/users` | Tạo user mới (mọi role) |
| PATCH | `/api/users/{id}/status` | Bật/tắt tài khoản |

---

## Ví dụ sử dụng

### Đăng nhập

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

**Response:**
```json
{ "token": "eyJhbGci...", "role": "ADMIN" }
```

### Tự đăng ký (USER / OWNER)

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"owner1","password":"pass123","role":"OWNER"}'
```

### Lấy danh sách user (cần token Admin)

```bash
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer <TOKEN>"
```

---

## Tài khoản mặc định

Khi khởi động lần đầu, hệ thống tự tạo:

| Username | Password | Role |
|---|---|---|
| `admin` | `password123` | `ADMIN` |

---

## Cấu trúc thư mục

```
api/
├── src/main/java/com/foodtour/api/
│   ├── component/      # DatabaseSeeder
│   ├── controller/     # AuthController, UserController
│   ├── dto/            # Request/Response DTOs
│   ├── entity/         # User
│   ├── repository/     # UserRepository
│   ├── security/       # JWT, Filter, SecurityConfig
│   └── service/        # UserService, UserServiceImpl
├── Dockerfile
├── docker-compose.yml
└── README.md
```
