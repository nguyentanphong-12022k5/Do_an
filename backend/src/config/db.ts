import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Khởi tạo Pool kết nối tới PostgreSQL
export const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'netops_db',
});

// Lắng nghe sự kiện kết nối
db.on('connect', () => {
  console.log('✅ Đã thiết lập kết nối tới PostgreSQL');
});

db.on('error', (err) => {
  console.error('❌ Lỗi mất kết nối PostgreSQL:', err);
});
