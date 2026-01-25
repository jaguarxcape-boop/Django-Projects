import { useState } from "react";
import { Box, Paper, Typography, TextField, Button, Badge, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { Categories } from "./components";

// Simple unique ID generator
const generateId = (prefix) => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

export default function WizardStepTwo({ eventData = {}, setEventData, onNext, onBack }) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryIndex, setEditingCategoryIndex] = useState(null);
  const [editingCategoryValue, setEditingCategoryValue] = useState("");
  const [newContestantName, setNewContestantName] = useState("");
  const [editingContestant, setEditingContestant] = useState({
    catIndex: null,
    contIndex: null,
    name: "",
    bio: "",
    hobby: "",
    image: null,
    previewUrl: null,
  });
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    type: null, // "category" or "contestant"
    catIndex: null,
    contIndex: null,
  });

  // Safe defaults
  const categories = eventData.categories || [];

  // ---------------- Category Functions ----------------
  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;

    const newCategory = {
      id: generateId("cat"),
      name,
      contestants: [],
    };

    setEventData((prev) => ({
      ...prev,
      categories: [...(prev.categories || []), newCategory]
      // categories{...prev.eventData, categories:[...(prev.categories || []), newCategory]}

    }));

    setNewCategoryName("");
  };

  const handleDeleteCategory = (index) => {
    setDeleteConfirm({ open: true, type: "category", catIndex: index });
  };

  const handleEditCategory = (index) => {
    setEditingCategoryIndex(index);
    setEditingCategoryValue(categories[index]?.name || "");
  };

  const handleSaveCategoryEdit = (index) => {
    const name = editingCategoryValue.trim();
    if (!name) return;

    setEventData((prev) => ({
      ...prev,
      categories: (prev.categories || []).map((cat, i) =>
        i === index ? { ...cat, name } : cat
      ),
    }));

    setEditingCategoryIndex(null);
    setEditingCategoryValue("");
  };

  // ---------------- Contestant Functions ----------------
  const handleAddContestant = (catIndex) => {
    const name = newContestantName.trim();
    if (!name) return;

    const newContestant = {
      id: generateId("cont"),
      name,
      bio: "",
      hobby: "",
      image: null,
      previewUrl: null,
    };

    setEventData((prev) => ({
      ...prev,
      categories: (prev.categories || []).map((cat, i) =>
        i === catIndex
          ? { ...cat, contestants: [...(cat.contestants || []), newContestant] }
          : cat
      ),
    }));

    setNewContestantName("");
  };


  const handleDeleteContestant = (catIndex, contIndex) => {
    setDeleteConfirm({ open: true, type: "contestant", catIndex, contIndex });
  };

  const handleStartEditingContestant = (catIndex, contIndex) => {
    const cont = (categories[catIndex]?.contestants || [])[contIndex];
    if (!cont) return;

    setEditingContestant({
      catIndex,
      contIndex,
      name: cont.name || "",
      bio: cont.bio || "",
      hobby: cont.hobby || "",
      image: cont.image || null,
      previewUrl: cont.previewUrl || (typeof cont.image === "string" ? cont.image : null),
    });
  };

  const handleSaveContestantEdit = () => {
    const { catIndex, contIndex, name, bio, hobby, image, previewUrl } = editingContestant;
    if (catIndex === null || contIndex === null || !name.trim()) return;

    setEventData((prev) => ({
      ...prev,
      categories: (prev.categories || []).map((cat, i) =>
        i === catIndex
          ? {
            ...cat,
            contestants: (cat.contestants || []).map((cont, j) =>
              j === contIndex ? { ...cont, name, bio, hobby, image, previewUrl } : cont
            ),
          }
          : cat
      ),
    }));

    setEditingContestant({ catIndex: null, contIndex: null, name: "", bio: "", hobby: "", image: null, previewUrl: null });
  };

  const handleContestantImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setEditingContestant((prev) => ({
        ...prev,
        image: event.target.result,
        previewUrl: event.target.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.type === "category") {
      const index = deleteConfirm.catIndex;
      setEventData((prev) => ({
        ...prev,
        categories: (prev.categories || []).filter((_, i) => i !== index),
      }));
      if (editingCategoryIndex === index) {
        setEditingCategoryIndex(null);
        setEditingCategoryValue("");
      }
    } else if (deleteConfirm.type === "contestant") {
      const { catIndex, contIndex } = deleteConfirm;
      setEventData((prev) => ({
        ...prev,
        categories: (prev.categories || []).map((cat, i) =>
          i === catIndex
            ? { ...cat, contestants: (cat.contestants || []).filter((_, j) => j !== contIndex) }
            : cat
        ),
      }));
    }
    setDeleteConfirm({ open: false, type: null, catIndex: null, contIndex: null });
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 1000, mx: "auto" }}>
      <Typography variant="h6" mb={3}>
        Categories
      </Typography>

      {/* Add Category */}
      <Box mb={3} display="flex" gap={1}>
        <TextField
          fullWidth
          label="Add New Category"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
        />
        <Button variant="contained" onClick={handleAddCategory}>
          Add
        </Button>
      </Box>

      {/* List Categories */}

      <Categories categories={categories} editingCategoryIndex={editingCategoryIndex} handleEditCategory={handleEditCategory} setEditingCategoryValue={setEditingCategoryValue} handleDeleteCategory={handleDeleteCategory} handleSaveCategoryEdit={handleSaveCategoryEdit} setEditingCategoryIndex={setEditingCategoryIndex} editingCategoryValue={editingCategoryValue}


        // contestant props



        editingContestant={editingContestant}
        setEditingContestant={setEditingContestant}
        newContestantName={newContestantName}
        setNewContestantName={setNewContestantName}


        handleContestantImageChange={handleContestantImageChange}
        handleAddContestant={handleAddContestant}
        handleSaveContestantEdit={handleSaveContestantEdit}
        handleStartEditingContestant={handleStartEditingContestant}
        handleDeleteContestant={handleDeleteContestant}


      />

      {/* Wizard Controls */}
      <Box display="flex" justifyContent="flex-end">
        <Button variant="contained" onClick={onBack}>Go Back</Button>
        <Button variant="contained" onClick={onNext} sx={{ ml: 2 }}>Proceed To Review →</Button>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, open: false })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this {deleteConfirm.type}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ ...deleteConfirm, open: false })}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
