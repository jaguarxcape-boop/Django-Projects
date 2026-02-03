// import { useState } from "react";
// import { FETCHDASHBOARDPROFILEAPI } from "./dashboardurls.js";
// import OrganizerProfile from "./Profile/profile.jsx";
import "./index.css";
import Topbar from "./TopBar/topBar.jsx";
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "./Sidebar/sidebar.jsx";
import Analytics from "./Analytics/index.jsx";
import EventsRouter from "./Event/event.jsx";


export default function DashboardLayout({ setnotification }) {

  useEffect(() => {
    document.title = "Dashboard - Pageantry Voting";

  }, []);
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-content">
        <main>
          <Routes>
            <Route path="events/*" element={<EventsRouter setnotification={setnotification} />} />
            <Route path="analytics/:eventId" element={<Analytics eventId={null} />} />
          </Routes>

        </main>
      </div>

    </div>
  );
}
