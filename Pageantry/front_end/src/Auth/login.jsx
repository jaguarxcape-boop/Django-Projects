import { Link } from "react-router"
import Form from "../Components/forms/form.jsx"
import { useState } from "react"

const LoginForm = () => {
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

        <button type="submit">Login</button>

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

    return <>

        <Form name={"login"} body={body} setAuthenticated={setAuthenticated} options={{ method: "GET" }} >

            <LoginForm setBody={setBody} />
        </Form>
    </>
}



export default Login

