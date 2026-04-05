# PRD — Phố Ẩm Thực Vĩnh Khánh (Living Document)

**Version:** 1.1  
**Cập nhật:** 2026-04-03  
**Trạng thái:** Đồng bộ với implementation hiện tại

Tài liệu gốc v1.0 (2026-03-01) được **cập nhật** để phản ánh stack và hành vi thực tế trong repo. Các mục gạch ngang là thay đổi so với bản nháp ban đầu.

---

## 1. Tầm nhìn & MVP

Không đổi: web guest (không đăng nhập) + dashboard Admin/Chủ quán + JWT + geofence + đa ngôn ngữ + analytics cơ bản + QR.

**Điều chỉnh phạm vi implementation**

| Hạng mục gốc | Thực tế trong code |
|--------------|--------------------|
| PostgreSQL | **MySQL 8** (`food_tour`) |
| Công thức khoảng cách đơn giản (lat/lng) | **Haversine** (chính xác hơn cho geofence) |
| Chỉ audio thu sẵn (MVP) | Có pipeline **dịch + TTS** (Python `translate-service`, `tts-service`); PRD coi là *tăng cường MVP*, vẫn hỗ trợ `audio_file_url` |
| Đa ngôn ngữ UI guest Vi/En/Zh | Guest chọn **vi | en | zh**; backend có thể có thêm ngôn ngữ từ pipeline dịch |
| Heatmap | **Chưa visualize**; có **POST `/api/analytics/location`** + bảng `user_locations` (log tối đa theo rate phía client ~10s) |
| Redis cache | **Chưa bắt buộc** trong repo |

**Workflow chủ quán (bổ sung so với PRD gốc)**

- POI do **OWNER** tạo → trạng thái **PENDING**, không hiển thị guest cho đến khi **ADMIN** duyệt (**APPROVED**).
- Sau duyệt: hệ thống có thể **dịch + sinh audio** (tùy cấu hình service).

---

## 2. Vai trò & API chính

### 2.1 Guest

- Session: `POST/GET/PATCH /api/sessions`
- `PATCH` hỗ trợ `preferredLanguage` và cập nhật tour qua cờ `patchTour` + `currentTourId` (xem §9).

### 2.2 Admin / Owner

- POI: CRUD, duyệt `PATCH /api/pois/{id}/approve` (Admin).
- Tour: CRUD; xóa tour = **soft delete** (`is_active = false`).
- Analytics: `GET /api/analytics/top-pois?period=7d|30d|all`, `GET /api/analytics/dashboard` (Admin).

### 2.3 QR

- **POST** `/api/qr/{poiId}` — tạo mã (Admin). Nếu không gửi `qrValue`, server **tự sinh UUID**.
- **GET** `/api/qr/{qrValue}` — guest resolve POI + nội dung (query `?lang=vi|en|zh`, mặc định `vi`, fallback `vi`).

---

## 3. Yêu cầu chức năng (tóm tắt đã map code)

| ID | Nội dung | Ghi chú implementation |
|----|-----------|-------------------------|
| FR-GEO-1 | GPS foreground | `watchPosition` trên web guest |
| FR-GEO-2 | Khoảng cách | **Haversine** (thay công thức đơn giản trong PRD gốc) |
| FR-GEO-6 | Cooldown 30s | `useGeofence.js` |
| FR-GEO-7 | Dừng khi ra khỏi geofence | `stop()` khi người chơi ra khỏi `trigger_radius` của POI đang phát |
| FR-GEO-8 | Một luồng phát + queue | `AudioContext` |
| FR-TOUR-5 | `current_tour_id` trên session | `UpdateSessionRequest.patchTour` + `currentTourId` |
| FR-TOUR-6 | Ưu tiên thứ tự tour | Guest tải thứ tự POI từ `GET /tours/{id}`; geofence lọc/sắp theo thứ tự |
| FR-QR-1–4 | UUID + resolve | POST tự UUID; GET resolve |
| FR-ANA-1 | Play history có `language` | Cột `language` trên `play_history` + body log |
| FR-ANA-2 | Top POI theo khoảng thời gian | `?period=7d\|30d\|all` |
| FR-ANA-4 | Log vị trí | `user_locations` + POST `/api/analytics/location` |

---

## 4. Mô hình dữ liệu (bổ sung)

**`play_history`**

- Thêm: `language` VARCHAR(10) (vi|en|zh hoặc mã backend).

**`user_locations`**

- `id`, `session_id`, `latitude`, `longitude`, `recorded_at`.

**`tours` / `tour_pois`**

- Tạo tour kèm danh sách `pois: [{ poiId, orderIndex }]` trong một lần lưu.
- Xóa tour: **soft delete**.

---

## 5. API (contract đã triển khai hoặc dự kiến)

Chi tiết đầy đủ trong mã nguồn `backend/api`. Điểm khác PRD gốc:

- Cập nhật duration play: **`PATCH`** `/api/analytics/play-event/{id}` (giữ tương thích; có thể thêm `PUT` nếu cần).
- Top POI: **`GET`** `/api/analytics/top-pois?period=7d|30d|all`
- Session **`PATCH`**:  
  ```json
  { "preferredLanguage": "en", "patchTour": true, "currentTourId": 1 }
  ```  
  Chỉ khi `patchTour: true` mới cập nhật `currentTourId` (cho phép `null` để rời tour).

---

## 6. Out-of-scope / v2 (giữ nguyên tinh thần bản gốc)

- Heatmap UI
- Background GPS liên tục
- Thanh toán, đánh giá, tour cá nhân do guest tạo, social real-time

---

*Tài liệu này là “living PRD”: khi đổi code hãy cập nhật mục tương ứng.*
