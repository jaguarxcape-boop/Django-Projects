import { useState } from "react";
import { Box, Paper, Typography, TextField, Button, Grid, InputAdornment } from "@mui/material";
import EventIcon from '@mui/icons-material/Event';
import DescriptionIcon from '@mui/icons-material/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default function WizardStepOne({ eventData, setEventData, onNext }) {
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setEventData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateAndProceed = () => {
    const newErrors = {};
    const now = new Date();
    const start = eventData.startTime ? new Date(eventData.startTime) : null;
    const end = eventData.endTime ? new Date(eventData.endTime) : null;

    if (!eventData.startTime) {
      newErrors.startTime = "Start time is required.";
    } else if (start < now) {
      newErrors.startTime = "Start time cannot be in the past.";
    }

    if (!eventData.endTime) {
      newErrors.endTime = "End time is required.";
    } else if (start && end && end <= start) {
      newErrors.endTime = "End time must be after start time.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      onNext();
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Box mb={4}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Event Details
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Provide the basic information about your pageantry event.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Event Name"
            placeholder="e.g. Miss Campus Queen 2026"
            value={eventData?.name}
            onChange={(e) => updateField("name", e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EventIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            multiline
            minRows={4}
            label="Event Description"
            placeholder="Describe what this event is about..."
            value={eventData?.description}
            onChange={(e) => updateField("description", e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ mt: 1.5, alignSelf: 'flex-start' }}>
                  <DescriptionIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" mb={1} fontWeight="bold">
            Event Banner
          </Typography>

          <Paper
            variant="outlined"
            sx={{
              p: 4,
              textAlign: "center",
              borderStyle: "dashed",
              borderWidth: 2,
              borderColor: eventData?.banner ? "primary.main" : "grey.400",
              bgcolor: eventData?.banner ? "primary.50" : "grey.50",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "primary.50",
              }
            }}
          >
            <input
              type="file"
              accept="image/*"
              hidden
              id="event-banner-input"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;

                if (file) {
                  const reader = new FileReader();
                  
                  reader.onload = (event) => {
                    const base64String = event.target.result;
                    
                    // Update state with the base64 string
                    setEventData((prev) => ({
                      ...prev,
                      banner: { 
                        file: { name: file.name, size: file.size, type: file.type }, // Store metadata
                        previewUrl: base64String // This is now a persistent Base64 string
                      },
                    }));
                  };

                  reader.readAsDataURL(file);
                } else {
                  setEventData((prev) => ({
                    ...prev,
                    banner: null,
                  }));
                }
              }}
            />

            <label htmlFor="event-banner-input" style={{ width: '100%', height: '100%', cursor: 'pointer', display: 'block' }}>
              {eventData?.banner?.previewUrl ? (
                <Box>
                  <img
                    src={eventData.banner.previewUrl}
                    alt="Event Banner"
                    style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 8, marginBottom: 16, objectFit: 'cover' }}
                  />
                  <Typography variant="body2" color="primary" fontWeight="medium">
                    {eventData.banner.file.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Click to change banner
                  </Typography>
                </Box>
              ) : (
                <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                  <Typography variant="body1" color="text.primary" fontWeight="medium">
                    Click to upload banner image
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    SVG, PNG, JPG or GIF (max. 800x400px)
                  </Typography>
                </Box>
              )}
            </label>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            type="datetime-local"
            label="Start Time"
            InputLabelProps={{ shrink: true }}
            value={eventData?.startTime}
            onChange={(e) => updateField("startTime", e.target.value)}
            error={!!errors.startTime}
            helperText={errors.startTime}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccessTimeIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            type="datetime-local"
            label="End Time"
            InputLabelProps={{ shrink: true }}
            value={eventData?.endTime}
            onChange={(e) => updateField("endTime", e.target.value)}
            error={!!errors.endTime}
            helperText={errors.endTime}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccessTimeIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            type="number"
            label="Amount Per Vote"
            placeholder="e.g. 1.00"
            value={eventData?.amountPerVote}
            onChange={(e) => updateField("amountPerVote", e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoneyIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="flex-end" mt={4}>
        <Button variant="contained" size="large" onClick={validateAndProceed} sx={{ px: 4, py: 1.5, borderRadius: 2 }}>
          Continue to Categories →
        </Button>
      </Box>
    </Paper>
  );
}