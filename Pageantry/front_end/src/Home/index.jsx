import { Link } from 'react-router'
import './index.css'
import { AuthUrls } from '../baseUrl'
import { useEffect, useState } from 'react'
import SearchBar from '../Components/search/search'
import { DASHBOARDURLS } from '../Dashboard/dashboardurls'

const Homepage = ({ authenticated, setnotification }) => {
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    })

    return (
        <div className="homepage">
            {/* Hero Section */}
            <section className={`hero ${isScrolled ? 'scrolled' : ''}`}>
                <div className="hero-content">
                    <div className="hero-text">
                        <h1 className="hero-title">
                            <span className="highlight">Celebrate</span> Beauty, Elegance & Talent
                        </h1>
                        <p className="hero-subtitle">
                            Join the ultimate pageantry platform. Vote for your favorites, track winners, and be part of something extraordinary.
                        </p>

                        <div className="hero-search-wrapper">
                            <SearchBar setnotification={setnotification} placeholder='Search events (govco, beauty, talent...)' />
                        </div>

                        <div className="buttons-container">
                            {!authenticated.status ? (
                                <>
                                    <Link className="btn btn-primary" to={AuthUrls().login}>
                                        ✨ Get Started
                                    </Link>
                                    <Link className="btn btn-secondary" to={AuthUrls().register}>
                                        Create Account
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link className="btn btn-primary" to={DASHBOARDURLS().home}>
                                        🏆 My Dashboard
                                    </Link>
                                    <Link className="btn btn-secondary" to={'/vote'}>
                                        🗳️ Browse & Vote
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="hero-image-wrapper">
                        <div className="floating-card">
                            <img src="images/mainLogo.webp" alt="Pageant Silhouette" className="hero-image" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <h2 className="section-title">Why Choose Pageantry?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">⭐</div>
                        <h3>Discover Talent</h3>
                        <p>Find and support amazing contestants from around the world.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🏆</div>
                        <h3>Fair Voting</h3>
                        <p>Secure voting system with real-time results and transparency.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🗳️</div>
                        <h3>Multiple Votes</h3>
                        <p>Support your favorites with multiple votes per event.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">✨</div>
                        <h3>Live Tracking</h3>
                        <p>Watch rankings update in real-time as votes come in.</p>
                    </div>
                </div>
            </section>

            {/* Organizer Benefits Section */}
            <section className="organizer-benefits">
                <h2 className="section-title">For Organizers: Why Host With Us?</h2>
                <div className="organizer-grid">
                    <div className="organizer-card">
                        <div className="organizer-icon">🚀</div>
                        <h3>Effortless Setup</h3>
                        <p>Launch your pageant in minutes with our intuitive event creation tools. No coding required.</p>
                    </div>
                    <div className="organizer-card">
                        <div className="organizer-icon">📈</div>
                        <h3>Real-Time Analytics</h3>
                        <p>Track votes, revenue, and engagement instantly with our comprehensive dashboard.</p>
                    </div>
                    <div className="organizer-card">
                        <div className="organizer-icon">💳</div>
                        <h3>Secure Payments</h3>
                        <p>Integrated payment processing ensures you receive funds securely and on time.</p>
                    </div>
                    <div className="organizer-card">
                        <div className="organizer-icon">🌍</div>
                        <h3>Global Reach</h3>
                        <p>Expand your audience beyond borders and attract contestants from everywhere.</p>
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            {/* <section className="statistics">
                <div className="stats-container">
                    <div className="stat-card">
                        <div className="stat-number">50K+</div>
                        <p className="stat-label">Active Voters</p>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">200+</div>
                        <p className="stat-label">Events Hosted</p>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">1M+</div>
                        <p className="stat-label">Votes Cast</p>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">95%</div>
                        <p className="stat-label">Satisfaction Rate</p>
                    </div>
                </div>
            </section> */}

            {/* How It Works Section */}
            <section className="how-it-works">
                <h2 className="section-title">How It Works</h2>
                <div className="steps-container">
                    <div className="step-card">
                        <div className="step-number">1</div>
                        <h3>Browse Events</h3>
                        <p>Explore exciting pageantry events from around the world</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">2</div>
                        <h3>Vote for Favorites</h3>
                        <p>Support your favorite contestants with secure voting</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">3</div>
                        <h3>Track Results</h3>
                        <p>Watch live rankings and see results update in real-time</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">4</div>
                        <h3>Share & Celebrate</h3>
                        <p>Celebrate winners and share your voting experience</p>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials">
                <h2 className="section-title">What Our Users Say</h2>
                <div className="testimonials-grid">
                    <div className="testimonial-card">
                        <div className="stars">⭐⭐⭐⭐⭐</div>
                        <p className="testimonial-text">"The best pageantry platform I've used. Voting is smooth, and the live results keep me engaged!"</p>
                        <p className="testimonial-author">— Sarah M., Beauty Enthusiast</p>
                    </div>
                    <div className="testimonial-card">
                        <div className="stars">⭐⭐⭐⭐⭐</div>
                        <p className="testimonial-text">"As an event organizer, this platform has made hosting pageants so much easier and more transparent."</p>
                        <p className="testimonial-author">— James T., Event Organizer</p>
                    </div>
                    <div className="testimonial-card">
                        <div className="stars">⭐⭐⭐⭐⭐</div>
                        <p className="testimonial-text">"I love how I can vote multiple times for my favorites and track results in real-time. Highly recommended!"</p>
                        <p className="testimonial-author">— Linda P., Talent Scout</p>
                    </div>
                </div>
            </section>

            {/* Security & Trust Section */}
            <section className="security-trust">
                <h2 className="section-title" style={{ color: "white !important" }}>Your Trust, Our Priority</h2>
                <div className="trust-grid">
                    <div className="trust-item">
                        <div className="trust-icon">🔒</div>
                        <h3>Bank-Level Security</h3>
                        <p>Advanced encryption and fraud detection protects every vote</p>
                    </div>
                    <div className="trust-item">
                        <div className="trust-icon">✅</div>
                        <h3>Fair Voting</h3>
                        <p>Anti-fraud measures ensure fair results for all contestants</p>
                    </div>
                    <div className="trust-item">
                        <div className="trust-icon">📊</div>
                        <h3>Transparent Results</h3>
                        <p>Real-time leaderboards and detailed vote tracking</p>
                    </div>
                    <div className="trust-item">
                        <div className="trust-icon">🛡️</div>
                        <h3>Privacy Protected</h3>
                        <p>Your personal data is never shared or sold</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>Ready to Join the Pageantry Revolution?</h2>
                    <p>Start voting today and be part of the excitement</p>
                    <div className="cta-buttons">
                        {!authenticated.status ? (
                            <>
                                <Link className="cta-btn primary" to={AuthUrls().register}>
                                    Sign Up Free
                                </Link>
                                <Link className="cta-btn secondary" to={AuthUrls().login}>
                                    Login to Account
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link className="cta-btn primary" to={'/vote'}>
                                    Start Voting Now
                                </Link>
                                <Link className="cta-btn secondary" to={DASHBOARDURLS().home}>
                                    Go to Dashboard
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            {/* <footer className="footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4>Pageantry</h4>
                        <p>The ultimate platform for pageantry events and voting.</p>
                    </div>
                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link to="/vote">Browse Events</Link></li>
                            <li><Link to="#">About Us</Link></li>
                            <li><Link to="#">Contact</Link></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h4>Legal</h4>
                        <ul>
                            <li><Link to="#">Privacy Policy</Link></li>
                            <li><Link to="#">Terms of Service</Link></li>
                            <li><Link to="#">Security</Link></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h4>Follow Us</h4>
                        <div className="social-links">
                            <a href="#" title="Facebook">f</a>
                            <a href="#" title="Twitter">𝕏</a>
                            <a href="#" title="Instagram">📷</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 Pageantry. All rights reserved. Made with ❤️</p>
                </div>
            </footer> */}
        </div>
    )
}

export default Homepage
