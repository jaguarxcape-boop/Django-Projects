import React from 'react';

const ContestantLeaderboard = ({ contestants }) => {
  if (!contestants || contestants.length === 0) {
    return <div className="card"><p>No contestant data available</p></div>;
  }

  const getMedalEmoji = (rank) => {
    switch(rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '  ';
    }
  };

  return (
    <div className="card contestant-leaderboard">
      <h2>🏆 Contestant Leaderboard</h2>
      <div className="leaderboard-list">
        {contestants.map((contestant, idx) => (
          <div key={contestant.contestant_id} className="leaderboard-item">
            <div className="rank-medal">{getMedalEmoji(idx + 1)}</div>
            
            {contestant.contestant_photo && (
              <img 
                src={contestant.contestant_photo} 
                alt={contestant.contestant_name}
                className="contestant-photo"
              />
            )}
            
            <div className="contestant-info">
              <div className="contestant-name">{contestant.contestant_name}</div>
              <div className="contestant-stats">
                <span className="stat-item">
                  📊 {contestant.total_votes} votes
                </span>
                <span className="stat-item">
                  💰 GHS {parseFloat(contestant.total_revenue).toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="percentage-bar">
              <div 
                className="percentage-fill"
                style={{ width: `${contestant.percentage_of_total}%` }}
              ></div>
            </div>
            <span className="percentage-text">{contestant.percentage_of_total.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContestantLeaderboard;
