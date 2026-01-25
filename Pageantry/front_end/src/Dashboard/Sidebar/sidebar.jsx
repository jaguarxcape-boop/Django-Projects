import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import './sidebar.css';
import { FaTachometerAlt, FaUser, FaShieldAlt, FaCalendarAlt, FaUsers, FaVoteYea, FaPlus, FaEyeSlash, FaChevronRight } from 'react-icons/fa';

export default function Sidebar() {
    const location = useLocation();
    const onEventsPage = location.pathname.startsWith('/dashboard/events');

    const [isEventsOpen, setEventsOpen] = useState(onEventsPage);
    const [userHasInteracted, setUserHasInteracted] = useState(false);

    useEffect(() => {
        // If user is on an events page and hasn't manually closed the menu, keep it open.
        if (onEventsPage && !userHasInteracted) {
            setEventsOpen(true);
        }
        // If user navigates away from events pages, reset the interaction state
        // so the menu can auto-open next time they navigate to an events page.
        if (!onEventsPage) {
            setUserHasInteracted(false);
            setEventsOpen(false);
        }
    }, [location.pathname, onEventsPage, userHasInteracted]);

    const toggleEvents = () => {
        setEventsOpen(!isEventsOpen);
        // Once the user clicks the toggle, they are in manual control.
        setUserHasInteracted(true);
    };

    return (
        <aside className="sidebar">
            <h2 className="sidebar-title">Pageantry</h2>
            <nav className="sidebar-nav">
                <NavLink to="/dashboard" end className="sidebar-link">
                    <FaTachometerAlt />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/dashboard/profile" className="sidebar-link">
                    <FaUser />
                    <span>Profile</span>
                </NavLink>
                <NavLink to="/dashboard/security" className="sidebar-link">
                    <FaShieldAlt />
                    <span>Security</span>
                </NavLink>
                <div className="sidebar-link" onClick={toggleEvents} aria-expanded={isEventsOpen}>
                    <FaCalendarAlt />
                    <span>Events</span>
                    <FaChevronRight className={`chevron-icon ${isEventsOpen ? 'open' : ''}`} />
                </div>
                <div className={`sidebar-submenu ${isEventsOpen ? 'open' : ''}`}>
                    <NavLink to="/dashboard/events" end className="sidebar-link submenu-link">
                        <FaCalendarAlt />
                        <span>All Events</span>
                    </NavLink>
                    <NavLink to="/dashboard/events/create" className="sidebar-link submenu-link">
                        <FaPlus />
                        <span>Create Event</span>
                    </NavLink>
                    <NavLink to="/dashboard/events/unpublished" className="sidebar-link submenu-link">
                        <FaEyeSlash />
                        <span>Unpublished</span>
                    </NavLink>
                </div>
                <NavLink to="/dashboard/contestants" className="sidebar-link">
                    <FaUsers />
                    <span>Contestants</span>
                </NavLink>
                <NavLink to="/dashboard/votes" className="sidebar-link">
                    <FaVoteYea />
                    <span>Votes</span>
                </NavLink>
            </nav>
        </aside>
    );
}
