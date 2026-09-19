import { db } from '../config/db';

export class MetricRepository {
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

  // Thêm hàm truy xuất dữ liệu lịch sử để nạp vào mô hình AI
  public async getMetricsHistory(deviceId: string, metricType: string, limit: number = 50) {
    // Lấy N bản ghi gần nhất theo thứ tự thời gian tăng dần
    const query = `
      SELECT value, EXTRACT(EPOCH FROM recorded_at) * 1000 as timestamp 
      FROM metrics 
      WHERE device_id = $1 AND metric_type = $2 
      ORDER BY recorded_at ASC 
      LIMIT $3
    `;
    try {
      const result = await db.query(query, [deviceId, metricType, limit]);
      return result.rows.map(row => ({
        value: parseFloat(row.value),
        timestamp: parseFloat(row.timestamp)
      }));
    } catch (error) {
      console.error('Lỗi khi truy xuất lịch sử Metric:', error);
      return [];
    }
  }
}
