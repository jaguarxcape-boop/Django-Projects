import './topBar.css'
import React from "react";
// import { useAuth } from "../context/AuthContext";

export default function Topbar({ pageTitle,setnotification }) {
  //   const { user } = useAuth();

  // Use first letter of username for avatar
  //   const avatarLetter = user?.username ? user.username[0].toUpperCase() : "O";

  return (
    <div className="topbar">
      <h3>{pageTitle || "Dashboard"}</h3>

      <div className="user-info">



        <AvatarDropdown setnotification={setnotification}/>
      </div>
    </div>
  );
}

import { useState } from "react";
import Logout from "../../Auth/logout";

export function AvatarDropdown({setnotification}) {

  const [open, setOpen] = useState(false);

  const toggleDropdown = () => setOpen(!open);

  return (
    <div className="avatar-dropdown-wrapper">
      <div className="avatar-circle" onClick={toggleDropdown}>
        {/* Just an example initial */}
        A
      </div>

      {open && (
        <div className="dropdown-menu">
          <Logout setnotification={setnotification}/>
          {/* <button onClick={logout}>Logout</button> */}
          <button>Settings</button>
          <button>Profile</button>
        </div>
      )}
    </div>
  );
}
