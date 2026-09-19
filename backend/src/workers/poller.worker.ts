import cron from 'node-cron';
import { DeviceRepository } from '../repositories/device.repository';
import { MetricRepository } from '../repositories/metric.repository';
import { MonitoringService } from '../services/monitoring.service';
import { EmailService } from '../services/email.service';

export class PollerWorker {
  private deviceRepo = new DeviceRepository();
  private metricRepo = new MetricRepository();
  private monitorService = new MonitoringService();
  private emailService = new EmailService();

  // Khai báo Cache để lưu trạng thái cảnh báo, tránh spam gửi hàng ngàn Email liên tục
  private alertCache = new Map<string, boolean>();

  public start() {
    cron.schedule('* * * * *', async () => {
      console.log('🔄 [Poller Engine] Bắt đầu tiến trình thu thập dữ liệu (Cronjob 1m)...');
      
      try {
        const devices = await this.deviceRepo.findAll();
        
        if (devices.length === 0) {
            console.log('⚠️ [Poller Engine] Chưa có thiết bị nào trong Database.');
            return;
        }

        for (const device of devices) {
          console.log(`Đang quét thiết bị: ${device.name} (IP: ${device.ip_address})`);
          
          const pingResult = await this.monitorService.checkPingStatus(device.ip_address);
          
          if (pingResult.isAlive && typeof pingResult.latency === 'number') {
            await this.metricRepo.saveMetric(device.id, 'PING', pingResult.latency, 'ms');
            
            // Xoá cache cảnh báo nếu thiết bị sống lại
            if (this.alertCache.get(`${device.id}_down`)) {
               this.alertCache.set(`${device.id}_down`, false);
               console.log(`✅ Thiết bị ${device.name} đã khôi phục kết nối.`);
            }

            try {
               const snmpData = await this.monitorService.getSnmpMetrics(device.ip_address, device.snmp_community);
               
               if (snmpData.cpuUsagePercent !== undefined && !isNaN(snmpData.cpuUsagePercent)) {
                 await this.metricRepo.saveMetric(device.id, 'CPU', snmpData.cpuUsagePercent, '%');
                 
                 // KỊCH BẢN CẢNH BÁO EMAIL: CPU quá tải (> 90%)
                 if (snmpData.cpuUsagePercent > 90) {
                    const cacheKey = `${device.id}_cpu`;
                    if (!this.alertCache.get(cacheKey)) {
                       await this.emailService.sendAlert(device.name, device.ip_address, `CPU quá tải nghiêm trọng (${snmpData.cpuUsagePercent}%)`);
                       this.alertCache.set(cacheKey, true); // Đánh dấu đã gửi Email
                    }
                 } else {
                    this.alertCache.set(`${device.id}_cpu`, false); // Reset cache nếu CPU hạ xuống mức an toàn
                 }
               }
               
               if (snmpData.memUsagePercent !== undefined && !isNaN(snmpData.memUsagePercent)) {
                 await this.metricRepo.saveMetric(device.id, 'RAM', snmpData.memUsagePercent, '%');
               }
            } catch (snmpErr) {
               console.error(`⚠️ Thiết bị ${device.name} không phản hồi SNMP.`);
            }
            
          } else {
            console.error(`❌ Thiết bị ${device.name} DOWN (Rớt mạng / Timeout)`);
            await this.metricRepo.saveMetric(device.id, 'PING', -1, 'ms');
            
            // KỊCH BẢN CẢNH BÁO EMAIL: Thiết bị mất mạng
            const cacheKey = `${device.id}_down`;
            if (!this.alertCache.get(cacheKey)) {
                await this.emailService.sendAlert(device.name, device.ip_address, 'Thiết bị mất kết nối mạng (Tắt nguồn hoặc Rớt mạng)');
                this.alertCache.set(cacheKey, true); // Đánh dấu đã gửi Email
            }
          }
        }
        
        console.log('✅ [Poller Engine] Hoàn thành chu kỳ!');
      } catch (error) {
        console.error('Lỗi nghiêm trọng khi chạy Poller Worker:', error);
      }
    });
  }
}
