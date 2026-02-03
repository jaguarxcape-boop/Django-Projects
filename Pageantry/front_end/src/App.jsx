
import './global.css'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, } from 'react-router'
import Layout from './Layout/layout.jsx'
import { useState, useEffect } from 'react'
import Register from './Auth/register.jsx'
import Login from './Auth/login.jsx'
import PasswordReset from './Auth/password_reset_start.jsx'
import VerifyEmailPage from './Auth/verifyemail.jsx'
// import { fetchAccessToken } from './fetchAccessToken.js'
import Homepage from './Home/index.jsx'
import { Navigate } from 'react-router'
// import { ProtectRequestsApi } from './apiCalls.js'
import Notification from './Components/notification/notification.jsx'
import DashboardLayout from './Dashboard/index.jsx'
import PasswordResetDone from './Auth/password_reset_end.jsx'
import VotingLayout from './Voting/index.jsx'


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
            <Route path="/" element={<Layout authenticated={authenticated} setnotification={setnotification} />}>
                {/* Home & Auth Routes */}
                <Route index element={<Homepage setnotification={setnotification} authenticated={authenticated} />} />
                <Route path="auth/register" element={
                    <PublicRoute authenticated={authenticated}><Register /></PublicRoute>
                } />
                <Route path="auth/login" element={
                    <PublicRoute authenticated={authenticated}><Login setAuthenticated={setAuthenticated} /></PublicRoute>
                } />
                <Route path="auth/verify-email" element={
                    <PublicRoute authenticated={authenticated}><VerifyEmailPage /></PublicRoute>
                } />
                <Route path="auth/passwordreset" element={
                    <PublicRoute authenticated={authenticated}><PasswordReset /></PublicRoute>
                } />
                <Route path="auth/password_reset_done" element={
                    <PublicRoute authenticated={authenticated}><PasswordResetDone /></PublicRoute>
                } />

                {/* Voting Routes (Public - no authentication required) */}
                <Route path="vote/*" element={<VotingLayout setnotification={setnotification} />} />
    
                {/* Dashboard routes */}
                <Route path="dashboard/*" element={authenticated.status ? <DashboardLayout setnotification={setnotification} /> : <Navigate to="/auth/login" replace />} />
            </Route>
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
