import { useState } from "react";
import { submit_event_creation_form } from ".";
import { Message } from "../../../Components/forms/form";
// import "./create_event.css";

export default function CreateEvent() {
  const [formData, setFormData] = useState({

  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const [form_message, setform_message] = useState({ type: "", statusText: [] })

  const handleSubmit = (e) => {
    e.preventDefault();

    submit_event_creation_form({ formData, setform_message })
    // TODO: send payload to Django API
  };
  return (
    <div className="event-wrapper">
      <div className="event-card">
        <h2>Create Pageantry Event</h2>
        {/* {form_message.type && */}
          {/* <Message type={form_message.type} statusText= */}
          {/* {["hello"]} */}
          {/* // {form_message.statusText} */}
          
          {/* /> */}
          {/* }   */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Event Name</label>
            <input required
              type="text"
              name="name"
              placeholder="Event Name"
              value={formData.name}
              onChange={handleChange}

            />
          </div>
           <div className="form-group">
            <label>Event Description</label>
            <input required
              type="text"
              name="bio"
              placeholder="Describe the event"
              value={formData.bio}
              onChange={handleChange}
             
            />
          </div>

          <div className="form-group">
            <label>Event Image</label>
            <input required
              type="file"
              name="banner"
              accept="image/*"
              onChange={handleChange}
            />
            <label>This image will be used to customize your event on the site.</label>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date & Time</label>
              <input required
                type="datetime-local"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}

              />
            </div>

            <div className="form-group">
              <label>End Date & Time</label>
              <input required
                type="datetime-local"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}

              />
            </div>
          </div>

          <div className="form-group">
            <label>Amount Per Vote</label>
            <input required
              type="number"
              step="0.01"
              name="amount_per_vote"
              placeholder="e.g. 5.00"
              value={formData.amount_per_vote}
              onChange={handleChange}

            />
          </div>

          <button type="submit" className="primary-btn">
            Create Event
          </button>
        </form>
      </div>
    </div>
  );
}
