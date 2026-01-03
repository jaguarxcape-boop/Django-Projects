
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, } from 'react-router'
import Layout from './Layout/layout.jsx'
import { useState, useEffect } from 'react'
import Register from './Auth/register.jsx'
import Login from './Auth/login.jsx'
import PasswordReset from './Auth/passwordreset.jsx'
// import { fetchAccessToken } from './fetchAccessToken.js'
import Homepage from './Home/index.jsx'
import { Navigate } from 'react-router'
// import { ProtectRequestsApi } from './apiCalls.js'
import Notification from './Components/notification/notification.jsx'
import DashboardLayout from './Dashboard/index.jsx'


const PublicRoute = ({ authenticated, children }) => {
    return authenticated && authenticated.status ? <Navigate to="/" replace /> : children;
}
const App = () => {

    const token = (localStorage.getItem("access_token"))
    const [authenticated, setAuthenticated] = useState({ status: token ? true : false, accessToken: token ? token : undefined, user: {} })


    const [notification, setnotification] = useState({
        title: "",
        message: "",
        notifications: [],
    });

    useEffect(() => {
        // const currentPath = window.location.pathname
        // if (!currentPath.includes('auth'))
        // fetchAccessToken({ setAuthenticated, setnotification })
    }, []);

    // useEffect(() => {
    //     if (authenticated && authenticated.status) {
    //         ProtectRequestsApi({
    //             METHOD: "GET",
    //             ROUTE: "api/user/profile/",

    //             SUCCESSCALLBACK: (res) => {    
    //                 console.log(res)
    //               },
    //             FAILCALLBACK: (err) => {
    //                 setnotification({
    //                     title: "Error Fetching User Data",
    //                     message: "Failed to fetch user data",
    //                     notifications: [err?.message || "An error occurred while fetching user data"],
    //                 })
    //             }

    //         })


    //     }
    // }, [authenticated]);

    const router = createBrowserRouter(
        createRoutesFromElements(
            <>
                {/* Public & main layout */}
                <Route path="/" element={<Layout authenticated={authenticated} setnotification={setnotification} />}>
                    <Route path="auth/register" element={
                        <PublicRoute authenticated={authenticated}><Register /></PublicRoute>
                    } />
                    <Route path="auth/login" element={
                        <PublicRoute authenticated={authenticated}><Login setAuthenticated={setAuthenticated} /></PublicRoute>
                    } />
                    <Route path="auth/passwordreset" element={
                        <PublicRoute authenticated={authenticated}><PasswordReset /></PublicRoute>
                    } />

                    <Route index element={<Homepage authenticated={authenticated} />} /> {/* / */}
                </Route>

                {/* Dashboard routes */}
                <Route path="dashboard/*" element={authenticated.status ? <DashboardLayout setnotification={setnotification} /> : <Navigate to="/auth/login" replace />}/>
            </>
        )
    );
    return (
        <>
            {
                notification.message && <Notification
                    title={notification.title || "Notification"}
                    message={notification.message}
                    notifications={notification.notifications}
                    onClose={() => setnotification({})}
                    position="top-right"
                />
            }
            {/* <button onClick={() => fetchAccessToken({ setAuthenticated, setnotification })}>Check</button> */}

            <RouterProvider router={router} />

        </>
    )
}
export default App






