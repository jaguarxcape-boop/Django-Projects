import { Link } from "react-router"
import Form from "../Components/forms/form.jsx"

const PasswordResetForm = () => {
    return <>
        <h2>Reset Password</h2>
        <p className="auth-subtitle">
            Enter your email to receive reset instructions
        </p>

        <input type="email" placeholder="Email Address" required />

        <button type="submit">Send Reset Link</button>

        <p className="auth-switch">
            <Link to={'/auth/login'}>
                Back to Login
            </Link>

        </p>

    </>
}
export default function PasswordReset() {
    return <Form>
        <PasswordResetForm />
    </Form>

}
