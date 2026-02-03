import React from 'react';

const DeviceBreakdown = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="card"><p>No device data available</p></div>;
  }

  const getDeviceIcon = (deviceType) => {
    switch(deviceType?.toLowerCase()) {
      case 'mobile': return '📱';
      case 'tablet': return '📱';
      case 'desktop': return '🖥️';
      default: return '💻';
    }
  };

  return (
    <div className="card device-breakdown">
      <h2>📱 Device Breakdown</h2>
      <div className="breakdown-list">
        {data.map((item, idx) => (
          <div key={idx} className="breakdown-item">
            <div className="device-label">
              <span className="icon">{getDeviceIcon(item.device_type)}</span>
              <span className="label">{item.device_type || 'Unknown'}</span>
            </div>
            <div className="breakdown-bar">
              <div 
                className="breakdown-fill"
                style={{ width: `${item.percentage}%` }}
              ></div>
            </div>
            <div className="breakdown-stats">
              <span className="votes">{item.votes}</span>
              <span className="percentage">{item.percentage.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeviceBreakdown;
