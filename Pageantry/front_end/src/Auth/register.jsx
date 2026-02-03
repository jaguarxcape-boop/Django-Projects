import { Link } from "react-router"
import Form from "../Components/forms/form.jsx"
import { useState } from "react"

import { CircularProgress } from '@mui/material'
import { FaEye, FaEyeSlash } from "react-icons/fa"
const RegisterForm = ({ button }) => {

    const [showPassword, setShowPassword] = useState(false)
    return <>
        <h2>Create An Account</h2>

        <p className="auth-subtitle">Join Now</p>

        <input type="text"
            // defaultValue={"freduah"} 
            name="username" autoComplete="true" placeholder="Username" required />
        <input type="email"
            // defaultValue={"nanayawfreduah@gmail.com"} 
            name="email" autoComplete="true" placeholder="Email Address" required />
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

        <label htmlFor="password2">
                    <div className="password-input-wrapper">
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password2"
                        autoComplete="true"
                        placeholder="Password"
                        required
                    />
{/* 
                    <span
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                    >

                        {showPassword ? <FaEye style={{ color: "#1976d2" }} /> : <FaEyeSlash style={{ color: "#1976d2" }} />}

                    </span> */}
                </div>

        </label>
       
        {button.is_submitting_data ?
            <span style={{ display: "flex", justifyContent: "center" }}>

                <CircularProgress />
            </span>

            :


            <button type="submit">Register</button>}

        <p className="auth-switch">
            Already have an account?
            <Link to={'/auth/login'}>
                Login
            </Link>

        </p>
    </>
}
const Register = () => {
    const [button, setButton] = useState({ is_submitting_data: false })


    return <>

        <Form name={"register"} setButton={setButton}>

            <RegisterForm button={button} />
        </Form>
    </>
}



export default Register 