
import { ProtectRequestsApi } from "../apiCalls"
import { AuthUrls, BASE_URL, CSRFToken } from "../baseUrl"
import { fetchAccessToken } from "../fetchAccessToken"

const Logout = ({ setnotification }) => {

    return <>
        <div className="cta" onClick={() => deleteToken({ setnotification })}>
            <button>Logout</button>
        </div>
    </>
}

export default Logout



const blackListToken = async ({ setnotification }) => {

    const access_token = localStorage.getItem("access_token");
    const refresh_token = localStorage.getItem("refresh_token");
    const tokenBody = JSON.stringify({ "refresh_token": refresh_token })
    await fetch(BASE_URL(AuthUrls().blacklistToken), {
        method: "POST",
        headers: {
            "Content-Type": 'application/json',
            "Authorization": `Bearer ${access_token}`,
        },
        body: tokenBody
    }).then((res) => res.json()).then((data) => {
        localStorage.clear();
        setnotification({
            title: `Logout Successful ${data.status}`,
            message: "You will be redirected to login soon"
        })
        return setTimeout(() => {
            window.location.href = AuthUrls().login;
        }, 3000)

    })

}

const deleteToken = async ({ setnotification }) => {
    fetchAccessToken({ setAuthenticated: undefined, setnotification }).then(() => blackListToken({ setnotification }))


    // UPDATE AND FETCH THE LATEST REFRESHTOKEN

    // PASS A SUCCESS CALLBACK TO BLACKLIST THE NEWLY UPDATED REFRESHTOKEN AND DELETE IT FROM THE LOCAL STORAGE












}