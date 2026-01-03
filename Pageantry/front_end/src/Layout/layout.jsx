import { Link } from 'react-router'
import Header from './header'
import Footer from './footer'
import { Outlet } from "react-router-dom"
const Layout = ({ authenticated,setnotification }) => {



    return <div>


        <Header setnotification={setnotification} authenticated={authenticated} />
        {<Outlet />}
        <Footer />
    </div>
}

export default Layout 