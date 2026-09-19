import { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Server, ShieldCheck, ShieldAlert, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [chartData, setChartData] = useState([]);
  const [metricType, setMetricType] = useState('CPU');
  
  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = () => {
    axios.get('http://localhost:3000/api/v1/devices')
      .then(response => {
        if(response.data.success) {
          setDevices(response.data.data);
        }
      })
      .catch(error => console.error("Lỗi khi kết nối API:", error));
  };

  const openChartModal = (device: any) => {
    setSelectedDevice(device);
    fetchChartData(device.id, 'CPU');
  };

  const fetchChartData = (id: string, type: string) => {
    setMetricType(type);
    axios.get(`http://localhost:3000/api/v1/devices/${id}/metrics?metricType=${type}&limit=30`)
      .then(response => {
        if(response.data.success) {
          // Format lại timestamp cho dễ đọc trên biểu đồ
          const formattedData = response.data.data.map((item: any) => ({
            ...item,
            timeLabel: new Date(item.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute:'2-digit' })
          }));
          setChartData(formattedData);
        }
      })
      .catch(error => console.error("Lỗi lấy dữ liệu Chart:", error));
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f3f4f6', minHeight: '100vh', position: 'relative' }}>
      
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
                  <span>Giao thức:</span>
                  <strong style={{ color: '#111827' }}>SNMP ({device.snmp_community})</strong>
                </div>
              </div>
              
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => openChartModal(device)}
                  style={{ flex: 1, padding: '0.5rem', backgroundColor: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
                  Xem Biểu đồ
                </button>
                <button 
                  onClick={() => alert('Đang gửi lệnh SSH Khôi phục sự cố tới Backend...')}
                  style={{ flex: 1, padding: '0.5rem', backgroundColor: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
                  NetOps SSH
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Biểu đồ */}
      {selectedDevice && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '800px', maxWidth: '90%' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Giám sát thời gian thực: {selectedDevice.name}</h2>
              <button onClick={() => setSelectedDevice(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} color="#6b7280" /></button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <button onClick={() => fetchChartData(selectedDevice.id, 'CPU')} style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: metricType === 'CPU' ? '#2563eb' : '#e5e7eb', color: metricType === 'CPU' ? 'white' : 'black' }}>Biểu đồ CPU (%)</button>
              <button onClick={() => fetchChartData(selectedDevice.id, 'RAM')} style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: metricType === 'RAM' ? '#2563eb' : '#e5e7eb', color: metricType === 'RAM' ? 'white' : 'black' }}>Biểu đồ RAM (%)</button>
            </div>

            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="timeLabel" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke={metricType === 'CPU' ? '#2563eb' : '#10b981'} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
