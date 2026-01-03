import { NavLink } from "react-router";
import './sidebar.css'

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <h2>Pageantry</h2>
            <nav>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/dashboard/profile">Profile</NavLink>
                <NavLink to="/dashboard/security">Security</NavLink>
                <NavLink to="/dashboard/events">Events</NavLink>
                <NavLink to="/dashboard/contestants">Contestants</NavLink>
                <NavLink to="/dashboard/votes">Votes</NavLink>
            </nav>
        </aside>
    );
}
