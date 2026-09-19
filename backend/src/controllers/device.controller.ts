import { Request, Response } from 'express';
import { DeviceService } from '../services/device.service';
import { CreateDeviceDto } from '../dtos/device.dto';

export class DeviceController {
  private deviceService = new DeviceService();

  public async getAllDevices(req: Request, res: Response): Promise<void> {
    try {
      const devices = await this.deviceService.getAllDevices();
      res.status(200).json({ success: true, data: devices });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createDevice(req: Request, res: Response): Promise<void> {
    try {
      const dto: CreateDeviceDto = req.body;
      const newDevice = await this.deviceService.createDevice(dto);
      res.status(201).json({ success: true, data: newDevice });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
