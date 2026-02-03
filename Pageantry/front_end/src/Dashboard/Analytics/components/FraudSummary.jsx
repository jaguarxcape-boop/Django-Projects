import React from 'react';

const FraudSummary = ({ fraud }) => {
  return (
    <div className="card fraud-summary">
      <h2>🔒 Fraud Detection Summary</h2>
      <div className="fraud-metrics">
        <div className="fraud-metric critical">
          <span className="label">🚨 Flagged Votes</span>
          <span className="value">{fraud?.flagged_votes || '0'}</span>
        </div>
        <div className="fraud-metric warning">
          <span className="label">⚠️ Quarantined</span>
          <span className="value">{fraud?.quarantined_votes || '0'}</span>
        </div>
        <div className="fraud-metric info">
          <span className="label">📊 Detection Rate</span>
          <span className="value">{fraud?.fraud_detection_rate?.toFixed(2)}%</span>
        </div>
      </div>
      <p className="fraud-note">
        ℹ️ Advanced fraud detection system monitors voting patterns to ensure platform integrity
      </p>
    </div>
  );
};

export default FraudSummary;
