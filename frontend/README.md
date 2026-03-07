# App Thuyết Minh AI - Frontend

Dự án Frontend cho ứng dụng di động "Thuyết Minh AI Phố Ẩm Thực Vĩnh Khánh" được xây dựng bằng React Native thông qua Expo.

## Yêu cầu hệ thống (Prerequisites)
- [Node.js](https://nodejs.org/) (phiên bản LTS)
- Ứng dụng **Expo Go** trên điện thoại (iOS/Android) hoặc cài đặt Emulator/Simulator trên máy tính.

## Cài đặt (Installation)
Chuyển vào thư mục frontend và cài đặt các dependencies:
```bash
cd frontend
npm install
```

## Chạy ứng dụng (Running the app)
Khởi động Expo server:
```bash
npm start
```
- **Trên điện thoại thật:** Mở ứng dụng **Expo Go** và quét mã QR hiện ra trên terminal. (Đảm bảo điện thoại và máy tính dùng chung mạng Wi-Fi).
- **Trên Android Emulator:** Nhấn phím `a` trên terminal.
- **Trên iOS Simulator:** Nhấn phím `i` trên terminal (chỉ dành cho macOS).

## Cấu trúc thư mục (Folder Structure)

```text
frontend/
├── App.js                 # Điểm vào chính của ứng dụng, chứa cấu hình điều hướng (Navigator).
├── package.json           # Thông tin dự án và danh sách thư viện (dependencies).
└── src/                   # Thư mục mã nguồn chính.
    ├── screens/           # Chứa các giao diện (screens) của ứng dụng.
    │   ├── HomeScreen.js  # Trang chủ (Banner, Menu, Nổi bật).
    │   ├── ListScreen.js  # Danh sách quán ăn (Bộ lọc, Tìm kiếm).
    │   ├── TourScreen.js  # Quản lý và theo dõi Tour cá nhân/hệ thống.
    │   ├── MapScreen.js   # Bản đồ hiển thị vị trí các quán ăn.
    │   └── IntroScreen.js # Giới thiệu chi tiết Lịch sử & Văn hóa (Có các tab).
    ├── navigation/        # (Dự kiến) Chứa các file cấu hình stack/tab navigation nếu mở rộng.
    ├── components/        # (Dự kiến) Chứa các UI component dùng chung có thể tái sử dụng.
    └── constants/         # (Dự kiến) Chứa các biến dùng chung (màu sắc, cấu hình, v.v.).
```

## Công nghệ sử dụng
- **Framework:** React Native (Expo)
- **Điều hướng:** React Navigation (`@react-navigation/bottom-tabs`, `@react-navigation/native-stack`)
- **UI & Icons:** `@expo/vector-icons` (Ionicons)
- **Bản đồ:** `react-native-maps`

## Ghi chú thêm
- Hiện tại UI đang dùng dữ liệu giả (mock data) cứng trong các file mã nguồn.
- Trong tương lai, các api call tới thư mục `backend` (Spring Boot) sẽ được tích hợp để lấy dữ liệu thực tế.
