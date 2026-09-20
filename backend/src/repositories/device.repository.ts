import { db } from '../config/db';
import { Device } from '../models/device.model';

export class DeviceRepository {
  public async findAll(): Promise<Device[]> {
    const result = await db.query('SELECT * FROM devices ORDER BY created_at DESC');
    return result.rows;
  }

  public async findById(id: string): Promise<Device | null> {
    const result = await db.query('SELECT * FROM devices WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  public async create(device: Partial<Device>): Promise<Device> {
    const query = `
      INSERT INTO devices (name, ip_address, type, snmp_community, ssh_user) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `;
    const values = [device.name, device.ip_address, device.type, device.snmp_community, device.ssh_user];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  public async updateStatus(id: string, status: 'UP' | 'DOWN' | 'WARNING'): Promise<void> {
    await db.query('UPDATE devices SET status = $1, last_checked = NOW() WHERE id = $2', [status, id]);
  }

  // Hàm xóa thiết bị mới được thêm vào
  public async delete(id: string): Promise<boolean> {
    await db.query('DELETE FROM metrics WHERE device_id = $1', [id]);
    const result = await db.query('DELETE FROM devices WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Hàm Bật/Tắt thông báo
  public async updateMuteStatus(id: string, mute: boolean): Promise<void> {
    await db.query('UPDATE devices SET mute_alerts = $1 WHERE id = $2', [mute, id]);
  }
}
