import { Link } from "react-router"
import Form from "../Components/forms/form.jsx"
import { useState } from "react"
import { CircularProgress } from "@mui/material"

const PasswordResetForm = ({ button, password_reset_state }) => {
    return <>

        {
            password_reset_state.status == "success" ? <>
                <h2>Link Sent</h2>
                <p>Follow it to reset your password</p>
            </> : <>
                <h2>Reset Password</h2>
                <p className="auth-subtitle">
                    Enter your email to receive reset instructions
                </p>

                <input type="email" name="address" placeholder="Email Address" required />

                {button.is_submitting_data ?

                    <span style={{ display: "flex", justifyContent: "center" }}>
                        <CircularProgress />
                    </span>
                    :
                    <button type="submit">Send Reset Link</button>
                }
                <p className="auth-switch">
                    <Link to={'/auth/login'}>
                        Back to Login
                    </Link>

                </p>
            </>
        }


    </>
}
export default function PasswordReset() {
    const [button, setButton] = useState({ is_submitting_data: false })
    const [password_reset_state, setpassword_reset_state] = useState({ "status": "" })
    return <Form name={"reset_password"} setpassword_reset_state={setpassword_reset_state} setButton={setButton}>

        <PasswordResetForm button={button} password_reset_state={password_reset_state} />
    </Form>

}
