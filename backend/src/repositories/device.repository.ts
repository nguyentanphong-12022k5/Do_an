import { db } from '../config/db';
import { CreateDeviceDto } from '../dtos/device.dto';

export class DeviceRepository {
  
  /**
   * Truy vấn toàn bộ danh sách thiết bị từ PostgreSQL
   */
  public async findAll() {
    const query = 'SELECT * FROM devices ORDER BY created_at DESC';
    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Thêm thiết bị mới vào PostgreSQL
   */
  public async create(dto: CreateDeviceDto) {
    const query = `
      INSERT INTO devices (name, ip_address, type, snmp_community, ssh_user) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *;
    `;
    const values = [dto.name, dto.ipAddress, dto.type, dto.snmpCommunity || 'public', dto.sshUser || ''];
    
    const result = await db.query(query, values);
    return result.rows[0];
  }
}
