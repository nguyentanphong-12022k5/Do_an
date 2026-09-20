import { Request, Response } from 'express';
import { DeviceService } from '../services/device.service';
import { CreateDeviceDto } from '../dtos/device.dto';
import { DiscoveryService } from '../services/discovery.service';
import { AiService } from '../services/ai.service';
import { MetricRepository } from '../repositories/metric.repository';

export class DeviceController {
  private deviceService = new DeviceService();
  private discoveryService = new DiscoveryService();
  private aiService = new AiService();
  private metricRepo = new MetricRepository();

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

  public async deleteDevice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.deviceService.deleteDevice(id);
      res.status(200).json({ success: true, message: 'Đã xóa thiết bị thành công' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public async toggleMuteDevice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const newStatus = await this.deviceService.toggleMute(id);
      res.status(200).json({ success: true, message: 'Đã cập nhật trạng thái thông báo', mute_alerts: newStatus });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public async scanNetwork(req: Request, res: Response): Promise<void> {
    try {
      const { subnetBase } = req.body;
      let results = [];

      // Phân luồng: Nếu người dùng truyền "auto" hoặc không truyền gì, tự động quét mọi mạng LAN
      if (!subnetBase || subnetBase === 'auto') {
        results = await this.discoveryService.scanAllLocalSubnets();
      } else {
        // Quét đúng 1 dải IP do người dùng chỉ định
        results = await this.discoveryService.scanSubnet(subnetBase);
      }
      
      res.status(200).json({ success: true, message: 'Hoàn tất quét mạng', data: results });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async getDeviceMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const metricType = (req.query.metricType as string) || 'CPU';
      const limit = parseInt((req.query.limit as string) || '30');

      const history = await this.metricRepo.getMetricsHistory(id, metricType, limit);
      res.status(200).json({ success: true, data: history });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async predictDeviceExhaustion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { metricType } = req.query;

      if (!metricType) {
        res.status(400).json({ success: false, message: 'Phải truyền metricType' });
        return;
      }

      const historicalData = await this.metricRepo.getMetricsHistory(id, metricType as string, 100);
      const prediction = this.aiService.predictExhaustion(historicalData);
      
      res.status(200).json({ success: true, data: prediction });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
