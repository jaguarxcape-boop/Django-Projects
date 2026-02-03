import { useState } from "react";
import { SubmitForm } from "./submit_form";
import "./form.css";


export const Message = ({ statusText, type }) => {
    // {statusText.forEach(text => <p className="message error">{text}</p>)}

    return <>
        {statusText.map((text, key) => <p key={key} className={`message ${type}`}>{text}</p>)}

    </>

}

export default function Form({is_validated, setrequest_timeout, setShowResendActivationLink, style, setpassword_reset_state, children, name, body, setAuthenticated,setButton }) {

    const [state, setState] = useState({ type: '', code: "", statusText: [] })
    
    return (
        <form  className="auth-form" method="POST" onSubmit={(e) => SubmitForm({setpassword_reset_state, setAuthenticated, setButton, e, name, body, setState, is_validated,setShowResendActivationLink, setrequest_timeout })} style={style}>

            {state.statusText &&
                <Message statusText={state.statusText} type={state.type} />
            }
            {children}
        </form>
    );
}
