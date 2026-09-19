export class AiService {
  /**
   * Thuật toán AI: Hồi quy tuyến tính (Simple Linear Regression)
   * Phân tích xu hướng tăng của dữ liệu (VD: RAM/CPU bị rò rỉ tăng dần theo thời gian)
   * và dự báo chính xác thời điểm tài nguyên chạm mức 100%.
   */
  public predictExhaustion(data: { timestamp: number, value: number }[]): any {
    if (data.length < 5) {
      return { willExhaust: false, message: 'Chưa đủ mẫu dữ liệu (cần tối thiểu 5 lần đo) để AI có thể dự báo.' };
    }

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    const n = data.length;

    // Tính toán các hằng số hồi quy
    for (let i = 0; i < n; i++) {
      const x = data[i].timestamp; // UNIX epoch time (ms)
      const y = data[i].value;     // Mức sử dụng (VD: 80%)
      
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    }

    const denominator = (n * sumX2 - sumX * sumX);
    if (denominator === 0) {
      return { willExhaust: false, message: 'Dữ liệu đường thẳng (Không biến thiên). Hệ thống đang an toàn.' };
    }

    // Tính Hệ số góc (slope - mức độ rò rỉ) và Hằng số y-intercept
    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    // Nếu hệ số góc <= 0, tài nguyên đang giảm xuống hoặc đi ngang (Rất an toàn)
    if (slope <= 0) {
      return { willExhaust: false, message: 'Xu hướng tài nguyên đi ngang hoặc giảm. Hệ thống rất ổn định.' };
    }

    // Nếu hệ số góc > 0, tính thời gian (x) khi y (tài nguyên) đạt ngưỡng nguy hiểm = 100%
    // Phương trình: y = slope * x + intercept => x = (100 - intercept) / slope
    const predictedCrashTimestamp = (100 - intercept) / slope;
    const currentTimestamp = data[n - 1].timestamp;

    if (predictedCrashTimestamp < currentTimestamp) {
       return { willExhaust: true, estimatedDaysLeft: 0, message: 'Hệ thống đã cạn kiệt tài nguyên ngay lúc này!' };
    }

    // Tính toán thời gian còn lại (đổi từ ms sang ngày)
    const timeLeftMs = predictedCrashTimestamp - currentTimestamp;
    const daysLeft = timeLeftMs / (1000 * 60 * 60 * 24);
    const hoursLeft = timeLeftMs / (1000 * 60 * 60);

    return {
      willExhaust: true,
      estimatedDaysLeft: parseFloat(daysLeft.toFixed(2)),
      estimatedHoursLeft: parseFloat(hoursLeft.toFixed(2)),
      message: `CẢNH BÁO TỪ AI: Phát hiện dấu hiệu rò rỉ tài nguyên. Hệ thống sẽ cạn kiệt (100%) trong khoảng ${hoursLeft.toFixed(1)} giờ (${daysLeft.toFixed(1)} ngày) tiếp theo nếu không được xử lý!`
    };
  }
}
