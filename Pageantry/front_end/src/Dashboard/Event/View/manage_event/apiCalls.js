import { BASE_URL } from "../../../../baseUrl"
import {EVENTAPIURLS } from "../../../dashboardurls"


export const GetEventDetails = async ({ eventId, setState }) => {

    const call = await fetch(`${BASE_URL(EVENTAPIURLS().event_details("{eventId}"))}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
    })

    if (!call.ok) return console.log("Not Okay Response")
    const data = await call.json()

    if (data.status == "success") {

        console.log("Data is", data)
    }

}

