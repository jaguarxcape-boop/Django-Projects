// import { useState } from "react";
// import { FETCHDASHBOARDPROFILEAPI } from "./dashboardurls.js";
// import OrganizerProfile from "./Profile/profile.jsx";
import "./index.css";
import Topbar from "./TopBar/topBar.jsx";
import {Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Events from "./Event/event.jsx";
import Sidebar from "./Sidebar/sidebar.jsx";


export default function DashboardLayout({ setnotification }) {

  useEffect(() => {
    document.title = "Dashboard - Pageantry Voting";

  }, []);
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-content">
        <Topbar setnotification={setnotification} />
        <main>
          <Routes>
            <Route path="events/*" element={<Events setnotification={setnotification} />} />
            {/* <Route path="profile/*" element={<OrganizerProfile setnotification={setnotification} />} /> */}
          </Routes>

        </main>
      </div>

    </div>
  );
}
