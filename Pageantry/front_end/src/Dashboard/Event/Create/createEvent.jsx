import { useEffect, useState } from "react";
import {
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Box,
  Button,
  Alert
} from "@mui/material";

import WIZARDSTEPONE from "./STEPONE/WIZARDSTEPONE";
import WIZARDSTEPTWO from "./STEPTWO/WIZARDSTEPTWO";
import WIZARDSTEPTHREE from "./WIZARDSTEPTHREE";
import { submitEventCreationForm } from "./functions";
import { useNavigate } from "react-router";

export const STORAGE_KEY = "event_wizard_data";

const EMPTY_EVENT = {
  name: "",
  description: "",
  banner: null,
  startTime: "",
  endTime: "",
  amountPerVote: "",
  categories: [],
};

export default function CreateEventWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate()
  const [eventData, setEventData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : EMPTY_EVENT;
  });
  const [formMessage, setFormMessage] = useState({ type: "", statusText: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);


  /* ---------------- Navigation ---------------- */
  const nextStep = () => {
    setCurrentStep((s) => s + 1);
    saveData();
  };

  const prevStep = () => {
    setCurrentStep((s) => s - 1);
    saveData();
  };

  const saveData = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(eventData));

  };

  const resetWizard = () => {
    if (window.confirm("Are you sure you want to clear all data and start over?")) {
      setEventData(EMPTY_EVENT);
      setCurrentStep(0);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(eventData));

  }, [eventData])

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setFormMessage({ type: "", statusText: [] });

    const formData = new FormData();
    formData.append("name", eventData.name);
    formData.append("description", eventData.description);
    formData.append("start_time", eventData.startTime);
    formData.append("end_time", eventData.endTime);
    formData.append("amount_per_vote", eventData.amountPerVote);

    // Clone categories to modify for submission without affecting state
    const categoriesPayload = JSON.parse(JSON.stringify(eventData.categories));

    // Process contestant images
    for (let i = 0; i < categoriesPayload.length; i++) {
      const category = categoriesPayload[i];
      if (category.contestants) {
        for (let j = 0; j < category.contestants.length; j++) {
          const contestant = category.contestants[j];
          
          // Check if image exists and is a base64 string (from preview)
          const imageSrc = contestant.image && (typeof contestant.image === 'object' ? contestant.image.previewUrl : contestant.image);

          if (imageSrc && typeof imageSrc === 'string' && imageSrc.startsWith('data:')) {
            try {
              const res = await fetch(imageSrc);
              const blob = await res.blob();
              const filename = (typeof contestant.image === 'object' && contestant.image.file) ? contestant.image.file.name : `contestant_${i}_${j}.jpg`;

              formData.append(`categories[${i}][contestants][${j}][image]`, blob, filename);
              contestant.image = null; // Remove base64 from JSON
            } catch (err) {
              console.error("Error processing contestant image:", err);
            }
          }
        }
      }
    }

    formData.append("categories", JSON.stringify(categoriesPayload));

    try {
      if (eventData.banner?.previewUrl) {
        const res = await fetch(eventData.banner.previewUrl);
        const blob = await res.blob();
        formData.append("banner", blob, eventData.banner.file.name);
      }

      await submitEventCreationForm({ formData, setFormMessage,navigate });
    } catch (error) {
      setFormMessage({ type: "error", statusText: ["An unexpected error occurred. Please try again."] });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 1200, display: "flex", flexDirection: "column" }}>
      <Box position={"sticky"} zIndex={1000} bgcolor={'white'} left={0} top={0} padding={'10px'} right={0} sx={{ flexShrink: 1 }}>
      <Typography variant="h5" mb={3}>
        Create Pageantry Event
      </Typography>

      <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
        {["Event Details", "Categories", "Review"].map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: "auto", px: 1 }}>
        {currentStep === 0 && (
          <WIZARDSTEPONE
            eventData={eventData}
            setEventData={setEventData}
            onNext={nextStep} />
        )}

        {currentStep === 1 && (
          <WIZARDSTEPTWO
            eventData={eventData}
            setEventData={setEventData}
            onNext={nextStep}
            onBack={prevStep} />

        )}

        {formMessage.statusText.length > 0 && !(currentStep === 2 && formMessage.type === 'error') && (
          <Box mb={2}>
            {formMessage.statusText.map((text, index) => (
              <Alert key={index} severity={formMessage.type} sx={{ mb: 1 }}>{text}</Alert>
            ))}
          </Box>
        )}

        {currentStep === 2 && (
          <WIZARDSTEPTHREE
            eventData={eventData}
            onBack={prevStep}
            onReset={resetWizard}
            formMessage={formMessage}
            setFormMessage={setFormMessage} />
        )}

        {currentStep === 2 && (
          <Box textAlign="right" mt={3}>
            <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Event"}
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
}