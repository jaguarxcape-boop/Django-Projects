import { Link } from "react-router"
import Form from "../Components/forms/form.jsx"
import { useState } from "react"
import { Checkbox, CircularProgress } from "@mui/material"
import { AuthUrls, BASE_URL } from "../baseUrl.js"
import { FaEye, FaEyeSlash } from "react-icons/fa"


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

        return setShowResendActivationLink({ showResendButton: true })


    }

    catch (error) {
        alert("The Error ", JSON.stringify(error), " occurred")
    }
}
const LoginForm = ({ button, showResendActivationLink, setShowResendActivationLink,request_timeout }) => {


    const [showPassword, setShowPassword] = useState(false)

    return <>
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to continue</p>

        <input type="text" autoComplete="true" name="username" placeholder="Username" required />
        <label htmlFor="password">
            <div className="password-input-wrapper">
                <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="true"
                    placeholder="Password"
                    required
                />
                <span
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                >

                    {showPassword ? <FaEye style={{ color: "#1976d2" }} /> : <FaEyeSlash style={{ color: "#1976d2" }} />}

                </span>
            </div>
        </label>
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
                {request_timeout && <button type="submit">Login</button>}

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
    const [request_timeout, setrequest_timeout] = useState(true)

    return <>

        <Form name={"login"} body={body} setShowResendActivationLink={setShowResendActivationLink} setButton={setButton} setAuthenticated={setAuthenticated} options={{ method: "GET" }} setrequest_timeout={setrequest_timeout}>

            <LoginForm setShowResendActivationLink={setShowResendActivationLink} showResendActivationLink={showResendActivationLink} setBody={setBody} button={button} request_timeout={request_timeout} />
        </Form>
    </>
}



export default Login

