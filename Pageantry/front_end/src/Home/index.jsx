
import { Link } from 'react-router'
import './index.css'
import { AuthUrls } from '../baseUrl'
import { useEffect } from 'react'
import SearchBar from '../Components/search/search'
import { DASHBOARDURLS } from '../Dashboard/dashboardurls'


const Homepage = ({ authenticated, not_authenticated }) => {

    useEffect(() => {

        // console.log(authenticated)
    })
    return <>
        <section className="hero">
            <div className='hero-search'>
             <SearchBar placeholder='search for an event with tags (govco, di asa)...'/>
                {/* <input type='text' placeholder='' /> */}
            </div>
            <div className="hero-text">
                <h2>Welcome to Pageantry</h2>
                <p>Discover beauty, elegance, and talent. Join competitions, track winners, and celebrate pageantry with us.</p>
                <div className="buttons">
                    {
                        !authenticated.status ? <>

                            <Link className="get-started linkasbutton" to={AuthUrls().login}>
                                Get Started
                            </Link>

                            <Link className="learn-more linkasbutton" to={AuthUrls().register}>
                                Learn More
                            </Link>

                        </> : <>
                            <Link className="get-started linkasbutton" to={DASHBOARDURLS().home}>
                                My Dashboard
                            </Link>

                            <Link className="learn-more linkasbutton" to={'events/view'}>
                                View My Events
                            </Link>
                        </>
                    }

                </div>
            </div>
            <img src="images/mainLogo.webp" alt="Pageant Silhouette" />
        </section>
    </>
}

export default Homepage