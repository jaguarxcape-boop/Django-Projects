import { AuthUrls, BASE_URL, CSRFToken } from "../../baseUrl"



const HandleRegistrationForm = ({ data, setState }) => {

    if (data.code == "registration_successful") {
        window.location.replace('/auth/login')

        setState(data)
    }


    // HANDLE INVALID REGISTRATION FORM
    if (data.code == "invalid_form") {
        const dataKeys = [
            'email',
            'password1',
            'password2',
            'username'
        ]

        dataKeys.forEach((d) => {
            var gottenErrors = data.statusText[d]
            if (gottenErrors) {

                setState({
                    ...data,
                    statusText: gottenErrors
                })
            }
        })
    }
}
export const SubmitForm = async ({ e, name, setState, setAuthenticated }) => {


    // this is to prevent the form from making the page refresh
    // this is to empty the form notification container
    e.preventDefault()
    setState({})
    setState({})
    const inputElements = e.target.querySelectorAll('input')
    var body = {}
    inputElements.forEach(element => {
        body[element.name] = element.value
    })

    const res = await fetch(BASE_URL(`${AuthUrls()[name]}/`), {
        method: "POST",
        headers: {
            "Content-Type": 'application/json',
            "X-CSRFToken": CSRFToken,
            // "credentials": name === "login" ? "include" : ""
        },

        body: JSON.stringify(body)
    })


    const data = await res.json()
    if (res.ok) {
        if (data.code == "debugging" || data.code == "error") {
            return setState(data)
        }
        if (name == "register") {
            return HandleRegistrationForm({ setState, data })
        }

        if (name == "login") {
            // HANDLE SUCESSFUL LOGIN
            if (data.code == "login_successful") {

                localStorage.setItem("access_token", data.access_token)
                localStorage.setItem("refresh_token", data.refresh_token)
                localStorage.setItem("user", JSON.stringify(data.user))
            }
        }

        setAuthenticated(data)


    }





    // }) : (() => { })).catch(error => {



    //     setState({
    //         type: "error",
    //         code: "Connection Error",
    //         statusText: [
    //             "Connection Error",
    //             error.message
    //         ]
    //     })
    //     console.log("Error Happened, Deal With It")
    // })




}




