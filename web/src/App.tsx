import { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Server, ShieldCheck, ShieldAlert } from 'lucide-react';

function App() {
  const [devices, setDevices] = useState([]);
  
  useEffect(() => {
    // Gọi API lấy dữ liệu từ Backend Node.js
    axios.get('http://localhost:3000/api/v1/devices')
      .then(response => {
        if(response.data.success) {
          setDevices(response.data.data);
        }
      })
      .catch(error => console.error("Lỗi khi kết nối API:", error));
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', backgroundColor: 'white', padding: '1rem 2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <Activity size={36} color="#2563eb" />
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#1f2937', margin: 0 }}>NetOps & Infrastructure Portal</h1>
          <p style={{ color: '#6b7280', margin: 0, marginTop: '4px' }}>Hệ thống Quản trị & Giám sát Mạng Tự động</p>
        </div>
      </div>
      
      {/* Danh sách thiết bị */}
      <h2 style={{ fontSize: '1.25rem', color: '#374151', marginBottom: '1rem' }}>Danh sách Thiết bị mạng & Máy chủ</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {devices.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', textAlign: 'center', color: '#6b7280' }}>
            <p>Chưa có thiết bị nào trong hệ thống. Hãy thêm từ Database.</p>
          </div>
        ) : (
          devices.map((device: any) => (
            <div key={device.id} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', borderLeft: device.status === 'UP' ? '4px solid #10b981' : '4px solid #ef4444', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', color: '#111827' }}>
                  <Server size={20} color="#4b5563" />
                  {device.name}
                </h3>
                <span style={{ 
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '4px 12px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 'bold',
                  backgroundColor: device.status === 'UP' ? '#dcfce7' : '#fee2e2',
                  color: device.status === 'UP' ? '#166534' : '#991b1b' 
                }}>
                  {device.status === 'UP' ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                  {device.status}
                </span>
              </div>
              
              <div style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: '1.8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Địa chỉ IP:</span>
                  <strong style={{ color: '#111827' }}>{device.ip_address}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Loại thiết bị:</span>
                  <strong style={{ color: '#111827' }}>{device.type}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Cộng đồng SNMP:</span>
                  <strong style={{ color: '#111827' }}>{device.snmp_community}</strong>
                </div>
              </div>
              
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '0.5rem' }}>
                <button style={{ flex: 1, padding: '0.5rem', backgroundColor: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
                  Xem Biểu đồ
                </button>
                <button style={{ flex: 1, padding: '0.5rem', backgroundColor: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
                  NetOps SSH
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
