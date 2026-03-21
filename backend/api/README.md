# Food Tour Backend API

Spring Boot 3.2 · MySQL 8 · JWT · Docker

---

## 🚀 Chạy với Docker

> **Yêu cầu:** Docker Desktop đang chạy

```bash
cd backend/api

# Lần đầu hoặc khi có code mới
docker-compose up -d --build

# Lần sau (không đổi code)
docker-compose up -d
```

Kiểm tra đang chạy:
```bash
docker ps
```
Phải thấy 2 container: `foodtour_db` và `foodtour_api`

Xem log:
```bash
docker logs foodtour_api -f
```

Dừng:
```bash
docker-compose down          # giữ data
docker-compose down -v       # xóa sạch DB (reset)
```

**API:** `http://localhost:8080`  
**MySQL:** `localhost:3306` | DB: `food_tour` | Pass: `password`

---

## 🔑 Tài khoản mặc định

| Username | Password | Role |
|---|---|---|
| `admin` | `password123` | ADMIN |

---

## 📮 Test API với Postman

### Bước 1 — Cài đặt Environment (làm 1 lần)

1. Postman → **Environments** → **New**
2. Đặt tên: `Food Tour Local`
3. Thêm 2 biến:

| Variable | Initial Value |
|---|---|
| `baseUrl` | `http://localhost:8080` |
| `token` | *(để trống)* |

4. **Save** → chọn environment vừa tạo (góc trên phải Postman)

### Bước 2 — Đăng nhập để lấy Token

- Method: **POST**
- URL: `{{baseUrl}}/api/auth/login`
- Body → **raw** → **JSON**:

```json
{ "username": "admin", "password": "password123" }
```

→ Copy giá trị `token` từ response → paste vào biến `token` trong Environment

### Bước 3 — Thêm Authorization cho tất cả request

Trong mỗi request → tab **Authorization**:
- Type: **Bearer Token**
- Token: `{{token}}`

---

## 📋 Danh sách APIs

### Auth (Public — không cần token)

| Method | URL | Body |
|---|---|---|
| POST | `{{baseUrl}}/api/auth/login` | `{"username":"...","password":"..."}` |
| POST | `{{baseUrl}}/api/auth/register` | `{"username":"...","password":"...","role":"USER"}` |

> Role khi register chỉ được: `USER` hoặc `OWNER`

---

### Users (cần token ADMIN)

| Method | URL | Body |
|---|---|---|
| GET | `{{baseUrl}}/api/users` | — |
| POST | `{{baseUrl}}/api/users` | `{"username":"...","password":"...","role":"ADMIN"}` |
| PATCH | `{{baseUrl}}/api/users/1/status` | `{"isActive": false}` |

---

### POIs (GET cần token, POST/PUT cần ADMIN)

| Method | URL | Mô tả |
|---|---|---|
| GET | `{{baseUrl}}/api/pois` | Danh sách tất cả POI |
| GET | `{{baseUrl}}/api/pois/1` | Chi tiết POI ID=1 |
| GET | `{{baseUrl}}/api/pois/nearby?lat=10.7769&lng=106.6952&radius=0.5` | ⭐ Geofence 500m |
| POST | `{{baseUrl}}/api/pois` | Tạo POI mới |
| PUT | `{{baseUrl}}/api/pois/1` | Cập nhật POI |

**Body tạo POI:**
```json
{
  "name": "Phở Bò Hà Nội",
  "latitude": 10.7769,
  "longitude": 106.6952,
  "triggerRadius": 100,
  "priority": 1,
  "isActive": true
}
```

**Geofence params:**

| Param | Ý nghĩa | Ví dụ |
|---|---|---|
| `lat` | Vĩ độ | `10.7769` |
| `lng` | Kinh độ | `106.6952` |
| `radius` | Bán kính (km) | `0.5` = 500m |

---

## ❗ Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách fix |
|---|---|---|
| `403 Forbidden` | Thiếu hoặc sai token | Kiểm tra header `Authorization: Bearer <token>` |
| `401 Unauthorized` | Token hết hạn (24h) | Login lại để lấy token mới |
| `400 Bad Request` | Body JSON sai | Kiểm tra format, dùng dấu chấm cho số thập phân |
| Connection refused | Docker chưa chạy | `docker-compose up -d` |
