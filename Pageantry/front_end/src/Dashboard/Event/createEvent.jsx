import { useState } from "react";
import { Message } from "../../../Components/forms/form";
import {
  Stepper,
  Step,
  StepLabel,
  Typography,
  Paper,
  Collapse,
    Box,
    Button,
    TextField,
} from "@mui/material";

import WIZARDSTEPTWO from "./WIZARDSTEPTWO";
import WIZARDSTEPTHREE from "./WIZARDSTEPTHREE";
import { handleSubmit } from "./functions";
import WIZARDSTEPONE from "./WIZARDSTEPONE.JSX";



export default function CreateEventWizard() {
  const steps = ["Event Details", "Categories & Contestants", "Review & Submit"];
  const [currentStep, setCurrentStep] = useState(0);
  const [formMessage, setFormMessage] = useState({ type: "", text: [] });

  // --------------------------

  const [eventData, setEventData] = useState({
    eventDetails: {
      name: "",
      description: "",
      banner: null,
      startTime: "",
      endTime: "",
      amountPerVote: "",
    },
    categories: [], // {id, name, contestants: [{id, name, bio, hobby, image, votes}]}
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState(null); // for sidebar selection

  // --------------------------
  // Step navigation
  // --------------------------
  const goToNextStep = () => {
    if (!validateCurrentStep()) return;
    setCurrentStep((prev) => prev + 1);
  };
  const goToPreviousStep = () => setCurrentStep((prev) => prev - 1);

  const validateCurrentStep = () => {
    if (currentStep === 0) {
      const { name, description, banner, startTime, endTime, amountPerVote } = eventData.eventDetails;
      if (!name || !description || !banner || !startTime || !endTime || !amountPerVote) {
        setFormMessage({ type: "error", text: ["Please fill all required event details."] });
        return false;
      }
    }

    if (currentStep === 1 && eventData.categories.length === 0) {
      setFormMessage({ type: "error", text: ["Add at least one category before proceeding."] });
      return false;
    }

    setFormMessage({ type: "", text: [] });
    return true;
  };


  // --------------------------
  // Selected category data
  // --------------------------
  const selectedCategory = eventData.categories.find((c) => c.id === selectedCategoryId);


  const handleEventDetailChange = (e
    // { e, setEventData }
  ) => {
    const { name, value, files } = e.target;
    setEventData((prev) => ({
        ...prev,
        eventDetails: {
            ...prev.eventDetails,
            [name]: files ? files[0] : value,
        },
    }));
};
  return (
    <Paper sx={{ p: 4, maxWidth: 1000, mx: "auto",maxHeight:'80vh', height:'80vh', overflow:"hidden" }}>
      <Typography variant="h4" mb={2}>Create Pageantry Event</Typography>

      {formMessage.type && (
        <Collapse in={!!formMessage.type} sx={{ mb: 2 }}>
          <Message type={formMessage.type} statusText={formMessage.text} />
        </Collapse>
      )}

      <Stepper activeStep={currentStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      <form onSubmit={handleSubmit} >
        {/* ---------------- Step 0: Event Details ---------------- */}
        {currentStep === 0 && (
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              required
              label="Event Name"
              name="name"
              value={eventData.eventDetails.name}
              onChange={handleEventDetailChange}
            />
            <TextField
              required
              label="Event Description"
              name="description"
              value={eventData.eventDetails.description}
              onChange={(e) => handleEventDetailChange({ e, setEventData })}
            />
            <Box>
              <label>Banner Image:</label>
              <input
                type="file"
                name="banner"
                accept="image/*"
                onChange={(e) => handleEventDetailChange({ e, setEventData })}
              />
              {eventData.eventDetails.banner && (
                <img
                  src={URL.createObjectURL(eventData.eventDetails.banner)}
                  alt="Event Banner Preview"
                  style={{ width: "100%", marginTop: 10, borderRadius: 8 }}
                />
              )}
            </Box>
            <TextField
              required
              type="datetime-local"
              label="Start Time"
              name="startTime"
              value={eventData.eventDetails.startTime}
              onChange={(e) => handleEventDetailChange({ e, setEventData })}
            />
            <TextField
              required
              type="datetime-local"
              label="End Time"
              name="endTime"
              value={eventData.eventDetails.endTime}
              onChange={(e) => handleEventDetailChange({ e, setEventData })}
            />
            <TextField
              required
              type="number"
              label="Amount Per Vote"
              name="amountPerVote"
              value={eventData.eventDetails.amountPerVote}
              onChange={(e) => handleEventDetailChange({ e, setEventData })}
            />
            <Box mt={2}>
              <Button variant="contained" onClick={goToNextStep}>Next: Categories</Button>
            </Box>
          </Box>
          // <WIZARDSTEPONE setEventData={setEventData} eventData={eventData} goToNextStep={goToNextStep} />
        )}

        {/* ---------------- Step 1: Categories & Contestants ---------------- */}
        {currentStep === 1 && (
          <WIZARDSTEPTWO

            eventData={eventData} setEventData={setEventData} selectedCategoryId={selectedCategory} selectedCategory={selectedCategory} setSelectedCategoryId={setSelectedCategoryId} />
        )}

        {/* ---------------- Step 2: Review ---------------- */}
        {currentStep === 2 && (
          <WIZARDSTEPTHREE
            eventData={eventData}
            goToPreviousStep={goToPreviousStep}

          />
        )}
      </form>
    </Paper>
  );
}
