export const ManageContestants = ({ categories, categoryName, setCategoryName, editingCategoryId, setEditingCategoryId, setnotification, handleEditCategory, handleAddCategory, setShowDeleteModal, setCategories, eventId, contestants, setItemToDelete }) => {

    return <>

        <section className="card">
            <div className="card-header">
                <h3>Categories</h3>
                <span className="badge">{categories.length}</span>
            </div>
            <div className="row">
                <input
                    type="text"
                    placeholder="Category name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="input-field"
                />
                <button
                    className="btn add-btn"

                    onClick={() => handleAddCategory({ categoryName, setnotification, editingCategoryId, setCategories, setCategoryName, setEditingCategoryId, categories, eventId })}
                >
                    {editingCategoryId ? "Update" : "Add"}
                </button>
                {editingCategoryId && (
                    <button
                        className="btn cancel-btn"
                        onClick={() => {
                            setCategoryName("");
                            setEditingCategoryId(null);
                        }}
                    >
                        Cancel
                    </button>
                )}
            </div>

            <div className="categories-grid">
                {categories.map((cat) => {
                    const catContestants = contestants.filter(c => c.category_id === cat.id);
                    return (
                        <div key={cat.id} className="category-card">
                            <div className="category-header">
                                <h4>{cat.name}</h4>
                                <span className="contestant-count">{catContestants.length}</span>
                            </div>
                            <div className="category-actions">
                                <button
                                    className="btn rename-btn"
                                    onClick={() => handleEditCategory(cat)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn delete-btn"
                                    onClick={() => {
                                        setItemToDelete({ type: "category", id: cat.id });
                                        setShowDeleteModal(true);
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            {categories.length === 0 && <p className="empty-message">No categories yet</p>}
        </section>
    </>
}

export const EditContestants = ({ closeEditContestantModal, photoPreview, handlePhotoUpload, contestant, setContestant, categories, handleAddContestant }) => {
    return <>
        <div className="modal-overlay" onClick={closeEditContestantModal}>
            <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Edit Contestant</h3>
                    <button className="close-btn" onClick={closeEditContestantModal}>×</button>
                </div>

                <div className="modal-body">
                    {/* Photo Preview and Upload */}
                    <div className="photo-upload-section">
                        <div className="photo-preview">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Preview" />
                            ) : (
                                <div className="photo-placeholder">📸</div>
                            )}
                        </div>
                        <div className="photo-upload-controls">
                            <label htmlFor="photo-input" className="upload-label">
                                Upload Photo
                            </label>
                            <input
                                id="photo-input"
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="file-input"
                            />
                            <p className="upload-hint">JPG, PNG or GIF (Max 5MB)</p>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="form-group">
                        <label>Contestant Name *</label>
                        <input
                            type="text"
                            placeholder="Enter contestant name"
                            value={contestant.name}
                            onChange={(e) => setContestant({ ...contestant, name: e.target.value })}
                            className="input-field"
                        />
                    </div>

                    <div className="form-group">
                        <label>Category *</label>
                        <select
                            value={contestant.category_id}
                            onChange={(e) => setContestant({ ...contestant, category_id: e.target.value })}
                            className="input-field"
                        >
                            <option value="">Select category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Bio</label>
                        <textarea
                            placeholder="Enter contestant bio"
                            value={contestant.bio}
                            onChange={(e) => setContestant({ ...contestant, bio: e.target.value })}
                            className="input-field textarea-field"
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label>Hobby/Interest</label>
                        <input
                            type="text"
                            placeholder="Enter hobby or interest"
                            value={contestant.hobby}
                            onChange={(e) => setContestant({ ...contestant, hobby: e.target.value })}
                            className="input-field"
                        />
                    </div>
                </div>

                <div className="modal-actions">
                    <button
                        className="btn cancel-btn"
                        onClick={closeEditContestantModal}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn add-btn"
                        onClick={handleAddContestant}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    </>
}