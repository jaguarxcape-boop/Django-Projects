import { ProtectRequestsApi } from "../apiCalls"
import { BASE_URL } from "../baseUrl"
import { fetchAccessToken } from "../fetchAccessToken"

export const DASHBOARDAPIURLS = () => ({ "home": "/dashboard/", "profile": 'profile/', "events": 'profile/events/', "settings": 'dashboard/settings/' })

export const EVENTAPIURLS = ()=> ({'create': 'event/create/'})
export const DASHBOARDURLS = () => ({
    "home": "/dashboard/", "profile": 'dashboard/profile/',
    "events": {
        "home": 'dashboard/events/', 
        "unpublished": "/dashboard/events/unpublished", 
        "create": "/dashboard/events/create/", "published": "/dashboard/events/published/"
    }, "settings": 'dashboard/settings/'
})


export const FETCHDASHBOARDPROFILEAPI = (setFormData) => {
    const fetchProfile = async () => {
        try {
            const access_token = localStorage.getItem("access_token")
            const response = await fetch(`${BASE_URL(DASHBOARDAPIURLS().profile)}`, {
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



    fetchAccessToken({ setAuthenticated: undefined, setnotification: undefined, OKAYRESPONSECALLBACK: fetchProfile })
}