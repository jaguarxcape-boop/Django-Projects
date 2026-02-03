import { Link, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { fetchAccessToken } from "../../fetchAccessToken";
import { DASHBOARDAPIURLS, DASHBOARDURLS } from "../dashboardurls";
import { BASE_URL } from "../../baseUrl.js";

import CreateEvent from "./Create/createEvent.jsx";
import TopNav from "./Nav/topnav.jsx";
import { ViewEvents } from "./View/view.jsx";
import EventManagement from "./View/manage_event/manage_event.jsx";

const EmptyEvents = ({ setState }) => {
    const createEvent = {
        name: "",
        amount_per_vote: "1",
        bio: ""
    }




    return (
        <div className="empty-events-wrapper">
            <div className="empty-events-card fade-in">
                <div className="icon">🎉</div>
                <h2>No Events Yet</h2>
                <p>
                    You haven’t created any pageantry event yet.
                    <br />Start by creating your first event.
                </p>

                <Link onClick={(e) => {
                    e.preventDefault()
                    setState(createEvent)
                }} to={DASHBOARDURLS().events.create} className="create-btn" style={{ textDecoration: "none" }}>
                    Create an Event
                </Link>


            </div>
        </div>
    );
}
export default function EventsRouter() {
    return (
        <>
        
            <Routes>
                <Route path="create/" element={<CreateEvent />} />
                <Route path='unpublished/' element={<ViewEvents />} />
                <Route path=":id/manage/" element={<EventManagement />} />
            </Routes>
        </>
    );
}







