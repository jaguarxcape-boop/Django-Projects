import { useEffect, useState } from "react";
import { BASE_URL } from "../../../baseUrl";
import { EVENTAPIURLS } from "../../dashboardurls";
import EventCard from "./card"
import { ProtectRequestsApi } from "../../../apiCalls";
import { fetchAccessToken } from "../../../fetchAccessToken";


const fetchEvents = async ({ setState }) => {
    const access_token = localStorage.getItem("access_token");
    try {
        const res = await fetch(BASE_URL(EVENTAPIURLS().unpublished), {
            headers: {
                // ❌ DO NOT set Content-Type when sending FormData
                Authorization: `Bearer ${access_token}`,
            },


        });
        const data = await res.json();

        if (data.status == "success") {
            setState(data.events)

        }
    }
    catch (error) {
        console.error("Error fetching events:", error);
    }
}
export const ViewEvents = () => {
    const [events, setEvents] = useState([])
    useEffect(() => {
        fetchAccessToken({ setAuthenticated: undefined, setnotification: undefined, OKAYRESPONSECALLBACK: ()=>fetchEvents ({ setState: setEvents }) })

    }, [])

    return <>
        {events.length == 0 && <p>No unpublished events available.</p>}
        {events.length !== 0 && events.map((event) => <EventCard event={event} key={event.id} />)}
    </>

}