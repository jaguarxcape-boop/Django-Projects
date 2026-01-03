
import { Link, NavLink } from "react-router";
import "./top_nav.css";
import { DASHBOARDURLS } from "../../dashboardurls";

export default function TopNav() {
  return (
    <>
        {/* // <header className="topnav"> */}
      {/* <div className="topnav-left">
        <span className="brand">Pageantry</span>
      </div> */}

      <nav className="topnav-center sidebar" style={{flexDirection:"row",width:"max-content",marginBottom:"10px"}}>
     
          <NavLink to={DASHBOARDURLS().events.create}>Create</NavLink>
           <NavLink to={DASHBOARDURLS().events.published}>Published Events</NavLink>
           <NavLink to={DASHBOARDURLS().events.unpublished}>Unpublished Events</NavLink>

         {/* <NavLink to="/dashboard/security">Security</NavLink>
          <NavLink to="/dashboard/events">Events</NavLink>
          <NavLink to="/dashboard/contestants">Contestants</NavLink>
          <NavLink to="/dashboard/votes">Votes</NavLink> */}
       
      </nav>

      {/* <div className="topnav-right">
        <div className="avatar">A</div>
      </div> */}
      </>
    // </header>
  );
}
