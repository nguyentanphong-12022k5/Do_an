import { Request, Response } from 'express';
import { DeviceService } from '../services/device.service';
import { CreateDeviceDto } from '../dtos/device.dto';
import { DiscoveryService } from '../services/discovery.service';

export class DeviceController {
  private deviceService = new DeviceService();
  private discoveryService = new DiscoveryService();

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

  // API Quét tự động (Auto-Discovery)
  public async scanNetwork(req: Request, res: Response): Promise<void> {
    try {
      const { subnetBase } = req.body; // Ví dụ: "192.168.10"
      
      if (!subnetBase) {
        res.status(400).json({ success: false, message: 'Yêu cầu cung cấp dải IP (subnetBase). Ví dụ: 192.168.10' });
        return;
      }

      const results = await this.discoveryService.scanSubnet(subnetBase);
      res.status(200).json({ 
        success: true, 
        message: 'Hoàn tất quét mạng LAN',
        data: results 
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
