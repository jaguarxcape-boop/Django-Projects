import { AuthUrls, BASE_URL, CSRFToken } from "../../baseUrl"



const HandleRegistrationForm = ({ data, setState }) => {
  setState(data)
  if (data.code == "registration_successful") {
    // Redirect to email verification page after successful registration
    window.location.replace('/auth/verify-email')


  }


  // HANDLE INVALID REGISTRATION FORM
  // if (data.code == "invalid_form") {
  //   return setState(data)
  // }
}


const HandleLoginForm = ({ data, setAuthenticated, setShowResendActivationLink }) => {
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);
  localStorage.setItem("user", JSON.stringify(data.user));

  setAuthenticated({
    status: true,
    accessToken: data.access_token,
    user: data.user,
  });

  if (data.code == 'email_not_verified') {
    alert("Running Here")
    return setShowResendActivationLink(true)
  }
  window.location.replace("/");
}


export const SubmitForm = async ({
  e,
  name,
  is_validated,
  setState,
  setButton,
  setAuthenticated,
  setpassword_reset_state,
  setShowResendActivationLink
}) => {
  e.preventDefault();


  // Enable loading state
  if (typeof setButton === "function") {
    setButton({ is_submitting_data: true });
  }

  // Clear previous messages
  if (typeof setState === "function") {
    setState({});
  }

  // Run validation if provided
  if (typeof is_validated === "function") {

    const isValid = is_validated(e);
    if (!isValid) {
      if (typeof setButton === "function") {
        setButton({ is_submitting_data: false });
      }
      return;
    }
  }

  // Collect input values
  const body = {};
  const inputs = e.target.querySelectorAll("input");

  inputs.forEach((input) => {
    body[input.name] = input.value;
  });


  try {
    const res = await fetch(BASE_URL(`${AuthUrls()[name]}/`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": CSRFToken,
      },
      body: JSON.stringify(body),
    });


    const data = await res.json();


    // Stop loading
    if (typeof setButton === "function") {
      setButton({ is_submitting_data: false });
    }





    // Register
    console.log(name)
    if (name === "register") {

      return HandleRegistrationForm({ setState, data });
    }

    // Login
    if (name === "login" && data.code === "login_successful") {
      return HandleLoginForm({ data, setShowResendActivationLink, setAuthenticated })
    }
    // Password reset done
    if (name === "password_reset_done") {
      if (data.code == "success") {
        window.location.replace('/' + AuthUrls().login)
      }
    }
    // Password reset
    if (name === "reset_password" && data.type === "success") {
      setpassword_reset_state({ status: "success" });
      return;
    }

    // Email not verified
    if (data.code === "email_not_verified") {
      setShowResendActivationLink({ showResendButton: true })
      return setState({
        type: "error",
        code: "email_not_verified",
        statusText:
          data.statusText || ["Please verify your email before logging in."],
      });
    }
    // Generic backend error
    if (data.code === "debugging" || data.code === "error") {
      return setState(data);
    }
    // Fallback error
    return setState({
      type: data.code || res.status || "error",
      code: data.code || res.status || "error",
      statusText:
        data.statusText || [res.statusText] || ["An error occurred. Please try again."],
    });
  } catch (error) {
    if (typeof setButton === "function") {
      setButton({ is_submitting_data: false });
    }

    return setState({
      type: "error",
      statusText: [String(error)],
    });
  }
};

