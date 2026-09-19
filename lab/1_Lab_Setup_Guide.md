# Hướng dẫn Thiết lập Hạ tầng Lab (Giai đoạn 3)

Để hệ thống giám sát hoạt động được, chúng ta cần một môi trường mạng giả lập (Lab) bao gồm Router/Firewall và các máy chủ. Tài liệu này cung cấp tham số chuẩn để bạn tiến hành cài đặt trên VMware Workstation, ESXi hoặc Proxmox.

## 1. Quy hoạch Địa chỉ IP (IP Schema)

Chúng ta sẽ sử dụng dải IP **192.168.10.0/24** cho mạng nội bộ (LAN) của hệ thống.

| Thiết bị (VM) | Vai trò | Card mạng (Network Adapter) | IP Address |
| :--- | :--- | :--- | :--- |
| **pfSense** | Core Router / Firewall | WAN: NAT/Bridged<br>LAN: VMnet1 / Host-Only | WAN: DHCP<br>LAN: **192.168.10.1** |
| **Ubuntu Server** | App Server / Web Server | LAN: VMnet1 / Host-Only | **192.168.10.10** |
| **Windows/Mac (Host)** | Nơi chạy code Backend | Giao tiếp qua card ảo VMnet1 | **192.168.10.100** |

## 2. Hướng dẫn Cấu hình pfSense (Kích hoạt SNMP)

pfSense sẽ đóng vai trò là cửa ngõ mạng. Chúng ta cần mở SNMP để lấy thông tin lượng truy cập băng thông (Bandwidth), CPU và RAM của Router.

1. Đăng nhập vào giao diện Web GUI của pfSense (http://192.168.10.1).
2. Chuyển đến menu **Services > SNMP**.
3. Cấu hình các thông số sau:
   - **Enable:** Tích chọn (Check) để bật SNMP.
   - **Polling Port:** `161` (Mặc định).
   - **System Location:** `Lab Room` (Tuỳ chọn).
   - **System Contact:** `admin@doan.local`
   - **SNMP Community String:** `public` (Hoặc đổi thành một chuỗi bảo mật của bạn, lưu ý phải cấu hình trùng khớp trong DB Backend).
4. Lưu cấu hình (Save) và nhấn **Apply Changes**.
5. *Lưu ý Firewall:* Vào **Firewall > Rules > LAN**, đảm bảo có rule cho phép giao thức UDP cổng 161.

## 3. Hướng dẫn Cấu hình Ubuntu Server (SNMP & SSH Agent)

Ubuntu Server đại diện cho một máy chủ cung cấp dịch vụ bên trong doanh nghiệp.

### 3.1. Cài đặt và bật SNMP
Mở terminal trên Ubuntu và chạy tuần tự các lệnh sau:

```bash
# Cập nhật và cài đặt dịch vụ SNMP
sudo apt update
sudo apt install snmpd snmp -y

# Backup file cấu hình gốc
sudo cp /etc/snmp/snmpd.conf /etc/snmp/snmpd.conf.bak

# Sửa file cấu hình
sudo nano /etc/snmp/snmpd.conf
```

Trong file `snmpd.conf`, tìm và sửa các dòng sau:
1. Sửa địa chỉ lắng nghe (Cho phép máy bên ngoài truy cập):
   Đổi `agentaddress  127.0.0.1,[::1]` thành `agentaddress  udp:161,udp6:[::1]:161`
2. Đảm bảo cấu hình Community:
   Thêm hoặc mở khoá dòng `rocommunity public` (Chỉ cho phép Đọc dữ liệu).

Lưu file (Ctrl+O, Enter, Ctrl+X) và khởi động lại dịch vụ:
```bash
sudo systemctl restart snmpd
sudo systemctl enable snmpd
```

### 3.2. Cấu hình SSH để hỗ trợ NetOps (Điều khiển từ xa)
Backend Node.js sẽ dùng SSH để gửi lệnh sửa lỗi (Ví dụ restart một service đang treo).

```bash
# Cài đặt OpenSSH Server (thường có sẵn)
sudo apt install openssh-server -y

# Khởi động dịch vụ
sudo systemctl enable ssh
sudo systemctl start ssh
```

## 4. Kiểm tra cấu hình (Testing)
Từ máy tính Host (nơi chạy Backend), hãy mở Command Prompt hoặc PowerShell (cần cài đặt công cụ snmpwalk) và test:

```bash
# Test lấy tên thiết bị của pfSense
snmpwalk -v 2c -c public 192.168.10.1 sysName.0

# Test lấy tên thiết bị của Ubuntu
snmpwalk -v 2c -c public 192.168.10.10 sysName.0
```
Nếu màn hình trả về đúng tên máy (Host name), nghĩa là hạ tầng Lab đã sẵn sàng để Backend kết nối tới!
