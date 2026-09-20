import { DeviceRepository } from '../repositories/device.repository';
import { CreateDeviceDto } from '../dtos/device.dto';
import { Device } from '../models/device.model';

export class DeviceService {
  private deviceRepository = new DeviceRepository();

  public async getAllDevices(): Promise<Device[]> {
    return this.deviceRepository.findAll();
  }

  public async createDevice(dto: CreateDeviceDto): Promise<Device> {
    // Basic validation
    if (!dto.name || !dto.ipAddress) {
      throw new Error('Name and IP Address are required');
    }

    const deviceData = {
      name: dto.name,
      ip_address: dto.ipAddress,
      type: dto.type || 'UNKNOWN',
      snmp_community: dto.snmpCommunity || 'public',
      ssh_user: dto.sshUser
    };

    return this.deviceRepository.create(deviceData);
  }

  // Hàm xử lý logic Xóa thiết bị
  public async deleteDevice(id: string): Promise<void> {
    const success = await this.deviceRepository.delete(id);
    if (!success) {
      throw new Error('Không tìm thấy thiết bị để xóa hoặc đã bị xóa trước đó.');
    }
  }

  public async toggleMute(id: string): Promise<boolean> {
    const device = await this.deviceRepository.findById(id);
    if (!device) throw new Error('Không tìm thấy thiết bị');
    
    const newMuteStatus = !device.mute_alerts;
    await this.deviceRepository.updateMuteStatus(id, newMuteStatus);
    return newMuteStatus;
  }
}
