import { NodeSSH } from 'node-ssh';

export class SshService {
  private ssh = new NodeSSH();

  /**
   * Thực thi lệnh bash từ xa thông qua SSH (NetOps Automation)
   */
  public async executeCommand(host: string, username: string, command: string, password?: string): Promise<string> {
    try {
      // Thiết lập kết nối SSH
      await this.ssh.connect({
        host: host,
        username: username,
        password: password, // Trong thực tế enterprise nên dùng Private Key thay vì Password
        tryKeyboard: true,
      });

      console.log(`[NetOps SSH] Đã kết nối tới ${host}. Đang chạy lệnh: ${command}`);
      
      // Thực thi lệnh bash
      const result = await this.ssh.execCommand(command, { cwd: '/' });
      
      // Ngắt kết nối để giải phóng tài nguyên
      this.ssh.dispose();
      
      if (result.stderr) {
        console.warn(`[NetOps SSH] Cảnh báo từ ${host}:`, result.stderr);
        // Trả về cả output và error để Admin biết (có những lệnh ghi ra stderr nhưng vẫn là success)
        return result.stdout ? result.stdout : result.stderr;
      }
      
      return result.stdout;
    } catch (error: any) {
      console.error(`[NetOps SSH] ❌ Kết nối thất bại tới ${host}:`, error.message);
      throw new Error(`Kết nối SSH thất bại: ${error.message}`);
    }
  }
}
