import { BASE_URL, CSRFToken } from "./baseUrl"
import { fetchAccessToken } from "./fetchAccessToken"

export const ProtectRequestsApi = async ({
    ROUTE,
    METHOD = "GET",
    CUSTOMHEADER = {},
    SUCCESSCALLBACK,
    FAILCALLBACK
}) => {
    // THE ACCESS TOKEN IS FIRSTLY UPDATED
    // THEN THE REQUEST IS SENT TO THE SERVER IF AN OKAY RESPONSE IS RECEIVED IN THE fetchAccessToken function
    fetchAccessToken({
        setAuthenticated: undefined, setnotification: undefined, OKAYRESPONSECALLBACK: (() => {
            return console.log("I have fetched the latest ")
           

        })
    }).then(() => {


    })

}
