import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import deviceRoutes from './routes/device.routes';
import netopsRoutes from './routes/netops.routes';
import { PollerWorker } from './workers/poller.worker';

// Nạp file .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/devices', deviceRoutes);
app.use('/api/v1/netops', netopsRoutes);

// Health Check API
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'NetOps Backend is running' });
});

// Khởi động HTTP Server
app.listen(PORT, () => {
  console.log(`🚀 Server HTTP đang chạy tại http://localhost:${PORT}`);
  
  // Kích hoạt Engine giám sát tự động ngầm (Poller Worker)
  const poller = new PollerWorker();
  poller.start();
  console.log('⚙️ Worker thu thập dữ liệu (Cron Job) đã được khởi động!');
});
