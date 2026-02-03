import React from 'react';

const VoteTimeline = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="card"><p>No timeline data available</p></div>;
  }

  // Find max value for scaling
  const maxVotes = Math.max(...data.map(d => d.vote_count || 0));

  return (
    <div className="card vote-timeline">
      <h2>📅 Vote Timeline (Last 24 Hours)</h2>
      <div className="timeline-chart">
        {data.map((item, idx) => {
          const hour = new Date(item.timestamp).getHours();
          const scale = maxVotes > 0 ? (item.vote_count / maxVotes) * 100 : 0;
          
          return (
            <div key={idx} className="timeline-bar-group">
              <div className="timeline-bar-container">
                <div 
                  className="timeline-bar"
                  style={{ height: `${scale}%` }}
                  title={`${item.vote_count} votes at ${hour}:00`}
                ></div>
              </div>
              <span className="timeline-label">{hour}:00</span>
            </div>
          );
        })}
      </div>
      <div className="timeline-legend">
        <p>📊 Vote count per hour</p>
        <p>Max: {maxVotes} votes</p>
      </div>
    </div>
  );
};

export default VoteTimeline;
