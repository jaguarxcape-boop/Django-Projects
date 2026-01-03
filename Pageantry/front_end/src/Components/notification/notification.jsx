// components/Notification.jsx
import React from "react";
import "./notification.css"; // import the CSS file

export default function Notification({
  title = "Something went wrong",
  message,
  errors = [],
  onClose,
  position = "top-right", // top-right, top-left, bottom-right, bottom-left
}) {
  if (!message && errors.length === 0) return null;

  return (
    <div className={`error-alert ${position}`}>
      <div className="error-content">
        <div className="error-icon">⚠️</div>

        <div className="error-text">
          <h3>{title}</h3>
          {message && <p>{message}</p>}
          {errors.length > 0 && (
            <ul>
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
        </div>

        {onClose && (
          <button className="error-close" onClick={onClose}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
