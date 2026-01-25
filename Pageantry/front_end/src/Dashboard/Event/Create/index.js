import { BASE_URL } from "../../../baseUrl";
import { fetchAccessToken } from "../../../fetchAccessToken";
import { EVENTAPIURLS } from "../../dashboardurls";

export const submit_event_creation_form = ({ formData, setform_message }) => {
  const CALLBACK = async () => {
    const access_token = localStorage.getItem("access_token");

    try {
      const res = await fetch(BASE_URL(EVENTAPIURLS().create), {
        method: "POST",
        headers: {
          // ❌ DO NOT set Content-Type when sending FormData
          Authorization: `Bearer ${access_token}`,
        },
        body: formData, // ✅ FormData (contains image)
      });

      const data = await res.json();

      if (!res.ok) {
        setform_message({
          type: "error",
          statusText:
            data.statusText ||
            data.detail ||
            ["Failed to create event"],
        });
        return;
      }

      // Handle invalid form from backend
      if (data.status === "invalid_form") {
        setform_message({
          type: "error",
          statusText: Object.values(data.statusText || {}).flat(),
        });
        return;
      }

      // ✅ Success
      setform_message({
        type: "success",
        statusText: ["Event created successfully 🎉"],
      });

    } catch (error) {
      setform_message({
        type: "error",
        statusText: ["Network error. Please try again."],
      });
    }
  };

  fetchAccessToken({
    setAuthenticated: null,
    setnotification: null,
    OKAYRESPONSECALLBACK: CALLBACK,
  });
};
