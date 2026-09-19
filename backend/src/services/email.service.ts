import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export class EmailService {
  private transporter: any;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng (App Password) của Gmail
      },
    });
  }

  /**
   * Gửi Email cảnh báo khi có sự cố
   */
  public async sendAlert(deviceName: string, ip: string, issue: string) {
    // Nếu chưa cấu hình email trong .env thì bỏ qua để không báo lỗi sập server
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('⚠️ Đã bắt được sự kiện nhưng chưa cấu hình EMAIL_USER và EMAIL_PASS trong .env nên không gửi Email.');
      return;
    }

    const receiver = process.env.ALERT_EMAIL_RECEIVER || process.env.EMAIL_USER;

    const mailOptions = {
      from: `"NetOps Alert System" <${process.env.EMAIL_USER}>`,
      to: receiver,
      subject: `🚨 [CẢNH BÁO MẠNG] Sự cố trên thiết bị ${deviceName}`,
      html: `
        <div style="font-family: Arial, sans-serif; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;">
          <h2 style="color: #dc2626;">Cảnh báo Hệ thống Giám sát NetOps</h2>
          <p style="font-size: 16px;">Hệ thống phát hiện sự cố khẩn cấp. Vui lòng kiểm tra ngay!</p>
          <ul style="font-size: 16px; background-color: #fef2f2; padding: 15px 30px; border-radius: 4px;">
            <li><strong>Thiết bị:</strong> ${deviceName}</li>
            <li><strong>IP Address:</strong> ${ip}</li>
            <li><strong>Chi tiết lỗi:</strong> <span style="color: red; font-weight: bold;">${issue}</span></li>
            <li><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</li>
          </ul>
          <br/>
          <hr style="border: 0; border-top: 1px solid #e5e7eb;"/>
          <p style="color: #6b7280; font-size: 12px;"><em>Email này được gửi tự động từ hệ thống NetOps & Infrastructure Portal. Không cần phản hồi.</em></p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Đã gửi Email cảnh báo sự cố tới: ${info.accepted}`);
    } catch (error) {
      console.error('❌ Lỗi gửi Email:', error);
    }
  }
}
