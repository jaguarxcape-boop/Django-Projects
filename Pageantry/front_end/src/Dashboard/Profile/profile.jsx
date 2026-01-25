import React, { useEffect, useState } from "react";
// import "./profile.css";
import { FETCHDASHBOARDPROFILEAPI } from "../dashboardurls";

export default function OrganizerProfile({ setnotification }) {


  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
  });
  useEffect(() => {
    // FETCHDASHBOARDPROFILEAPI(setFormData)
  }, [])
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // simulate API call
    setnotification({
      title: "Profile Updated",
      message: "Your changes have been saved successfully!",
      notifications: [],
    });
  };

  return (
    <div className="profile-container">
      <h1 className="profile-title">Organizer Profile</h1>
      <form className="profile-form" onSubmit={handleSubmit}>
        {["username", "email", "phone", "address"].map((field, idx) => (
          <div className="input-group" key={idx}>
            <input
              type={field === "email" ? "email" : "text"}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              required
            />
            <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
           
          </div>
        ))}
        <div className="input-group">
          <input
            type="checkbox"
            name="is_phone_verified"
            value={formData.is_phone_verified}
            defaultChecked={formData.is_phone_verified}
            onClick={(e)=>e.preventDefault()}
          />
          <label>Phone Verified</label>
          {/* <span className="highlight"></span> */}
        </div>
        <button type="submit" className="submit-btn">
          Update Profile
          <span className="btn-effect"></span>
        </button>
      </form>
    </div>
  );
}
