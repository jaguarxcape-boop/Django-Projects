import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../baseUrl';
import '../voting.css';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

function VotingPage({ setnotification }) {
  const { eventId } = useParams();
  const navigate = useNavigate();

  // Event data state
  const [event, setEvent] = useState(null);
  const [categories, setCategories] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [voterEmail, setVoterEmail] = useState('');
  const [voteQuantities, setVoteQuantities] = useState({});
  const [brandColors, setBrandColors] = useState({ primary: '#667eea', secondary: '#764ba2' });
  
  // Voting state
  const [voting, setVoting] = useState(false);
  const [votingContestantId, setVotingContestantId] = useState(null);

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
    const loadEventData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          BASE_URL(`event/public/${eventId}/`)
        );
        const data = await response.json();

        if (response.ok && data.status === 'success') {
          setEvent(data.data);
          
          // Extract colors from banner
          if (data.data.banner) {
            extractBannerColors(data.data.banner);
          }

          // Process categories with contestants
          if (data.data.categories && data.data.categories.length > 0) {
            setCategories(data.data.categories);
            // Initialize all categories as expanded by default
            const expandedState = {};
            data.data.categories.forEach(cat => {
              expandedState[cat.id] = true;
            });
            setExpandedCategories(expandedState);
          }
        } else {
          setnotification({ type: 'error', message: 'Event not found' });
          navigate('/vote');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        setnotification({ type: 'error', message: 'Failed to load event' });
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [eventId, navigate, setnotification]);

  useEffect(() => {
    // Set first category as selected by default
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories]);


  const handleVote = async (contestantId) => {
    const numberOfVotes = parseInt(voteQuantities[contestantId] || 0);
    
    if (!numberOfVotes || numberOfVotes < 1) {
      setnotification({
        type: 'warning',
        message: 'Please enter a number of votes (minimum 1)'
      });
      return;
    }

    try {
      setVoting(true);
      setVotingContestantId(contestantId);

      const payload = {
        voter_email: voterEmail || null,
        number_of_votes: numberOfVotes
      };

      const response = await fetch(
        BASE_URL(`event/${eventId}/vote/${contestantId}/`),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        const totalCost = numberOfVotes * event.amount_per_vote;
        const voteId = data.data.vote_id;
        const riskScore = data.data.risk_score || 0;
        const requiresReview = data.data.requires_review || false;
        
        // Store vote ID for payment processing
        const votePayloadData = {
          voteId,
          numberOfVotes,
          totalCost,
          riskScore,
          requiresReview,
          contestantName: data.data.contestant?.name,
          timestamp: new Date().toISOString()
        };
        
        // Save to localStorage for payment system to access
        localStorage.setItem(`pending_vote_${voteId}`, JSON.stringify(votePayloadData));
        
        if (requiresReview) {
          setnotification({
            type: 'warning',
            message: `Vote recorded but flagged for review (Risk Score: ${riskScore}). Awaiting payment verification.`
          });
        } else {
          setnotification({
            type: 'success',
            message: `${numberOfVotes} vote${numberOfVotes > 1 ? 's' : ''} recorded successfully! Total: GHS ${totalCost}. Ready for payment.`
          });
        }
        
        // Clear input after successful vote
        setVoterEmail('');
        setVoteQuantities(prev => ({
          ...prev,
          [contestantId]: ''
        }));
        
        // Refresh event data to update vote counts
        try {
          const refreshResponse = await fetch(
            BASE_URL(`event/public/${eventId}/`)
          );
          const refreshData = await refreshResponse.json();
          if (refreshResponse.ok && refreshData.status === 'success') {
            setEvent(refreshData.data);
            if (refreshData.data.categories && refreshData.data.categories.length > 0) {
              setCategories(refreshData.data.categories);
            }
          }
        } catch (refreshError) {
          console.error('Error refreshing event data:', refreshError);
        }
      } else {
        // Handle error responses with fraud detection info
        const errorData = data.data || {};
        
        if (response.status === 400 && errorData.status === 'quarantined') {
          setnotification({
            type: 'error',
            message: `Vote flagged as suspicious and quarantined. Risk Score: ${errorData.risk_score}. Please contact support.`
          });
        } else if (data.message && data.message.includes('already voted')) {
          setnotification({
            type: 'warning',
            message: 'You have already voted for this contestant from this device/email'
          });
        } else {
          setnotification({
            type: 'error',
            message: data.message || 'Failed to submit vote'
          });
        }
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      setnotification({ type: 'error', message: 'Error submitting vote' });
    } finally {
      setVoting(false);
      setVotingContestantId(null);
    }
  };

  const toggleCategoryExpand = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  if (loading) {
    return <div className="voting-page loading">Loading event...</div>;
  }

  if (!event) {
    return <div className="voting-page">Event not found</div>;
  }

  return (
    <div className="voting-page" style={event?.banner ? { backgroundImage: `url(${event.banner})` } : {}}>
      {/* Event Header */}
      <div className="voting-header">
        {event.banner && (
          <div className="event-banner-large">
            <img src={event.banner} alt={event.name} />
            <div className="banner-overlay"></div>
          </div>
        )}
        <div className="event-header-content">
          <button className="btn-back" onClick={() => navigate('/vote')}>
            ← Back to Events
          </button>
          <div className="event-branding">
            <h1 className="event-title">{event.name}</h1>
            <div className="event-brand-divider"></div>
            <p className="event-desc">{event.bio}</p>
            <div className="event-voting-info">
              <div className="info-badge">
                <span className="badge-icon">💰</span>
                <span className="badge-text">GHS {event.amount_per_vote} per vote</span>
              </div>
              <div className="info-badge">
                <span className="badge-icon">📅</span>
                <span className="badge-text">{new Date(event.start_time).toLocaleDateString()}</span>
              </div>
              <div className="info-badge">
                <span className="badge-icon">🏆</span>
                <span className="badge-text">{categories.length} Categories</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voter Email Input */}
      <div className="voter-info-section">
        <label htmlFor="voterEmail">
          <input
            id="voterEmail"
            type="email"
            placeholder="Your email (optional)"
            value={voterEmail}
            onChange={(e) => setVoterEmail(e.target.value)}
            className="voter-email-input"
          />
          <small>Provide your email to track your votes</small>
        </label>
      </div>

      {/* Categories and Contestants with Sidebar */}
      {categories && categories.length > 0 ? (
        <div className="voting-container">
          {/* Category Sidebar */}
          <aside className="voting-sidebar">
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

          {/* Voting Content */}
          <div className="voting-content">
            {selectedCategory && (
              <div className="selected-category-view">
                {(() => {
                  const category = categories.find(c => c.id === selectedCategory);
                  if (!category) return null;

                  return (
                    <div key={category.id} className="category-section">
                      <div className="category-header">
                        <h2 className="category-title">{category.name}</h2>
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
                            <div className="contestants-grid">
                              {category.contestants.map((contestant) => (
                                <div key={contestant.id} className="contestant-card">
                                  <div className="contestant-photo">
                                    {contestant.photo ? (
                                      <img src={contestant.photo} alt={contestant.name} />
                                    ) : (
                                      <div className="photo-placeholder">
                                        <span>{contestant.name.charAt(0)}</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="contestant-info">
                                    <h3>{contestant.name}</h3>
                                    {contestant.bio && (
                                      <p className="bio">{contestant.bio}</p>
                                    )}
                                    {contestant.hobby && (
                                      <p className="hobby">
                                        <strong>Hobby:</strong> {contestant.hobby}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <input
                                      type="number"
                                      min="1"
                                      placeholder="Number of votes"
                                      value={voteQuantities[contestant.id] || ''}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setVoteQuantities(prev => ({
                                          ...prev,
                                          [contestant.id]: value
                                        }));
                                      }}
                                      className="vote-quantity-input"
                                    />
                                    {voteQuantities[contestant.id] && (
                                      <p className="vote-cost">
                                        Total: GHS {parseInt(voteQuantities[contestant.id]) * event.amount_per_vote}
                                      </p>
                                    )}
                                    <button
                                      className="btn-vote"
                                      onClick={() => handleVote(contestant.id)}
                                      disabled={voting && votingContestantId === contestant.id}
                                    >
                                      {voting && votingContestantId === contestant.id ? (
                                        'Voting...'
                                      ) : (
                                        `Vote • GHS ${event.amount_per_vote}/vote`
                                      )}
                                    </button>
                                  </div>

                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="no-contestants">No contestants in this category</p>
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
        <div className="empty-state">
          <p>No contestants available for voting</p>
        </div>
      )}

      {/* Results Button */}
      <div className="voting-footer">
        <button
          className="btn-results"
          onClick={() => navigate(`/vote/${eventId}/results`)}
        >
          View Live Results
        </button>
      </div>
    </div>
  );
}

export default VotingPage;
