import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../baseUrl';
import '../voting.css';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

function ResultsPage({ setnotification }) {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [brandColors, setBrandColors] = useState({ primary: '#667eea', secondary: '#764ba2' });

  // Extract dominant colors from banner
  const extractBannerColors = (imageUrl) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = 100;
      canvas.height = 100;
      ctx.drawImage(img, 0, 0, 100, 100);
      
      const imageData = ctx.getImageData(0, 0, 100, 100);
      const data = imageData.data;
      
      let r = 0, g = 0, b = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }
      
      const pixelCount = data.length / 4;
      r = Math.floor(r / pixelCount);
      g = Math.floor(g / pixelCount);
      b = Math.floor(b / pixelCount);
      
      // Create secondary color with variation
      const secondary = `hsl(${(Math.atan2(g - 128, r - 128) * 180 / Math.PI + 180) % 360}, ${Math.abs(r - g)}%, ${Math.max(r, g, b) / 2.55}%)`;
      
      setBrandColors({
        primary: `rgb(${r},${g},${b})`,
        secondary: secondary
      });
    };
    
    img.src = imageUrl;
  };

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [eventId]);

  useEffect(() => {
    // Set first category as selected by default
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories]);

  const fetchResults = async () => {
    try {
      // Fetch event details for banner
      const eventResponse = await fetch(BASE_URL(`event/public/${eventId}/`));
      const eventData = await eventResponse.json();
      
      if (eventData.status === 'success' && eventData.data.banner) {
        extractBannerColors(eventData.data.banner);
      }

      const response = await fetch(BASE_URL(`event/${eventId}/results/`));
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setEvent({
          id: data.data.event_id,
          name: data.data.event_name,
          banner: eventData.data?.banner
        });
        const cats = data.data.categories || [];
        setCategories(cats);
        // Initialize all categories as expanded by default
        const expandedState = {};
        cats.forEach(cat => {
          expandedState[cat.id] = true;
        });
        setExpandedCategories(expandedState);
      } else {
        if (loading) {
          setnotification({ type: 'error', message: 'Event not found' });
          navigate('/vote');
        }
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      if (loading) {
        setnotification({ type: 'error', message: 'Failed to load results' });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoryExpand = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  if (loading) {
    return (
      <div className="results-page loading" style={{'--brand-primary': brandColors.primary}}>
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return <div className="results-page">Event not found</div>;
  }

  return (
    <div 
      className="results-page"
      style={{
        backgroundImage: event?.banner ? `url(${event.banner})` : undefined,
        '--brand-primary': brandColors.primary,
        '--brand-secondary': brandColors.secondary
      }}
    >
      {/* Event Header */}
      <div className="results-header">
        {/* Premium Header Ribbon */}
        <div className="header-ribbon" style={{background: `linear-gradient(90deg, ${brandColors.primary}, ${brandColors.secondary})`}}></div>
        
        <div className="results-header-content">
          <button className="btn-back" onClick={() => navigate('/vote')}>
            ← Back to Events
          </button>
          <h1 style={{background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
            {event.name} - Results
          </h1>
          <p className="auto-refresh-info">
            🔄 Auto-refreshing every 5 seconds
          </p>
        </div>
      </div>

      {/* Results Container with Sidebar */}
      {categories && categories.length > 0 ? (
        <div className="results-container">
          {/* Category Sidebar */}
          <aside className="category-sidebar" style={{'--brand-primary': brandColors.primary}}>
            <div className="sidebar-header" style={{background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})`}}>
              <h3 className="sidebar-title">Categories</h3>
            </div>
            <div className="category-list">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                  style={selectedCategory === category.id ? {borderLeftColor: brandColors.primary, background: `${brandColors.primary}15`} : {}}
                >
                  <span className="category-name">{category.name}</span>
                  {category.contestants && category.contestants.length > 0 && (
                    <span className="contestant-count" style={{background: brandColors.primary}}>
                      {category.contestants.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </aside>

          {/* Results Content */}
          <div className="results-content">
            {selectedCategory && (
              <div className="selected-category-view">
                {(() => {
                  const category = categories.find(c => c.id === selectedCategory);
                  if (!category) return null;
                  
                  return (
                    <div key={category.id} className="results-category" style={{borderTopColor: brandColors.primary}}>
                      <div className="category-header">
                        <div className="category-header-content">
                          <h2 className="results-category-title">{category.name}</h2>
                          <div className="category-divider" style={{background: `linear-gradient(90deg, ${brandColors.primary}, ${brandColors.secondary})`}}></div>
                        </div>
                        <button
                          className="expand-toggle"
                          onClick={() => toggleCategoryExpand(category.id)}
                          title={expandedCategories[category.id] ? 'Collapse' : 'Expand'}
                          style={{background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})`}}
                        >
                          {expandedCategories[category.id] ? (
                            <FaChevronUp />
                          ) : (
                            <FaChevronDown />
                          )}
                        </button>
                      </div>
                      
                      {expandedCategories[category.id] && (
                        <>
                          {category.contestants && category.contestants.length > 0 ? (
                            <div className="leaderboard">
                              {category.contestants
                                .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
                                .map((contestant, index) => (
                                  <div key={contestant.id} className="leaderboard-item" style={index === 0 ? {boxShadow: `0 0 0 2px ${brandColors.primary}`} : {}}>
                                    <div className="rank-badge" style={index === 0 ? {background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})`} : {}}>{index + 1}</div>
                                    
                                    <div className="contestant-display">
                                      <div className="contestant-photo-small">
                                        {contestant.photo ? (
                                          <img src={contestant.photo} alt={contestant.name} />
                                        ) : (
                                          <div className="photo-placeholder-small">
                                            {contestant.name.charAt(0)}
                                          </div>
                                        )}
                                      </div>
                                      
                                      <div className="contestant-details">
                                        <h3>{contestant.name}</h3>
                                        {contestant.bio && (
                                          <p className="bio-results">{contestant.bio}</p>
                                        )}
                                      </div>
                                    </div>

                                    <div className="vote-stats">
                                      <div className="vote-count">
                                        <span className="count-number">{contestant.vote_count || 0}</span>
                                        <span className="count-label">Votes</span>
                                      </div>
                                      <div className="vote-amount">
                                        <span className="amount-number">
                                          GHS {parseFloat(contestant.total_votes_amount || 0).toFixed(2)}
                                        </span>
                                        <span className="amount-label">Total</span>
                                      </div>
                                    </div>

                                    {index === 0 && (
                                      <div className="winner-badge">👑 Leader</div>
                                    )}
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <div className="no-votes">
                              <p>No votes yet for this category</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="empty-results">
          <p>No results available</p>
        </div>
      )}

      {/* Vote Button */}
      <div className="results-footer">
        <button 
          className="btn-vote-now"
          onClick={() => navigate(`/vote/${eventId}`)}
          style={{background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})`, boxShadow: `0 4px 12px ${brandColors.primary}40`}}
        >
          Cast Your Vote
        </button>
      </div>
    </div>
  );
}

export default ResultsPage;
