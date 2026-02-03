import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import './sidebar.css';
import { FaTachometerAlt, FaUser, FaShieldAlt, FaCalendarAlt, FaUsers, FaPlus, FaEyeSlash, FaChevronRight, FaHamburger, FaHome } from 'react-icons/fa';
import { HiMenu } from 'react-icons/hi';
export default function Sidebar() {
    const location = useLocation();
    const onEventsPage = location.pathname.startsWith('/dashboard/events');

    const [isEventsOpen, setEventsOpen] = useState(onEventsPage);
    const [userHasInteracted, setUserHasInteracted] = useState(false);

    useEffect(() => {
        // Keep the submenu open if user is on an events page
        if (onEventsPage) {
            setEventsOpen(true);
        } else {
            // Only close if user has manually interacted and navigated away
            if (userHasInteracted) {
                setEventsOpen(false);
            }
        }
    }, [location.pathname]);

    const toggleEvents = () => {
        setEventsOpen(!isEventsOpen);
        // Once the user clicks the toggle, they are in manual control.
        setUserHasInteracted(true);
    };

    const [menuOpen, setMenuOpen] = useState(true);

    return (
        <>
           


               

                <aside className="sidebar"
                    style={{ transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease-in-out' }}>
                <h2 className="sidebar-title">Hello {'Freduah'}
</h2>
                    
                    
             



                    <nav className="sidebar-nav"
                    >

                        <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            <FaHome />
                            <span>Home</span>
                        </NavLink>
                        <NavLink to="/dashboard/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            <FaUser />
                            <span>Profile</span>
                        </NavLink>
                        <NavLink to="/dashboard/security" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            <FaShieldAlt />
                            <span>Security</span>
                        </NavLink>
                        <div className={`sidebar-link ${isEventsOpen ? 'active' : ''}`} onClick={toggleEvents} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && toggleEvents()} aria-expanded={isEventsOpen}>
                            <FaCalendarAlt />
                            <span>Events</span>
                            <FaChevronRight className={`chevron-icon ${isEventsOpen ? 'open' : ''}`} />
                        </div>
                        <div className={`sidebar-submenu ${isEventsOpen ? 'open' : ''}`}>
                            <NavLink to="/dashboard/events" end className={({ isActive }) => `sidebar-link submenu-link ${isActive ? 'active' : ''}`}>
                                <FaCalendarAlt />
                                <span>All Events</span>
                            </NavLink>
                            <NavLink to="/dashboard/events/create" className={({ isActive }) => `sidebar-link submenu-link ${isActive ? 'active' : ''}`}>
                                <FaPlus />
                                <span>Create Event</span>
                            </NavLink>
                            <NavLink to="/dashboard/events/unpublished" className={({ isActive }) => `sidebar-link submenu-link ${isActive ? 'active' : ''}`}>
                                <FaEyeSlash />
                                <span>Unpublished</span>
                            </NavLink>
                        </div>
                        <NavLink to="/dashboard/contestants" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            <FaUsers />
                            <span>Contestants</span>
                        </NavLink>
                    </nav>
                </aside>
            
        </>
    );
}
