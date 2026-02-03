import React from 'react';

const RevenueSummary = ({ revenue }) => {
  const total = revenue?.total || 0;
  const completed = revenue?.completed || 0;
  const pending = revenue?.pending || 0;
  const failed = revenue?.failed || 0;

  const getCompletedPercent = total > 0 ? (completed / total) * 100 : 0;
  const getPendingPercent = total > 0 ? (pending / total) * 100 : 0;
  const getFailedPercent = total > 0 ? (failed / total) * 100 : 0;

  return (
    <div className="card revenue-summary">
      <h2>💰 Revenue Summary</h2>
      
      <div className="total-revenue">
        <span className="label">Total Revenue</span>
        <span className="amount">GHS {total.toFixed(2)}</span>
      </div>

      <div className="revenue-breakdown">
        <div className="revenue-item completed">
          <span className="status">✅ Completed</span>
          <div className="amount">
            <span className="value">GHS {completed.toFixed(2)}</span>
            <span className="percent">{getCompletedPercent.toFixed(1)}%</span>
          </div>
        </div>
        
        <div className="revenue-item pending">
          <span className="status">⏳ Pending</span>
          <div className="amount">
            <span className="value">GHS {pending.toFixed(2)}</span>
            <span className="percent">{getPendingPercent.toFixed(1)}%</span>
          </div>
        </div>
        
        <div className="revenue-item failed">
          <span className="status">❌ Failed</span>
          <div className="amount">
            <span className="value">GHS {failed.toFixed(2)}</span>
            <span className="percent">{getFailedPercent.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="revenue-progress-bar">
        <div className="segment completed-segment" style={{ width: `${getCompletedPercent}%` }}></div>
        <div className="segment pending-segment" style={{ width: `${getPendingPercent}%` }}></div>
        <div className="segment failed-segment" style={{ width: `${getFailedPercent}%` }}></div>
      </div>
    </div>
  );
};

export default RevenueSummary;
