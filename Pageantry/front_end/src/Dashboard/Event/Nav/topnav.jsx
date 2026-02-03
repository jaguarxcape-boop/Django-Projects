
import { Link, NavLink } from "react-router";
import "./top_nav.css";
import { DASHBOARDURLS } from "../../dashboardurls";

export default function TopNav() {
  return (
    <>
      <nav className="topnav-center" style={{marginBottom:"20px"}}>
        <NavLink to={DASHBOARDURLS().events.create}>Create</NavLink>
        <NavLink to={DASHBOARDURLS().events.unpublished}>Unpublished Events</NavLink>
      </nav>
    </>
  );
}
