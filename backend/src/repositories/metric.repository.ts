import { db } from '../config/db';

export class MetricRepository {
  /**
   * Lưu dữ liệu thông số (Metric) thu thập được vào Database
   * @param deviceId ID của thiết bị (tham chiếu bảng devices)
   * @param metricType Loại metric (CPU, RAM, PING)
   * @param value Giá trị đo được
   * @param unit Đơn vị (%, ms)
   */
  public async saveMetric(deviceId: string, metricType: string, value: number, unit: string) {
    const query = `
      INSERT INTO metrics (device_id, metric_type, value, unit) 
      VALUES ($1, $2, $3, $4)
    `;
    const values = [deviceId, metricType, value, unit];
    
    try {
      await db.query(query, values);
    } catch (error) {
      console.error(`Lỗi khi lưu DB Metric cho thiết bị ${deviceId}:`, error);
    }
  }
}
