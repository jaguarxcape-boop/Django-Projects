import React from 'react';

const GeographicBreakdown = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="card"><p>No geographic data available</p></div>;
  }

  const getCountryFlag = (country) => {
    const flags = {
      'Ghana': '🇬🇭',
      'Nigeria': '🇳🇬',
      'Kenya': '🇰🇪',
      'USA': '🇺🇸',
      'UK': '🇬🇧',
      'Canada': '🇨🇦',
      'Australia': '🇦🇺',
    };
    return flags[country] || '🌍';
  };

  const maxVotes = Math.max(...data.map(d => d.votes || 0));

  return (
    <div className="card geographic-breakdown">
      <h2>🌍 Geographic Breakdown (Top 10)</h2>
      <div className="geographic-list">
        {data.map((item, idx) => {
          const scale = maxVotes > 0 ? (item.votes / maxVotes) * 100 : 0;
          return (
            <div key={idx} className="geographic-item">
              <div className="country-label">
                <span className="flag">{getCountryFlag(item.country)}</span>
                <span className="name">{item.country}</span>
              </div>
              <div className="geographic-bar">
                <div 
                  className="geographic-fill"
                  style={{ width: `${scale}%` }}
                ></div>
              </div>
              <span className="votes">{item.votes}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GeographicBreakdown;
