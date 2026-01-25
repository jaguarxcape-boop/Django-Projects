import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  Grid,
  Button,
  Card,
  CardMedia,
  CardContent,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

export default function WIZARDSTEPTHREE({ eventData, onBack, onReset, formMessage, setFormMessage }) {
  const { categories, name, description, banner, startTime, endTime, amountPerVote } = eventData;

  // Helper to safely get the banner source (string or object from previous steps)
  const bannerSrc = banner && (typeof banner === "string" ? banner : banner.previewUrl);
  
  const handleCloseError = () => {
    if (setFormMessage) {
      setFormMessage({ type: "", statusText: [] });
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={4} pb={4}>
      
      {/* EVENT HEADER CARD */}
      <Paper elevation={3} sx={{ overflow: "hidden", borderRadius: 3 }}>
        {/* Banner Image Area */}
        <Box
          sx={{
            height: 300,
            bgcolor: "grey.200",
            backgroundImage: bannerSrc ? `url(${bannerSrc})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {!bannerSrc && (
            <Typography variant="h6" color="text.secondary">
              No Banner Uploaded
            </Typography>
          )}
        </Box>

        {/* Event Info */}
        <Box p={4}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={8}>
              <Typography variant="h6" fontWeight="800" gutterBottom>
                {name || "Untitled Event"}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.1rem", lineHeight: 1.6 }}>
                {description || "No description provided for this event."}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} display="flex" justifyContent="flex-end">
               <Chip 
                  label={`Price per Vote: ₵${amountPerVote || "0.00"}`} 
                  color="primary" 
                  sx={{ fontSize: "1.2rem", py: 3, px: 2, borderRadius: 2, fontWeight: "bold" }} 
               />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <Box display="flex" flexDirection="column">
                <Typography variant="overline" color="text.secondary" fontWeight="bold" letterSpacing={1}>
                  Starts
                </Typography>
                <Typography variant="h6">
                  {startTime ? new Date(startTime).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' }) : "Not scheduled"}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box display="flex" flexDirection="column">
                <Typography variant="overline" color="text.secondary" fontWeight="bold" letterSpacing={1}>
                  Ends
                </Typography>
                <Typography variant="h6">
                  {endTime ? new Date(endTime).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' }) : "Not scheduled"}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* CATEGORIES SECTION */}
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3, px: 1 }}>
          Categories & Contestants
        </Typography>

        {(!categories || categories.length === 0) && (
           <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2, bgcolor: "grey.50" }}>
             <Typography color="text.secondary">No categories have been added yet.</Typography>
           </Paper>
        )}

        {categories?.map((cat) => (
          <Paper key={cat.id} elevation={1} sx={{ p: 3, mb: 4, borderRadius: 3, border: "1px solid #e0e0e0" }}>
            <Box display="flex" alignItems="center" gap={2} mb={3} pb={2} borderBottom="1px solid #f0f0f0">
              <Avatar sx={{ bgcolor: "secondary.main", width: 48, height: 48, fontSize: "1.2rem" }}>
                {cat.name ? cat.name.charAt(0).toUpperCase() : "?"}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {cat.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {cat.contestants?.length || 0} Contestants
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={3}>
              {cat.contestants?.map((c) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={c.id}>
                  <Card 
                    elevation={2} 
                    sx={{ 
                      height: "100%", 
                      display: "flex", 
                      flexDirection: "column", 
                      borderRadius: 3,
                      transition: "transform 0.2s",
                      "&:hover": { transform: "translateY(-4px)", boxShadow: 6 }
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="220"
                      image={c.image && typeof c.image === "string" ? c.image : ""}
                      alt={c.name}
                      sx={{ bgcolor: "grey.100", objectFit: "cover" }}
                    />
                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Typography variant="h6" fontWeight="bold" noWrap title={c.name}>
                        {c.name || "Unnamed"}
                      </Typography>
                      
                      {c.hobby && (
                        <Chip 
                          label={c.hobby} 
                          size="small" 
                          variant="outlined" 
                          sx={{ mt: 1, mb: 2, borderColor: "grey.300" }} 
                        />
                      )}

                      <Typography variant="body2" color="text.secondary" sx={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.5
                      }}>
                        {c.bio || "No biography provided."}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {(!cat.contestants || cat.contestants.length === 0) && (
                <Grid item xs={12}>
                  <Box p={3} textAlign="center" bgcolor="grey.50" borderRadius={2}>
                    <Typography variant="body2" color="text.secondary">No contestants in this category.</Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        ))}
      </Box>

      {/* ERROR POPUP */}
      <Dialog
        open={formMessage?.type === 'error'}
        onClose={handleCloseError}
        aria-labelledby="error-dialog-title"
      >
        <DialogTitle id="error-dialog-title" color="error">
          Submission Failed
        </DialogTitle>
        <DialogContent>
          <DialogContentText gutterBottom>
            Please correct the following errors before proceeding:
          </DialogContentText>
          <List dense>
            {formMessage?.statusText?.map((text, index) => (
              <ListItem key={index} disablePadding>
                <ListItemText primary={`• ${text}`} primaryTypographyProps={{ color: 'error', variant: 'body2' }} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseError} color="white" >Close</Button>
        </DialogActions>
      </Dialog>

      {/* NAVIGATION */}
      <Box display="flex" justifyContent="space-between">
        <Button variant="outlined" color="inherit" onClick={onBack} size="large" sx={{ borderRadius: 2 }}>
            Back to Edit
        </Button>
        <Button color="error" onClick={onReset} size="large">
            Reset All Data
        </Button>
      </Box>
    </Box>
  );
}
