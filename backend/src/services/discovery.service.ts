import * as ping from 'ping';
import { MonitoringService } from './monitoring.service';
import { DeviceRepository } from '../repositories/device.repository';

export class DiscoveryService {
  private monitorService = new MonitoringService();
  private deviceRepo = new DeviceRepository();

  /**
   * Quét tự động một dải mạng (Subnet) để tìm các thiết bị đang sống
   * @param subnetBase 3 octet đầu của IP (VD: "192.168.10")
   */
  public async scanSubnet(subnetBase: string): Promise<any[]> {
    console.log(`[Auto-Discovery] Bắt đầu quét dải mạng ${subnetBase}.1 đến ${subnetBase}.254...`);
    const promises = [];
    const discoveredDevices = [];

    // Gửi gói tin Ping đồng loạt tới 254 IP trong mạng nội bộ
    for (let i = 1; i <= 254; i++) {
      const ip = `${subnetBase}.${i}`;
      promises.push(this.checkAndAddDevice(ip));
    }

    // Chờ toàn bộ tiến trình Ping quét xong (rất nhanh vì chạy bất đồng bộ)
    const results = await Promise.allSettled(promises);
    
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        discoveredDevices.push(result.value);
      }
    }
    
    console.log(`[Auto-Discovery] Quét hoàn tất. Tìm thấy ${discoveredDevices.length} thiết bị.`);
    return discoveredDevices;
  }

  private async checkAndAddDevice(ip: string) {
    // Ping nhanh với timeout 1 giây
    const pingRes = await ping.promise.probe(ip, { timeout: 1 });
    if (!pingRes.alive) return null; // Bỏ qua nếu IP không tồn tại (chết)

    try {
      // Máy đang sống, thử dò hỏi (query) xem nó có hỗ trợ SNMP không để lấy tên thật
      const snmpData = await this.monitorService.getSnmpMetrics(ip, 'public');
      const deviceName = snmpData.sysName || `Auto Discovered Node (${ip})`;
      
      // Kiểm tra xem IP này đã có trong Database của chúng ta chưa
      const existingDevices = await this.deviceRepo.findAll();
      const exists = existingDevices.some(d => d.ip_address === ip);

      if (!exists) {
        // Nếu chưa có -> TỰ ĐỘNG THÊM VÀO DATABASE
        const newDevice = await this.deviceRepo.create({
          name: deviceName,
          ipAddress: ip,
          type: 'LINUX',
          snmpCommunity: 'public',
          sshUser: 'root'
        });
        return { ip, name: deviceName, status: 'MỚI: Đã tự động thêm', data: newDevice };
      } else {
        return { ip, name: deviceName, status: 'CŨ: Đã có trong DB' };
      }
    } catch (error) {
      // Máy tính người dùng bình thường (không có SNMP/Không phải Server)
      return { ip, name: 'Unmanaged Device', status: 'Máy tính lạ (Không bắt được SNMP)' };
    }
  }
}
