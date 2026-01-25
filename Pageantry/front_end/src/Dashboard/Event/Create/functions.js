import { BASE_URL } from "../../../baseUrl.js";
import { fetchAccessToken } from "../../../fetchAccessToken.js";
import { DASHBOARDURLS, EVENTAPIURLS } from "../../dashboardurls.js";
import { STORAGE_KEY } from "./createEvent.jsx";

export const submitEventCreationForm = ({ formData, setFormMessage }) => {
    const submit = async () => {
        try {
            const response = await fetch(
                BASE_URL(EVENTAPIURLS().create),
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setFormMessage({
                    type: "error",
                    statusText: data.message || data.statusText || data.detail || ["Failed to create event"],
                });
                return;
            }

            setFormMessage({
                type: "success",
                statusText: ["Event created successfully"],
            });
            // localStorage.removeItem(STORAGE_KEY)
            // GO TO THE RECENTLY CREATED EVENT
            // window.location.pathname = DASHBOARDURLS().events.unpublished
        } catch (error) {
            setFormMessage({
                type: "error",
                statusText: ["Network error. Please try again."],
            });
        }
    };

    fetchAccessToken({ OKAYRESPONSECALLBACK: submit });
}


