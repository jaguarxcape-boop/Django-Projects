import { BASE_URL } from "../../../baseUrl";
import { fetchAccessToken } from "../../../fetchAccessToken";
import { EVENTAPIURLS } from "../../dashboardurls";

export const submit_event_creation_form = ({ formData, setform_message }) => {
    const CALLBACK = async () => {
        const access_token = localStorage.getItem("access_token")
        const res = await fetch(BASE_URL(EVENTAPIURLS().create), {
            method: "POST",
            headers: {
                "Content-type": 'application/json',
                "Authorization": `Bearer ${access_token}`,

            },
            body: JSON.stringify(formData)

        })

        if (res.ok) {
            const data = await res.json()
            
            if (data.status == "invalid_form") {
                alert(JSON.stringify(data))
                // setform_message(data)
                // const dataKeys = [
                //     'name',
                //     'bio',
                //     'banner',
                //     'start_time',
                //     'end_time',
                // ]

                // return dataKeys.forEach((d) => {
                //     var gottenErrors = data.statusText[d]

                //     if (gottenErrors) {

                //         setform_message([])
                //     }
                // })
            }
        }
    }


    fetchAccessToken({ setAuthenticated: null, setnotification: null, OKAYRESPONSECALLBACK: CALLBACK })

}



