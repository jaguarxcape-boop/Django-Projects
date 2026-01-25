
import { Box, Paper, Typography, TextField, Button } from "@mui/material";

export const Categories = ({ categories, editingCategoryIndex, handleEditCategory, setEditingCategoryValue, handleDeleteCategory, handleSaveCategoryEdit, setEditingCategoryIndex, editingCategoryValue,

    handleContestantImageChange,
    handleAddContestant,
    handleSaveContestantEdit,
    handleStartEditingContestant,
    handleDeleteContestant,
    editingContestant,
    setEditingContestant,
    newContestantName,
    setNewContestantName,
}) => {

    return <>
        <Box mb={3}>
            {(categories || []).map((category, catIndex) => (
                <Paper key={category.id} sx={{
                    p: 2, mb: 2, border: "1px solid #ccc", backgroundColor: " rgba(255,215,0,.4)"

                }}>

                    <Paper style={{ width: "max-content", padding: "10px", float: "right" }}>
                        {`${catIndex + 1} of ${categories.length} categories`}
                    </Paper>
                    {/* Category Name */}
                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                        {editingCategoryIndex === catIndex ? (
                            <>
                                <TextField
                                    size="small"
                                    value={editingCategoryValue}
                                    onChange={(e) => setEditingCategoryValue(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSaveCategoryEdit(catIndex)}
                                    autoFocus
                                />
                                <Button variant="contained" onClick={() => handleSaveCategoryEdit(catIndex)}>Save</Button>
                                <Button variant="outlined" onClick={() => { setEditingCategoryIndex(null); setEditingCategoryValue(""); }}>Cancel</Button>
                            </>
                        ) : (
                            <>
                                <Typography
                                    title="Click To Edit"
                                    sx={{ cursor: "pointer", fontWeight: "bold", fontSize: "30px", color: "white", background: "black", padding: "10px", borderRadius: "10px" }}
                                    onClick={() => handleEditCategory(catIndex)}
                                >
                                    {category.name}
                                </Typography>
                                <Button onClick={() => handleDeleteCategory(catIndex)}
                                    style={{ color: "white", backgroundColor: "tomato" }}
                                >Delete</Button>
                            </>
                        )}
                    </Box>

                    {/* Contestants */}
                    <Contestants
                        category={category}
                        editingContestant={editingContestant}
                        catIndex={catIndex}
                        setEditingContestant={setEditingContestant}
                        newContestantName={newContestantName}
                        setNewContestantName={setNewContestantName}



                        // non-state functions
                        handleContestantImageChange={handleContestantImageChange}
                        handleAddContestant={handleAddContestant}
                        handleSaveContestantEdit={handleSaveContestantEdit}
                        handleStartEditingContestant={handleStartEditingContestant}
                        handleDeleteContestant={handleDeleteContestant}

                    />
                </Paper>
            ))}
        </Box>
    </>
}







const Contestants = ({
    category,
    editingContestant,
    catIndex,
    setEditingContestant,
    newContestantName,
    setNewContestantName,



    // non-state functions
    handleContestantImageChange,
    handleAddContestant,
    handleSaveContestantEdit,
    handleStartEditingContestant,
    handleDeleteContestant

}) => {


    return <>
        <Box ml={3}>
            <Typography variant="subtitle2" fontSize={"20px"}>Contestants:</Typography>

            {/* Existing contestants */}
            {(category.contestants || []).map((cont, contIndex) => {
                const isEditing = editingContestant.catIndex === catIndex && editingContestant.contIndex === contIndex;

                return (
                    <Box key={cont.id} display="flex"
                        backgroundColor="white"
                        flexDirection="column" gap={1} p={1} sx={{ border: "1px solid #eee", borderRadius: 1 }}>
                        {isEditing ? (
                            <>
                                <TextField
                                    size="small"
                                    label="Name"
                                    value={editingContestant.name}
                                    onChange={(e) => setEditingContestant((prev) => ({ ...prev, name: e.target.value }))}
                                />
                                <TextField
                                    size="small"
                                    label="Bio"
                                    multiline
                                    minRows={2}
                                    value={editingContestant.bio}
                                    onChange={(e) => setEditingContestant((prev) => ({ ...prev, bio: e.target.value }))}
                                />
                                <TextField
                                    size="small"
                                    label="Hobby"
                                    value={editingContestant.hobby}
                                    onChange={(e) => setEditingContestant((prev) => ({ ...prev, hobby: e.target.value }))}
                                />
                                <Box>
                                    <Button variant="outlined" color="white">

                                        <label htmlFor={`contestant-img-${cont.id}`} >
                                            Upload Image
                                            <input type="file" accept="image/*" hidden id={`contestant-img-${cont.id}`} onChange={handleContestantImageChange} />

                                        </label>
                                    </Button>
                                    {editingContestant.previewUrl && (
                                        <img src={editingContestant.previewUrl} alt="Preview" style={{ maxHeight: 100, display: "block", marginTop: 4 }} />
                                    )}
                                </Box>
                                <Box display="flex" gap={1}>
                                    <Button variant="contained" onClick={handleSaveContestantEdit}>Save</Button>
                                    <Button variant="contained" color="white" onClick={() => setEditingContestant({ catIndex: null, contIndex: null, name: "", bio: "", hobby: "", image: null, previewUrl: null })}>Cancel</Button>
                                </Box>
                            </>
                        ) : (<>


                            <Box title="Click To Edit" display="flex" alignItems="center" gap={2}>
                                {cont.image && (
                                    <img
                                        src={typeof cont.image === "string" ? cont.image : (cont.image instanceof Blob ? URL.createObjectURL(cont.image) : "")}
                                        alt="Contestant"
                                        style={{ width: 50, height: 50, objectFit: "cover", borderRadius: "50%" }}
                                    />
                                )}
                                <Typography sx={{ cursor: "pointer" }} onClick={() => handleStartEditingContestant(catIndex, contIndex)}>
                                    {cont.name}
                                </Typography>

                                <Box title="Click To Edit" display="flex" alignItems="center" gap={2}>

                                    <Button style={{ float: "right", color: "white" }} variant="outlined" onClick={() => handleStartEditingContestant(catIndex, contIndex)}>Edit</Button>
                                </Box>
                                <Button title="Click To Delete" style={{ float: "right", color: "white" }} variant="outlined" onClick={() => handleDeleteContestant(catIndex, contIndex)}>Delete</Button>
                            </Box>
                        </>
                        )}
                    </Box>

                );
            })}

            {/* Add new contestant */}
            <Box display="flex" gap={1} mt={1}>
                <TextField
                    size="small"
                    fullWidth
                    placeholder="Add Contestant"
                    value={newContestantName}
                    onChange={(e) => setNewContestantName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddContestant(catIndex)}
                />
                <Button variant="contained" onClick={() => handleAddContestant(catIndex)}>Add</Button>
            </Box>
        </Box>
    </>
}
