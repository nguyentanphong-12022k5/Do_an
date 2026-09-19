# Đồ án Tốt nghiệp: NetOps & Infrastructure Portal

**Tên đề tài:** Nghiên cứu, thiết kế và xây dựng hệ thống giám sát, quản trị tự động hóa hạ tầng mạng đa nền tảng (NetOps & Infrastructure Portal) hỗ trợ Web và Ứng dụng Di động.

## Mục tiêu
Xây dựng một hệ thống hoàn chỉnh từ tầng hạ tầng (Lab Environment) đến tầng ứng dụng (Backend, Web, Mobile) để giám sát và quản trị tự động hóa mạng.

## Cấu trúc thư mục
- `/docs`: Chứa tài liệu, đề cương, báo cáo, UML.
- `/lab`: Hướng dẫn cấu hình hạ tầng mạng Lab (pfSense, Linux, SNMP).
- `/backend`: Mã nguồn Backend (Node.js/Express, TypeScript, PostgreSQL, Node-Cron Worker).
- `/web`: Mã nguồn Web Portal Dashboard (React.js, Vite, TailwindCSS).
- `/mobile`: Mã nguồn Ứng dụng Mobile (Dự kiến).

---

## ⚠️ Các Lưu ý Quan trọng (Troubleshooting & Gotchas)
Để tránh các lỗi phát sinh không đáng có trong quá trình Test/Demo trước Hội đồng, vui lòng lưu ý kỹ các trường hợp sau:

**1. Lỗi Auto-Discovery không quét ra máy ảo (VM)**
*   **Nguyên nhân 1:** Máy ảo chưa được cài đặt dịch vụ SNMP. Auto-Discovery sử dụng SNMP để xác định xem thiết bị đó là Server hay chỉ là thiết bị cá nhân vãng lai. Nếu không cài SNMP, hệ thống sẽ bỏ qua.
    *   *Cách khắc phục:* Chạy lệnh `sudo apt install snmpd -y` trên máy ảo, cấu hình file `/etc/snmp/snmpd.conf` mở port udp 161 và set `rocommunity public` (Xem chi tiết tại thư mục `/lab`).
*   **Nguyên nhân 2:** Nhập sai dải mạng. Đảm bảo 3 octet đầu của IP (VD: `192.168.10`) truyền vào API quét phải khớp với dải IP thực tế của máy ảo (Dùng lệnh `ip a` trên máy ảo để kiểm tra).

**2. Lỗi Backend Crash báo "password authentication failed for user postgres"**
*   **Nguyên nhân:** Khai báo sai mật khẩu cơ sở dữ liệu.
*   **Cách khắc phục:** Mở file `backend/.env`, tìm biến `DB_PASSWORD` và đổi thành mật khẩu PostgreSQL chính xác trên máy của bạn. Nhớ **Restart lại Backend** (Ctrl + C -> `npm run dev`) để nhận cấu hình mới.

**3. Lỗi tính năng Cảnh báo Email không gửi được**
*   **Nguyên nhân:** Google không cho phép dùng mật khẩu đăng nhập bình thường để gửi mail từ code (Node.js).
*   **Cách khắc phục:** Phải tạo **Mật khẩu Ứng dụng (App Password)** gồm 16 chữ số tại `myaccount.google.com/apppasswords` và điền vào biến `EMAIL_PASS` trong file `.env`.

**4. Máy thật và Máy ảo không nhìn thấy nhau (Lỗi Ping/Timeout)**
*   **Nguyên nhân:** Cấu hình sai Network Adapter trên VMware.
*   **Cách khắc phục:** Đảm bảo máy ảo đang sử dụng card mạng `Host-Only (VMnet1)` hoặc `Bridged` để máy thật (đang chạy Backend) có thể truyền gói tin ICMP (Ping) vào máy ảo. Tránh dùng NAT nếu bạn chưa hiểu rõ về Port Forwarding.

---

## Hướng dẫn Kiểm thử (Test Demo) Hệ thống

Kịch bản này dùng để kiểm tra luồng hoạt động End-to-End của hệ thống hoặc dùng để Demo trực tiếp trước Hội đồng phản biện.

### Yêu cầu chuẩn bị
Đảm bảo 3 thành phần sau đang chạy song song:
1. **Môi trường Lab:** Đang bật máy ảo Ubuntu Server/pfSense (đã cấu hình SNMP).
2. **Backend:** Chạy lệnh `npm run dev` tại thư mục `/backend`.
3. **Frontend Web:** Chạy lệnh `npm run dev` tại thư mục `/web`.

### Kịch bản Test 1: Đưa thiết bị vào hệ thống giám sát
1. Mở công cụ **pgAdmin** kết nối tới DB `netops_db`.
2. Mở Query Tool và chạy lệnh SQL thêm thiết bị (Thay IP bằng IP máy ảo thực tế):
   ```sql
   INSERT INTO devices (name, ip_address, type, snmp_community) 
   VALUES ('Ubuntu Server', '192.168.10.10', 'LINUX', 'public');
   ```

### Kịch bản Test 2: Backend tự động thu thập dữ liệu (Polling)
1. Mở Terminal đang chạy Backend.
2. Đợi tối đa 1 phút để Cronjob (Worker) kích hoạt.
3. Quan sát Log: Hệ thống sẽ báo đang quét thiết bị, gửi Ping và thu thập thành công số liệu CPU/RAM qua SNMP.

### Kịch bản Test 3: Dashboard cập nhật thời gian thực
1. Mở trình duyệt truy cập: `http://localhost:5173`.
2. Quan sát thẻ thiết bị hiển thị **Viền xanh (UP)** kèm theo các thông số cấu hình được đồng bộ từ DB.

### Kịch bản Test 4: Giả lập sự cố rớt mạng (Downtime / NetOps)
1. Mở phần mềm ảo hóa (VMware), nhấn **Suspend** (Tạm dừng) máy ảo Ubuntu, hoặc tắt Network Adapter của nó.
2. Đợi 1 phút, quan sát Terminal Backend hiển thị lỗi: `❌ Thiết bị DOWN (Rớt mạng / Timeout)`.
3. Quay lại Web Dashboard, nhấn F5 (Tải lại trang), thiết bị sẽ lập tức chuyển sang trạng thái **Màu đỏ (DOWN)** để cảnh báo cho người quản trị.
