import { useState } from "react";
import { SubmitForm } from "./submit_form";
import "./form.css";


export const Message = ({ statusText, type }) => {
    // {statusText.forEach(text => <p className="message error">{text}</p>)}

    return <>
        {statusText.map((text, key) => <p key={key} className={`message ${type}`}>{text}</p>)}

    </>

}

export default function Form({ children, name, body, setAuthenticated }) {

    const [state, setState] = useState({ type: '', code: "", statusText: [] })

    return (
        <form className="auth-form" method="POST" onSubmit={(e) => SubmitForm({ setAuthenticated, e, name, body, setState })}>

            {state.statusText &&
                <Message statusText={state.statusText} type={state.type} />
            }
            {children}
        </form>
    );
}
