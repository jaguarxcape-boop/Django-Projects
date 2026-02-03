import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../baseUrl';
import './public-events.css';

export default function PublicEvents({ setnotification }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublishedEvents();
  }, []);

  const fetchPublishedEvents = async () => {
    try {
      const response = await fetch(`${BASE_URL('event/published/')}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setEvents(data.data);
      } else {
        setnotification?.({
          message: data.message || 'Failed to load events',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching published events:', error);
      setnotification?.({
        message: 'Error fetching published events',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="public-events"><p>Loading events...</p></div>;
  }

  return (
    <div className="public-events">
      <div className="events-header">
        <h1>🎭 Pageantry Events</h1>
        <p>Explore ongoing pageantry events and vote for your favorites</p>
      </div>

      {events.length === 0 ? (
        <div className="no-events">
          <p>No events available at the moment.</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              {event.banner && (
                <div className="event-card-banner">
                  <img src={event.banner} alt={event.name} />
                </div>
              )}
              <div className="event-card-content">
                <h2>{event.name}</h2>
                {event.bio && <p className="event-bio">{event.bio}</p>}
                
                <div className="event-info">
                  {event.start_time && (
                    <div className="info-item">
                      <span className="label">Starts:</span>
                      <span className="value">{new Date(event.start_time).toLocaleDateString()}</span>
                    </div>
                  )}
                  {event.end_time && (
                    <div className="info-item">
                      <span className="label">Ends:</span>
                      <span className="value">{new Date(event.end_time).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="info-item">
                    <span className="label">Categories:</span>
                    <span className="value">{event.categories?.length || 0}</span>
                  </div>
                </div>

                <div className="event-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/dashboard/voting/${event.id}`)}
                  >
                    Vote Now →
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigate(`/dashboard/results/${event.id}`)}
                  >
                    View Results
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
