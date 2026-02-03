import { useState, useEffect } from "react";
import "./Header.css";
import { Link, useLocation } from "react-router";
import logo from "/images/mainLogo.webp"
import { useNavigate } from 'react-router-dom';
import { AuthUrls, BASE_URL } from "../baseUrl";
import Logout from "../Auth/logout.jsx";

import { FaBuilding, FaDashcube, FaHome, FaVoteYea } from "react-icons/fa";

export default function Header({
    authenticated,
    setnotification
}) {
    const navigate = useNavigate()
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    // Close menu when location changes
    useEffect(() => {
        setMenuOpen(false);
    }, [location]);

    const isHomePage = location.pathname === '/';
    const isVotingPage = location.pathname.includes('/vote');
    const isDashboard = location.pathname.includes('/dashboard');

    return (

        !isDashboard &&
        <header className="header" >
            {/* Hamburger */}

            <div className="header-container">

                {/* Logo */}

                <div>

                    <div className="logo-section" onClick={() => navigate('/')}>

                        <img src={logo} alt="Pageantry Logo" className="logo-img" />

                        <div className="logo-text">

                            <h1>Pageantry</h1>
                            <span className="logo-subtitle">Vote</span>
                        </div>
                    </div>
                </div>





                {/* Desktop Navigation */}
                <nav className="nav-desktop">
                    <Link to="/" className={`nav-link ${isHomePage ? 'active' : ''}`}>
                        <span className="nav-icon"><FaHome /></span>
                        <span>Home</span>
                    </Link>

                    <Link to="/vote" className={`nav-link ${isVotingPage ? 'active' : ''}`}>
                        <span className="nav-icon"><FaVoteYea /></span>
                        <span>Vote</span>
                    </Link>

                    {authenticated.status && !isDashboard && (
                        <>
                            <Link to="/dashboard" className={`nav-link ${isDashboard ? 'active' : ''}`}>
                                <span className="nav-icon">🏆</span>
                                <span>Dashboard</span>
                            </Link>
                            {/* <a href="/#features" className="nav-link">
                                <span className="nav-icon">✨</span>
                                <span>Features</span>
                            </a> */}
                        </>
                    )}
                    {authenticated.status ? (

                        <>

                            {/* <div className="mobile-logout"> */}
                            <Logout setnotification={setnotification} />
                            {/* </div> */}
                        </>
                    ) : (
                        <>
                            <Link to={AuthUrls().login} className="mobile-auth-btn login" onClick={() => setMenuOpen(false)}>
                                Login
                            </Link>
                            <Link to={AuthUrls().register} className="mobile-auth-btn register" onClick={() => setMenuOpen(false)}>
                                Sign Up
                            </Link>
                        </>
                    )}
                    {/* {!authenticated.status && (
                        <a href="/#features" className="nav-link">
                            <span className="nav-icon"><FaBuilding /></span>
                            <span>Features</span>
                        </a>
                    )} */}
                </nav>



                {/* Hamburger */}
                <div
                    className={`hamburger ${menuOpen ? "open" : ""}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    style={isDashboard ? { marginLeft: 'auto' } : {}}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${menuOpen ? "show" : ""}`}>
                <Link to="/" className={`mobile-link ${isHomePage ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                    🏠 Home
                </Link>
                <Link to="/vote" className={`mobile-link ${isVotingPage ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                    🗳️ Vote
                </Link>

                {authenticated.status && (!isDashboard &&
                    <>

                        <Link to="/dashboard" className={`mobile-link ${isDashboard ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                            🏆 Dashboard
                        </Link>
                        {/* <a href="/#features" className="mobile-link" onClick={() => setMenuOpen(false)}>
                            ✨ Features
                        </a> */}
                    </>
                )}

                {/* {!authenticated.status && (
                    <a href="/#features" className="mobile-link" onClick={() => setMenuOpen(false)}>
                        ✨ Features
                    </a>
                )} */}

                {authenticated.status ? (

                    <>


                        <Logout setnotification={setnotification} />

                    </>
                ) : (
                    <>
                        <Link to={AuthUrls().login} className="mobile-auth-btn login" onClick={() => setMenuOpen(false)}>
                            Login
                        </Link>
                        <Link to={AuthUrls().register} className="mobile-auth-btn register" onClick={() => setMenuOpen(false)}>
                            Sign Up
                        </Link>
                    </>
                )}
            </div>
        </header>

    )
}
