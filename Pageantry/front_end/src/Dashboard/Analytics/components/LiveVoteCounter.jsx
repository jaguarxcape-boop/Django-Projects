import React, { useState, useEffect } from 'react';

const LiveVoteCounter = ({ eventOverview }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 600);
    return () => clearTimeout(timer);
  }, [eventOverview?.total_votes]);

  return (
    <div className="live-vote-counter">
      <div className="live-indicator">
        <span className="live-dot"></span>
        <span className="live-text">LIVE</span>
      </div>
      
      <div className={`vote-number ${animate ? 'pulse' : ''}`}>
        {eventOverview?.total_votes?.toLocaleString() || '0'}
      </div>
      
      <p className="vote-label">Total Votes</p>
      
      <div className="counter-stats">
        <div className="stat">
          <span className="label">Unique Voters</span>
          <span className="value">{eventOverview?.unique_voters || '0'}</span>
        </div>
        <div className="stat">
          <span className="label">Revenue</span>
          <span className="value">GHS {parseFloat(eventOverview?.total_vote_amount || 0).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default LiveVoteCounter;
