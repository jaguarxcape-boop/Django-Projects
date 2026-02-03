export const ManageCategories = ({ setItemToDelete, contestants, setShowDeleteModal, eventId, categories, categoryName, setCategoryName, handleAddCategory, setEditingCategoryId, setnotification, editingCategoryId, setCategories, handleEditCategory }) => {

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