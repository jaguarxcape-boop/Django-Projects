import { Link } from "react-router"
import Form from "../Components/forms/form.jsx"

const RegisterForm = () => {

    return <>
        <h2>Create An Account</h2>

        <p className="auth-subtitle">Join Now</p>


        <input type="text" defaultValue={"freduah"} name="username" autoComplete="true" placeholder="Username" required />
        <input type="email" defaultValue={"nanayawfreduah@gmail.com"} name="email" autoComplete="true" placeholder="Email Address" required />
        <input type="password" defaultValue={"secure09890"} name="password1" autoComplete="true" placeholder="Password" required />
        <input type="password" defaultValue={"secure09890"} name="password2" autoComplete="true" placeholder="Confirm Password" required />
        <button type="submit">Register</button>

        <p className="auth-switch">
            Already have an account?
            <Link to={'/auth/login'}>
                Login
            </Link>

        </p>
    </>
}
const Register = () => {

    

    return <>

        <Form name={"register"}>

            <RegisterForm  />
        </Form>
    </>
}



export default Register 