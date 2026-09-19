import cron from 'node-cron';
import { DeviceRepository } from '../repositories/device.repository';
import { MetricRepository } from '../repositories/metric.repository';
import { MonitoringService } from '../services/monitoring.service';

export class PollerWorker {
  private deviceRepo = new DeviceRepository();
  private metricRepo = new MetricRepository();
  private monitorService = new MonitoringService();

  public start() {
    // Biểu thức cron '* * * * *' nghĩa là: Chạy lặp lại vào mỗi phút (every 1 minute)
    cron.schedule('* * * * *', async () => {
      console.log('🔄 [Poller Engine] Bắt đầu tiến trình thu thập dữ liệu (Cronjob 1m)...');
      
      try {
        // 1. Lấy toàn bộ thiết bị đang có trong DB
        const devices = await this.deviceRepo.findAll();
        
        if (devices.length === 0) {
            console.log('⚠️ [Poller Engine] Chưa có thiết bị nào trong Database.');
            return;
        }

        // 2. Duyệt qua từng thiết bị để lấy dữ liệu
        for (const device of devices) {
          console.log(`Đang quét thiết bị: ${device.name} (IP: ${device.ip_address})`);
          
          // --- BƯỚC 1: KIỂM TRA PING (UP/DOWN) ---
          const pingResult = await this.monitorService.checkPingStatus(device.ip_address);
          
          if (pingResult.isAlive && typeof pingResult.latency === 'number') {
            // Ping OK -> Lưu latency vào DB
            await this.metricRepo.saveMetric(device.id, 'PING', pingResult.latency, 'ms');
            
            // --- BƯỚC 2: THU THẬP BẰNG SNMP (VÌ THIẾT BỊ ĐANG SỐNG) ---
            try {
               const snmpData = await this.monitorService.getSnmpMetrics(device.ip_address, device.snmp_community);
               
               if (snmpData.cpuUsagePercent !== undefined && !isNaN(snmpData.cpuUsagePercent)) {
                 await this.metricRepo.saveMetric(device.id, 'CPU', snmpData.cpuUsagePercent, '%');
               }
               if (snmpData.memUsagePercent !== undefined && !isNaN(snmpData.memUsagePercent)) {
                 await this.metricRepo.saveMetric(device.id, 'RAM', snmpData.memUsagePercent, '%');
               }
            } catch (snmpErr) {
               console.error(`⚠️ Thiết bị ${device.name} không phản hồi SNMP. (Check cấu hình community string hoặc port UDP 161)`);
            }
            
          } else {
            console.error(`❌ Thiết bị ${device.name} DOWN (Rớt mạng / Timeout)`);
            // Lưu Ping = -1 để báo động trên biểu đồ Web Dashboard là mạng rớt
            await this.metricRepo.saveMetric(device.id, 'PING', -1, 'ms');
          }
        }
        
        console.log('✅ [Poller Engine] Hoàn thành chu kỳ!');
      } catch (error) {
        console.error('Lỗi nghiêm trọng khi chạy Poller Worker:', error);
      }
    });
  }
}
