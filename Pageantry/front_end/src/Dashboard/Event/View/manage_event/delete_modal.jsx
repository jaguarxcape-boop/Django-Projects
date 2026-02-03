export const DeleteModal = ({ setShowDeleteModal, itemToDelete, handleDeleteEvent, handleDeleteCategory, handleDeleteContestant }) => {

    return <>
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Confirm Delete</h3>
                <p>
                    {itemToDelete?.type === "event"
                        ? "Are you sure you want to delete this event? This action cannot be undone."
                        : itemToDelete?.type === "category"
                            ? "Are you sure you want to delete this category? All contestants in this category will also be deleted."
                            : "Are you sure you want to delete this contestant?"}
                </p>
                <div className="modal-actions">
                    <button
                        className="btn cancel-btn"
                        onClick={() => setShowDeleteModal(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn delete-btn"
                        onClick={() => {
                            if (itemToDelete?.type === "event") {
                                handleDeleteEvent();
                            } else if (itemToDelete?.type === "category") {
                                handleDeleteCategory(itemToDelete.id);
                            } else if (itemToDelete?.type === "contestant") {
                                handleDeleteContestant(itemToDelete.id);
                            }
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    </>
}