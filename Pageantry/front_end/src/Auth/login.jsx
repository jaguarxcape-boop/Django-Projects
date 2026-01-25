import { Link } from "react-router"
import Form from "../Components/forms/form.jsx"
import { useState } from "react"
import { Checkbox, CircularProgress } from "@mui/material"
import { AuthUrls, BASE_URL } from "../baseUrl.js"


const ResentLoginActivationLink = async ({ e, setShowResendActivationLink }) => {

    e.preventDefault()
    // Collect input values
    const body = {};
    const inputs = e.target.parentElement.querySelectorAll("input");

    inputs.forEach((input) => {
        body[input.name] = input.value;
    });

    try {
        setShowResendActivationLink(prev => ({ ...prev, is_sending_link: true }))
        const res = await fetch(BASE_URL(`${AuthUrls().resend_email_verificaition_link}/`), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });


        const data = await res.json()

        if (res.ok)
            if (data.code == 'verification_email_sent')
                return setShowResendActivationLink({ show_activation_link_sent: true })

            return setShowResendActivationLink({showResendButton:true})

         
    }

    catch (error) {
        alert("The Error ", JSON.stringify(error), " occurred")
    }
}
const LoginForm = ({ button, showResendActivationLink, setShowResendActivationLink }) => {

    return <>
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to continue</p>

        <input type="text" autoComplete="true" name="username" placeholder="Username" required />
        <input type="password" autoComplete="true" name="password" placeholder="Password" required />

        <div className="auth-options">
            {/* <label>
                <input type="checkbox" />
                Remember me
            </label> */}

            <Link to={'/auth/passwordreset'}>
                Forgot password?
            </Link>

        </div>


        {button.is_submitting_data ?
            <span style={{ display: "flex", justifyContent: "center" }}>

                <CircularProgress />
            </span>
            : <>
                <button type="submit">Login</button>
                {showResendActivationLink.showResendButton && <>
                    <a href="#" className="auth-switch" onClick={(e) => ResentLoginActivationLink({ e, setShowResendActivationLink })}>

                        Resend account activation link
                    </a>
                    {showResendActivationLink.is_sending_link &&
                        <CircularProgress style={{ width: "10px", height: "10px" }} />
                    }

                </>
                }
                {showResendActivationLink.show_activation_link_sent && <h4 className="auth-switch" style={{ color: "red" }}>Activation Link Sent</h4>}
            </>
        }
        <p className="auth-switch">
            Don’t have an account?

            <Link to={'/auth/register'}>
                Register
            </Link>

        </p>

    </>
}
const Login = ({ setAuthenticated }) => {
    const [body, setBody] = useState({})
    const [button, setButton] = useState({ is_submitting_data: false })
    const [showResendActivationLink, setShowResendActivationLink] = useState({ show_activation_link_sent: false, showResendButton: false })

    return <>

        <Form name={"login"} body={body} setShowResendActivationLink={setShowResendActivationLink} setButton={setButton} setAuthenticated={setAuthenticated} options={{ method: "GET" }} >

            <LoginForm setShowResendActivationLink={setShowResendActivationLink} showResendActivationLink={showResendActivationLink} setBody={setBody} button={button} />
        </Form>
    </>
}



export default Login

