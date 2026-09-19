import * as ping from 'ping';
import * as os from 'os';
import { MonitoringService } from './monitoring.service';
import { DeviceRepository } from '../repositories/device.repository';

export class DiscoveryService {
  private monitorService = new MonitoringService();
  private deviceRepo = new DeviceRepository();

  /**
   * Tính năng Cực kỳ Thông minh: Tự động phát hiện tất cả các dải mạng mà máy tính đang kết nối
   * (Bao gồm Wi-Fi, mạng LAN ảo của VMware VMnet1, VMnet8...)
   */
  public getLocalSubnets(): string[] {
    const interfaces = os.networkInterfaces();
    const subnets = new Set<string>();

    for (const name of Object.keys(interfaces)) {
      const netIfaces = interfaces[name];
      if (!netIfaces) continue;

      for (const net of netIfaces) {
        // Chỉ lấy IPv4 và bỏ qua mạng localhost (127.0.0.1)
        if (net.family === 'IPv4' && !net.internal) {
          const ipParts = net.address.split('.');
          const subnetBase = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}`;
          subnets.add(subnetBase);
        }
      }
    }
    return Array.from(subnets);
  }

  /**
   * Quét TẤT CẢ các dải mạng tìm thấy trên máy tính
   */
  public async scanAllLocalSubnets(): Promise<any[]> {
    const subnets = this.getLocalSubnets();
    console.log(`[Auto-Discovery] Đã tự động phát hiện các dải mạng của máy tính:`, subnets);
    
    let allResults: any[] = [];
    
    // Quét lần lượt từng dải mạng (VD: quét xong 192.168.1.x rồi mới qua 192.168.10.x)
    // Để tránh làm sập card mạng (quá tải kết nối)
    for (const subnet of subnets) {
      const results = await this.scanSubnet(subnet);
      allResults = allResults.concat(results);
    }
    
    return allResults;
  }

  /**
   * Quét 1 dải mạng cụ thể (Subnet)
   */
  public async scanSubnet(subnetBase: string): Promise<any[]> {
    console.log(`[Auto-Discovery] Đang quét dải IP: ${subnetBase}.1 đến ${subnetBase}.254...`);
    const promises = [];
    const discoveredDevices = [];

    // Gửi 254 gói tin Ping đồng loạt
    for (let i = 1; i <= 254; i++) {
      const ip = `${subnetBase}.${i}`;
      promises.push(this.checkAndAddDevice(ip));
    }

    const results = await Promise.allSettled(promises);
    
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        discoveredDevices.push(result.value);
      }
    }
    
    console.log(`[Auto-Discovery] Quét xong ${subnetBase}.x - Tìm thấy ${discoveredDevices.length} thiết bị.`);
    return discoveredDevices;
  }

  private async checkAndAddDevice(ip: string) {
    const pingRes = await ping.promise.probe(ip, { timeout: 1 });
    if (!pingRes.alive) return null;

    try {
      const snmpData = await this.monitorService.getSnmpMetrics(ip, 'public');
      const deviceName = snmpData.sysName || `Auto Discovered Node (${ip})`;
      
      const existingDevices = await this.deviceRepo.findAll();
      const exists = existingDevices.some(d => d.ip_address === ip);

      if (!exists) {
        const newDevice = await this.deviceRepo.create({
          name: deviceName,
          ip_address: ip,
          type: 'LINUX',
          snmp_community: 'public',
          ssh_user: 'root'
        });
        return { ip, name: deviceName, status: 'MỚI: Đã tự động thêm', data: newDevice };
      } else {
        return { ip, name: deviceName, status: 'CŨ: Đã có trong DB' };
      }
    } catch (error) {
      return { ip, name: 'Unmanaged Device', status: 'Máy tính lạ (Không có SNMP)' };
    }
  }
}
