import { CreateDeviceDto } from '../dtos/device.dto';

// Ở phase này chúng ta tạm mock DB (sẽ dùng PostgreSQL pg ở Giai đoạn 3)
export class DeviceRepository {
  private mockDevices: any[] = [];

  public async findAll() {
    return this.mockDevices;
  }

  public async create(dto: CreateDeviceDto) {
    const newDevice = {
      id: Math.random().toString(36).substring(7),
      ...dto,
      createdAt: new Date(),
    };
    this.mockDevices.push(newDevice);
    return newDevice;
  }
}
