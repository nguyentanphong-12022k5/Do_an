import * as snmp from 'net-snmp';
import * as ping from 'ping';

export class MonitoringService {
  /**
   * Bộ OID (Object Identifier) chuẩn hóa cho hệ thống Linux và pfSense (UCD-SNMP-MIB)
   */
  private readonly OIDS = {
    sysName: '1.3.6.1.2.1.1.5.0',             // Tên thiết bị
    cpuIdle: '1.3.6.1.4.1.2021.11.11.0',      // % CPU đang rảnh
    memTotalReal: '1.3.6.1.4.1.2021.4.5.0',   // Tổng dung lượng RAM (KB)
    memAvailReal: '1.3.6.1.4.1.2021.4.6.0',   // Dung lượng RAM còn trống (KB)
  };

  /**
   * Hàm Ping: Kiểm tra xem thiết bị có đang hoạt động (UP/DOWN) không
   * @param ipAddress Địa chỉ IP của thiết bị (VD: 192.168.10.1)
   */
  public async checkPingStatus(ipAddress: string): Promise<{ isAlive: boolean; latency: number | 'unknown' }> {
    try {
      const result = await ping.promise.probe(ipAddress, { timeout: 2 });
      return {
        isAlive: result.alive,
        latency: result.time, // ms
      };
    } catch (error) {
      console.error(`Lỗi khi ping tới ${ipAddress}:`, error);
      return { isAlive: false, latency: 'unknown' };
    }
  }

  /**
   * Hàm SNMP: Thu thập số liệu (Metric) CPU, RAM, SysName từ máy ảo
   * @param ipAddress Địa chỉ IP (VD: 192.168.10.10)
   * @param community Chuỗi cộng đồng SNMP (Mặc định: public)
   */
  public async getSnmpMetrics(ipAddress: string, community: string = 'public'): Promise<any> {
    return new Promise((resolve, reject) => {
      // Mở phiên kết nối SNMP v2c
      const session = snmp.createSession(ipAddress, community, { version: snmp.Version2c });
      const oidsToFetch = [
        this.OIDS.sysName,
        this.OIDS.cpuIdle,
        this.OIDS.memTotalReal,
        this.OIDS.memAvailReal,
      ];

      session.get(oidsToFetch, (error: any, varbinds: any[]) => {
        if (error) {
          console.error(`Không thể kết nối SNMP tới ${ipAddress}`, error);
          reject(error);
          return;
        }

        const metrics: any = { ipAddress };

        // Xử lý dữ liệu thô trả về từ OID
        for (let i = 0; i < varbinds.length; i++) {
          if (snmp.isVarbindError(varbinds[i])) {
            console.error(snmp.varbindError(varbinds[i]));
          } else {
            const oid = varbinds[i].oid;
            const value = varbinds[i].value.toString();

            if (oid === this.OIDS.sysName) metrics.sysName = value;
            if (oid === this.OIDS.cpuIdle) metrics.cpuUsagePercent = 100 - parseInt(value); // Công thức: 100 - Idle
            if (oid === this.OIDS.memTotalReal) metrics.memTotalKB = parseInt(value);
            if (oid === this.OIDS.memAvailReal) metrics.memAvailKB = parseInt(value);
          }
        }

        // Tính phần trăm RAM đã sử dụng
        if (metrics.memTotalKB && metrics.memAvailKB) {
          const usedMem = metrics.memTotalKB - metrics.memAvailKB;
          metrics.memUsagePercent = parseFloat(((usedMem / metrics.memTotalKB) * 100).toFixed(2));
        }

        session.close();
        resolve(metrics);
      });
    });
  }
}
