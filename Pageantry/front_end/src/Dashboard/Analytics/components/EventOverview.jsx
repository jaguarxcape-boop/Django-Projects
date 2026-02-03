import React from 'react';

const EventOverview = ({ data }) => {
  const metrics = [
    { label: 'Avg Vote Price', value: `GHS ${parseFloat(data?.average_vote_price || 0).toFixed(2)}` },
    { label: 'Completed Payments', value: data?.completed_payments || '0' },
    { label: 'Failed Payments', value: data?.failed_payments || '0' },
    { label: 'Pending Payments', value: data?.pending_payments || '0' },
    { label: 'Page Views', value: data?.views || '0' },
    { label: 'Bounce Rate', value: `${parseFloat(data?.bounce_rate || 0).toFixed(1)}%` },
  ];

  return (
    <div className="card event-overview">
      <h2>📈 Event Overview</h2>
      <div className="metrics-grid">
        {metrics.map((metric, idx) => (
          <div key={idx} className="metric-item">
            <span className="metric-label">{metric.label}</span>
            <span className="metric-value">{metric.value}</span>
          </div>
        ))}
      </div>
      <div className="last-updated">
        Last updated: {new Date(data?.updated_at).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default EventOverview;
