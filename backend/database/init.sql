-- Chạy Script này trong pgAdmin hoặc DBeaver để khởi tạo DB
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Bảng Quản trị viên
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'VIEWER',
    fcm_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Danh sách Thiết bị
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    ip_address VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL, -- LINUX, PFSENSE
    snmp_community VARCHAR(50) DEFAULT 'public',
    ssh_user VARCHAR(50),
    status VARCHAR(20) DEFAULT 'UP',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng lưu trữ Dữ liệu Giám sát (Metrics)
CREATE TABLE metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    metric_type VARCHAR(20) NOT NULL, -- CPU, RAM, PING
    value NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(20),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo Index để tối ưu truy vấn thời gian thực cho vẽ biểu đồ
CREATE INDEX idx_metrics_device_time ON metrics(device_id, recorded_at);
