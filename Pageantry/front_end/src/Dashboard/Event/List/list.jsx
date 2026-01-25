import React from "react";
import './list.css'
// EventsList Component
// Props:
// events: Array of { id, title, date, location, description }
// onSelect: function(event)

export default function EventsList({ events = [], onSelect }) {
  if (!events.length) {
    return (
      <div className="events-empty">
        <h2>No events yet</h2>
        <p>You haven’t created or joined any events.</p>
        <button className="primary-btn">Create an Event</button>
      </div>
    );
  }

  return (
    <div className="events-wrapper">
      <h2 className="events-title">Upcoming Events</h2>

      <div className="events-grid">
        {events.map((event) => (
          <div
            key={event.id}
            className="event-card"
            onClick={() => onSelect && onSelect(event)}
          >
            <div className="event-date">
              <span>{event.date}</span>
            </div>

            <div className="event-body">
              <h3>{event.title}</h3>
              <p className="event-location">{event.location}</p>
              <p className="event-description">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
