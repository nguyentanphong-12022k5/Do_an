# ĐỀ CƯƠNG CHI TIẾT KHÓA LUẬN TỐT NGHIỆP

**Tên đề tài:** Nghiên cứu, thiết kế và xây dựng hệ thống giám sát, quản trị tự động hóa hạ tầng mạng đa nền tảng (NetOps & Infrastructure Portal) hỗ trợ Web và Ứng dụng Di động.

---

## 1. Tính cấp thiết của đề tài
Trong môi trường doanh nghiệp hiện đại, quy mô hạ tầng mạng và máy chủ ngày càng mở rộng. Việc quản trị và giám sát thủ công gặp nhiều hạn chế:
- Khó khăn trong việc phát hiện sự cố theo thời gian thực.
- Thiếu các công cụ tự động hóa khắc phục lỗi cơ bản, dẫn đến thời gian downtime dài.
- Người quản trị cần khả năng theo dõi và xử lý sự cố linh hoạt mọi lúc mọi nơi thông qua thiết bị di động.

**Giải pháp:** Xây dựng một hệ thống tập trung (Portal) thu thập dữ liệu tự động, cảnh báo qua thiết bị di động và cho phép phản ứng nhanh với sự cố thông qua các kịch bản tự động hóa (NetOps).

## 2. Mục tiêu nghiên cứu
- **Về lý thuyết:** Nghiên cứu các giao thức giám sát mạng (SNMP, ICMP, SSH), kiến trúc hệ thống phân tán và bảo mật API.
- **Về thực hành:** Xây dựng thành công mô hình lab mạng và phát triển bộ phần mềm (Backend, Web Dashboard, Mobile App) tích hợp chặt chẽ với hạ tầng.

## 3. Phạm vi đề tài
- **Môi trường Lab:** Triển khai trên môi trường ảo hóa (VMware/Proxmox) với pfSense và máy chủ Linux (Ubuntu).
- **Giao thức:** Sử dụng SNMP (v2c/v3) để đọc metric và SSH/Bash script để tự động hóa.
- **Phần mềm:** 
  - Backend cung cấp RESTful API.
  - Web Portal cho quản trị viên cấu hình và xem biểu đồ giám sát.
  - Mobile App để nhận Push Notification (FCM) và gửi lệnh điều khiển.

## 4. Các tính năng cốt lõi (Core Features)

### 4.1. Tầng Hạ tầng & Thu thập dữ liệu (Network Engine)
- Gửi gói tin ICMP Ping để kiểm tra trạng thái Up/Down của thiết bị.
- Poll dữ liệu SNMP để thu thập metric: CPU, RAM, Disk Usage, Interface Bandwidth.
- Agent/Script chạy trên server để push log sự kiện về Backend.

### 4.2. Tầng Quản trị (Web Portal)
- **Device Management:** Thêm, sửa, xóa các thiết bị mạng và máy chủ cần giám sát.
- **Topology Map:** Vẽ sơ đồ kết nối mạng trực quan.
- **Dashboard & Monitoring:** Hiển thị biểu đồ metric (time-series) theo thời gian thực.
- **Alert Rules:** Cấu hình các ngưỡng cảnh báo (ví dụ: CPU > 80% trong 5 phút).

### 4.3. Tầng Linh hoạt (Mobile App)
- **Push Notification:** Nhận cảnh báo tức thời khi có sự cố mạng thông qua Firebase Cloud Messaging (FCM).
- **Quick Status:** Xem nhanh danh sách thiết bị lỗi.
- **Remote Action (NetOps):** Gửi lệnh khắc phục sự cố khẩn cấp (ví dụ: Restart service, Disable/Enable Interface).

## 5. Danh sách các sơ đồ UML (Dự kiến thực hiện ở Giai đoạn 2)
1. **Use Case Diagram:** Sơ đồ tổng quát cho Web Admin và Mobile User.
2. **Activity Diagram:** Luồng xử lý khi phát hiện sự cố -> Gửi cảnh báo -> User xử lý qua Mobile.
3. **Sequence Diagram:** Trình tự thu thập dữ liệu từ Agent gửi về Backend và lưu vào Database.
4. **Entity Relationship Diagram (ERD):** Thiết kế cơ sở dữ liệu.
