import { Link, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchAccessToken } from "../../fetchAccessToken";
import { DASHBOARDAPIURLS, DASHBOARDURLS } from "../dashboardurls";
import { BASE_URL } from "../../baseUrl.js";

import './event.css'
import CreateEvent from "./Create/createEvent.jsx";
import TopNav from "./Nav/topnav.jsx";
const EmptyEvents = ({setState}) => {
    const createEvent = {
        name: "",
        amount_per_vote: "1",
        bio: ""
    }

    return (
        <div className="empty-events-wrapper">
            <div className="empty-events-card fade-in">
                <div className="icon">🎉</div>
                <h2>No Events Yet</h2>
                <p>
                    You haven’t created any pageantry event yet.
                    <br />Start by creating your first event.
                </p>

                <Link onClick={(e) => {
                    e.preventDefault()
                    setState(createEvent)}} to={DASHBOARDURLS().events.create} className="create-btn" style={{ textDecoration: "none" }}>
                    Create an Event
                </Link>


            </div>
        </div>
    );
}
export default function Events() {

    const [state, setState] = useState([])

    const fetchEvents = async () => {

        try {
            const access_token = localStorage.getItem("access_token")
            const response = await fetch(`${BASE_URL(DASHBOARDAPIURLS().events)}`, {
                headers: {

                    "Authorization": `Bearer ${access_token}`, // ✅ FIXED
                },
            })


            if (response.ok) {
                const data = await (response.json())

                const profile = {

                    ...data,

                }
                console.log(profile)
                // setFormData({
                //     ...data.profile,
                //     ...data.phone,
                //     ...data.email,
                // })
            }



        } catch (error) {
            console.error("Protected request failed:", error)

        }

    }
    useEffect(() => {
        fetchAccessToken({ setAuthenticated: undefined, setnotification: undefined, OKAYRESPONSECALLBACK: fetchEvents })
    }, [])

    return (
        <>


                    <TopNav />

            {/* {state.length === 0 ? */}
                {/* // <EmptyEvents setState={setState} /> */}
                {/* // : */}
                <Routes>


                    {/* <> */}
                    <Route path="create/" element={<CreateEvent />} />
                    {/* </>} */}
                </Routes>
            {/* } */}


        </>
    );
}







