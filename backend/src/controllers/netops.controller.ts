import { Request, Response } from 'express';
import { SshService } from '../services/ssh.service';
import { DeviceRepository } from '../repositories/device.repository';

export class NetopsController {
  private sshService = new SshService();
  private deviceRepo = new DeviceRepository();

  public async executeRemoteCommand(req: Request, res: Response): Promise<void> {
    try {
      const { deviceId, command, password } = req.body;

      if (!deviceId || !command) {
        res.status(400).json({ success: false, message: 'Thiếu deviceId hoặc command' });
        return;
      }

      // 1. Tìm IP và Username của thiết bị trong Database
      const devices = await this.deviceRepo.findAll();
      const device = devices.find(d => d.id === deviceId);

      if (!device) {
        res.status(404).json({ success: false, message: 'Không tìm thấy thiết bị' });
        return;
      }

      if (!device.ssh_user) {
        res.status(400).json({ success: false, message: 'Thiết bị chưa được cấu hình tài khoản SSH (ssh_user)' });
        return;
      }

      // 2. Thực thi lệnh qua SSH
      const output = await this.sshService.executeCommand(
        device.ip_address,
        device.ssh_user,
        command,
        password // Nhận từ giao diện Web khi quản trị viên nhập
      );

      // 3. Trả kết quả Terminal về cho Web
      res.status(200).json({ 
        success: true, 
        message: 'Lệnh đã được thực thi thành công',
        output: output 
      });

    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
