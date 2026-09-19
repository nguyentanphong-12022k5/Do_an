import { DeviceRepository } from '../repositories/device.repository';
import { CreateDeviceDto } from '../dtos/device.dto';

export class DeviceService {
  private deviceRepository = new DeviceRepository();

  public async getAllDevices() {
    // Business logic: Ví dụ kiểm tra quyền (RBAC) trước khi lấy dữ liệu
    return await this.deviceRepository.findAll();
  }

  public async createDevice(dto: CreateDeviceDto) {
    // Business logic: Validate định dạng IP hoặc kiểm tra trùng lặp
    if (!dto.ipAddress) {
      throw new Error('IP Address is required');
    }
    return await this.deviceRepository.create(dto);
  }
}
