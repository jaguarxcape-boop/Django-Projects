import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../baseUrl';
import './voting-page.css';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

function VotingPage({ setnotification }) {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [votingContestantId, setVotingContestantId] = useState(null);
  const [voterEmail, setVoterEmail] = useState('');
  const [contestants, setContestants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  useEffect(() => {
    // Set first category as selected by default
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(BASE_URL(`event/public/${eventId}/`));
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setEvent(data.data);
        
        // Process categories with contestants
        if (data.data.categories && data.data.categories.length > 0) {
          setCategories(data.data.categories);
          // Initialize all categories as expanded by default
          const expandedState = {};
          data.data.categories.forEach(cat => {
            expandedState[cat.id] = true;
          });
          setExpandedCategories(expandedState);
          // Flatten all contestants from all categories
          const allContestants = data.data.categories.flatMap(cat => 
            cat.contestants.map(c => ({
              ...c,
              categoryName: cat.name,
              categoryId: cat.id
            }))
          );
          setContestants(allContestants);
        }
      } else {
        setnotification({ type: 'error', message: 'Event not found' });
        navigate('/dashboard/events');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      setnotification({ type: 'error', message: 'Failed to load event' });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (contestantId) => {
    try {
      setVoting(true);
      setVotingContestantId(contestantId);

      const payload = {
        voter_email: voterEmail || null
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
        setnotification({ 
          type: 'success', 
          message: `Vote recorded! Amount: GHS ${data.data.vote_amount}` 
        });
        setVoterEmail('');
        // Refresh event data to update vote counts
        await fetchEventDetails();
      } else {
        if (data.message && data.message.includes('already voted')) {
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
    <div className="voting-page">
      {/* Event Header */}
      <div className="voting-header">
        {event.banner && (
          <div className="event-banner-large">
            <img src={event.banner} alt={event.name} />
          </div>
        )}
        <div className="event-header-content">
          <button className="btn-back" onClick={() => navigate('/dashboard/events')}>
            ← Back
          </button>
          <h1>{event.name}</h1>
          <p className="event-desc">{event.bio}</p>
          <div className="event-voting-info">
            <span className="voting-amount">Vote Cost: GHS {event.amount_per_vote}</span>
            <span className="voting-date">
              {new Date(event.event_date).toLocaleDateString()}
            </span>
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

                                  <button
                                    className="btn-vote"
                                    onClick={() => handleVote(contestant.id)}
                                    disabled={voting && votingContestantId === contestant.id}
                                  >
                                    {voting && votingContestantId === contestant.id ? (
                                      'Voting...'
                                    ) : (
                                      `Vote • GHS ${event.amount_per_vote}`
                                    )}
                                  </button>
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
          onClick={() => navigate(`/dashboard/results/${eventId}`)}
        >
          View Live Results
        </button>
      </div>
    </div>
  );
}

export default VotingPage;
