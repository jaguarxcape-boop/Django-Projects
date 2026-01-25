import { useState } from "react";
import Form from "../Components/forms/form";
import { styles } from "./password_reset_end";
import { useSearchParams } from "react-router";

export default function PasswordResetDone() {
  const [errors, setErrors] = useState({});
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token");
const is_validated = (e) => {
  const password = e.target.password.value;
  const confirmPassword = e.target.confirm_password.value;

  const newErrors = {};

  // Password validation
  if (!password) {
    newErrors.password = "Password is required";
  } else if (password.length < 8) {
    newErrors.password = "Password must be at least 8 characters";
  } else if (!/[A-Z]/.test(password)) {
    newErrors.password = "Password must contain at least one uppercase letter";
  } else if (!/[a-z]/.test(password)) {
    newErrors.password = "Password must contain at least one lowercase letter";
  } else if (!/[0-9]/.test(password)) {
    newErrors.password = "Password must contain at least one number";
  }

  // Confirm password validation
  if (!confirmPassword) {
    newErrors.confirm_password = "Please confirm your password";
  } else if (password !== confirmPassword) {
    newErrors.confirm_password = "Passwords do not match";
  }

  // Set errors for frontend display
  setErrors(newErrors);

  // Return true if no errors, false otherwise
  return Object.keys(newErrors).length === 0;
};


  return (
    <Form
      style={styles.card}
      name="password_reset_done"
      is_validated={is_validated}
    >
      <h2 style={styles.title}>Reset Password</h2>
      <input type="hidden" name='token' defaultValue={token} />
      <p style={styles.subtitle}>Choose a strong new password</p>

      <div style={styles.field}>
        <label style={styles.label}>New Password</label>
        <input
          type="password"
          name="password"
          style={styles.input}

          defaultValue={"aadfFAFA1234"}
          placeholder="Enter new password"
        />
        {errors.password && (
          <p style={styles.error}>{errors.password}</p>
        )}
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Confirm Password</label>
        <input
          type="password"
          name="confirm_password"
          style={styles.input}
          defaultValue={"aadfFAFA1234"}

          placeholder="Confirm new password"
        />
        {errors.confirm_password && (
          <p style={styles.error}>{errors.confirm_password}</p>
        )}
      </div>

      <button type="submit" style={styles.button}>
        Reset Password
      </button>
    </Form>
  );
}
