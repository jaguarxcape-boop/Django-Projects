import { useState } from "react";
import "./Header.css";
import { Link } from "react-router";
import logo from "/images/mainLogo.webp"
import { useNavigate } from 'react-router-dom';
import { AuthUrls, BASE_URL } from "../baseUrl";
import Logout from "../Auth/logout.jsx";

export default function Header({
    authenticated,
    setnotification
}) {
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false);
    const AuthLinks = [
        { to: `events`, name: "All Events" },
        { to: "events/", name: "Other Events" },

    ]

    return (
        <header className="header">
            <div className="header-container">

                {/* Logo */}
                <div className="logo" onClick={() => navigate('/')}>
                    <img src={logo} height={"50px"} alt="Logo" />
                    <span>Pageantry Vote</span>
                </div>


                <nav className="nav">

                    {authenticated.status ?
                        <>  {AuthLinks.map((link, key) =>
                            <>
                                <div className="cta" id={key} to={link.to}>
                                    <button>{link.name.toUpperCase()}</button>
                                </div>

                            </>)}
                            <div className="logo" style={{ "flexDirection": "column", borderRadius: "100px" }} >
                                <img src={logo} height={"50px"} alt="Logo" />
                            </div>
                        </>
                        : <>

                            <div className="cta" >
                                <button>
                                    <Link className="get-started linkasbutton" to={AuthUrls().login} style={{ color: "black" }}>
                                        Register / Login
                                    </Link>
                                </button>

                            </div>


                        </>}
                </nav>

                {/* CTA Button */}
                {/* <div className="cta">
                    <button>Get Started</button>
                </div> */}
                {authenticated.status &&
                <Logout setnotification={setnotification}/>
                }
                {/* Hamburger */}
                <div
                    className={`hamburger ${menuOpen ? "open" : ""}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${menuOpen ? "show" : ""}`}>
                <a onClick={() => setMenuOpen(false)} href="#home">Home</a>
                <a onClick={() => setMenuOpen(false)} href="#about">About</a>
                <a onClick={() => setMenuOpen(false)} href="#services">Services</a>
                <a onClick={() => setMenuOpen(false)} href="#contact">Contact</a>
                <button>Get Started</button>
            </div>
        </header >
    );
}
