import { AuthUrls, CSRFToken } from "./baseUrl";
import { BASE_URL } from "./baseUrl";

export const fetchAccessToken = async ({ setAuthenticated, setnotification, OKAYRESPONSECALLBACK }) => {


    const refresh_token = (localStorage.getItem("refresh_token"))
    // This will return null if there is no refresh_token in local storage


    try {
        const response = await fetch(BASE_URL(`${AuthUrls().refreshToken}/`), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ "refresh_token": refresh_token })
        });
        const data = await response.json();

        if (response.ok) {
            if (data.status == true) {
                localStorage.setItem("access_token", data.access_token);
                setnotification != undefined &&
                    setnotification({
                        title: `Hey Just Checking... 😂`,
                        message: "Yeah you're still logged in",
                        notifications: ["Ignore this message and continue cruising😁"]
                    })

                setnotification != undefined && (setTimeout(() => setnotification({}), 3000))
                // Update state with the new token while keeping existing user data
                setAuthenticated != undefined && setAuthenticated(prev => ({
                    ...data
                    // If the refresh endpoint also returns user info, update it here:
                    // user: data.user || prev.user
                }));
                // ANY CALLBACK THAT WANTS TO RUN WILL RUN HERE
                if (OKAYRESPONSECALLBACK) {
                    return await OKAYRESPONSECALLBACK();
                }
                return;
            }
            if (data.status == false) {
                localStorage.clear()
                window.location.pathname = (AuthUrls().login)
                setnotification != undefined && (setTimeout(() => setnotification({ "title": data.title, "message": data.message }), 3000))

            }
        }

        if (!response.ok) {
            setnotification != undefined && setnotification({
                title: `Authentication Failed With Code ${response.status}`,
                message: response.statusText,
                notifications: [""]
            })
            setTimeout(() => setnotification({}), 3000)
        }
    }


    catch {


        setnotification != undefined && setnotification({
            title: "Could Not Authenticate",
            message: "Please Check Your Connection",
            notifications: ["You Can Try To Login Again"]
        })
        setnotification != undefined && setTimeout(() => setnotification({}), 3000)

        setAuthenticated != undefined && setAuthenticated({ status: false, access_token: "", user: {} });
    }

};