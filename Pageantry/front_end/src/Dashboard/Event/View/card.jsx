import React, { useState } from "react";
import {Link} from 'react-router-dom'
import './card.css'
import { DASHBOARDURLS } from "../../dashboardurls";
// EventCard Component
// Props:
// event: { id, title, date, location, description }
// onClick?: function

export default function EventCard({ event, onClick }) {



    return (


        <div className="event-card" onClick={onClick} style={{ backgroundSize: "cover", backgroundImage: `url(${event.banner})`, backgroundRepeat: "no-repeat" }}>
            <div className="event-card-header">
                <span className="event-date">
                    Scheduled to start on {
                        new Date(event.start_time).toDateString()} at {new Date(event.start_time).toLocaleTimeString()}    </span>
            </div>

            <div className="event-card-body">
                <h3 className="event-title">{event.name}</h3>
                {/* <h3 className="event-title">{date}</h3> */}

                {/* <p className="event-location">📍 {event.location}</p> */}
                <p className="event-description">
                    {event.bio || "No description provided."}
                </p>

                <div className="event-card-header">
                    <span className="event-date">
                        Scheduled to end on {
                            new Date(event.end_time).toDateString()} at {new Date(event.end_time).toLocaleTimeString()}    </span>
                </div>


                <Link onClick={(e) => {
                   

                }} to={DASHBOARDURLS(event.id).events.manage} className="primary-btn" style={{ textDecoration: "none",'textAlign':"center" }}>
                    Manage Event
                </Link>
 
            </div>
        </div>
    );
}

