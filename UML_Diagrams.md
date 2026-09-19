# Sơ đồ UML Hệ thống Giám sát & NetOps

Tài liệu này bao gồm các sơ đồ UML (Use Case, Activity, và Sequence) minh họa trực quan luồng hoạt động và tương tác giữa các thành phần trong hệ thống.

## 1. Sơ đồ Use Case (Tổng quát)
Sơ đồ mô tả các tác nhân (Actors) và những chức năng chính mà họ tương tác với hệ thống.

```mermaid
flowchart LR
    %% Định nghĩa Actors
    subgraph Actors
        WA[Web Admin]
        MA[Mobile Admin]
        SYS[System/Network Agent]
    end

    %% Định nghĩa Use Cases
    subgraph Hệ thống NetOps & Infrastructure Portal
        UC1(Quản lý danh mục thiết bị)
        UC2(Xem sơ đồ mạng - Topology)
        UC3(Xem biểu đồ giám sát - Dashboard)
        UC4(Cấu hình rule cảnh báo)
        UC5(Nhận Push Notification)
        UC6(Điều khiển khắc phục từ xa)
        UC7(Thu thập và đẩy dữ liệu)
    end

    %% Phân quyền Web Admin
    WA --> UC1
    WA --> UC2
    WA --> UC3
    WA --> UC4

    %% Phân quyền Mobile Admin
    MA --> UC3
    MA --> UC5
    MA --> UC6

    %% Agent/Hệ thống
    SYS --> UC7
```

## 2. Sơ đồ Hoạt động (Activity Diagram) - Luồng xử lý sự cố khẩn cấp
Sơ đồ biểu diễn quá trình từ khi phát hiện một cảnh báo (ví dụ CPU quá tải hoặc rớt mạng) cho đến khi người quản trị dùng Mobile App để gửi lệnh khắc phục (NetOps).

```mermaid
stateDiagram-v2
    [*] --> ThuThapDuLieu: Agent/SNMP gửi metric
    ThuThapDuLieu --> KiemTraNguong: Backend phân tích
    
    KiemTraNguong --> BinhThuong: Metric an toàn
    KiemTraNguong --> PhatHienSuCo: Vượt ngưỡng cấu hình
    BinhThuong --> [*]
    
    PhatHienSuCo --> LuuCanhBao: Ghi nhận cảnh báo vào DB
    LuuCanhBao --> GuiPushNotif: Đẩy thông báo (FCM)
    GuiPushNotif --> NhanThongBao: Mobile App reo chuông/báo rung
    
    NhanThongBao --> XemChiTietLoi: Admin mở App kiểm tra
    XemChiTietLoi --> ChonHanhDong: Đưa ra quyết định
    
    ChonHanhDong --> BoQua: Không cần can thiệp
    BoQua --> [*]
    
    ChonHanhDong --> GuiLenh: Bấm nút "Khởi động lại dịch vụ"
    GuiLenh --> ThucThiSSH: Backend kết nối SSH vào Server
    ThucThiSSH --> CapNhatTrangThai: Ghi nhận kết quả xử lý
    CapNhatTrangThai --> [*]
```

## 3. Sơ đồ Tuần tự (Sequence Diagram) - Thu thập và Cảnh báo
Sơ đồ minh họa trình tự thời gian của các luồng dữ liệu (Data flow) giữa Server vật lý/ảo, Backend, Database và Mobile App.

```mermaid
sequenceDiagram
    autonumber
    participant Node as Hạ tầng Lab (ESXi/pfSense/Linux)
    participant Backend as Backend API (Spring Boot/Node.js)
    participant DB as Database (MySQL/Postgres)
    participant Mobile as Mobile App (FCM)

    loop Thu thập định kỳ (e.g. mỗi 1 phút)
        Node->>Backend: Gửi dữ liệu Metric (CPU, RAM, Disk, Port Status)
        Backend->>DB: Insert dữ liệu Time-series
        Backend->>Backend: Phân tích & So khớp Rule cảnh báo
        
        alt Nếu dữ liệu VƯỢT ngưỡng cảnh báo
            Backend->>DB: Lưu Event Log (Mức độ: WARNING/CRITICAL)
            Backend->>Mobile: Trigger API Firebase (Gửi Push Notification)
            Mobile-->>Mobile: Hiển thị Pop-up/Chuông cho Admin
        end
    end

    opt Khi có thao tác NetOps từ Mobile
        Mobile->>Backend: POST /api/v1/netops/execute (Action: Restart Service)
        Backend->>Node: Kết nối SSH & Thực thi Bash Script
        Node-->>Backend: Trả về Output (Success/Fail)
        Backend->>DB: Cập nhật trạng thái đã xử lý sự cố
        Backend-->>Mobile: Notification/Response kết quả cho Admin
    end
```
