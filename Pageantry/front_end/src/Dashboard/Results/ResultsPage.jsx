import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../baseUrl';
import './results-page.css';
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
      const response = await fetch(BASE_URL(`event/${eventId}/results/`));
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setEvent({
          id: data.data.event_id,
          name: data.data.event_name
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
          navigate('/dashboard/events');
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
    return <div className="results-page loading">Loading results...</div>;
  }

  if (!event) {
    return <div className="results-page">Event not found</div>;
  }

  return (
    <div className="results-page">
      {/* Event Header */}
      <div className="results-header">
        <button className="btn-back" onClick={() => navigate('/dashboard/events')}>
          ← Back
        </button>
        <h1>{event.name} - Results</h1>
        <p className="auto-refresh-info">
          🔄 Auto-refreshing every 5 seconds
        </p>
      </div>

      {/* Results Container with Sidebar */}
      {categories && categories.length > 0 ? (
        <div className="results-container">
          {/* Category Sidebar */}
          <aside className="category-sidebar">
            <h3 className="sidebar-title">Categories</h3>
            <div className="category-list">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <span className="category-name">{category.name}</span>
                  {category.contestants && category.contestants.length > 0 && (
                    <span className="contestant-count">
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
                    <div key={category.id} className="results-category">
                      <div className="category-header">
                        <h2 className="results-category-title">{category.name}</h2>
                        <button
                          className="expand-toggle"
                          onClick={() => toggleCategoryExpand(category.id)}
                          title={expandedCategories[category.id] ? 'Collapse' : 'Expand'}
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
                                  <div key={contestant.id} className="leaderboard-item">
                                    <div className="rank-badge">{index + 1}</div>
                                    
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
          onClick={() => navigate(`/dashboard/voting/${eventId}`)}
        >
          Cast Your Vote
        </button>
      </div>
    </div>
  );
}

export default ResultsPage;
