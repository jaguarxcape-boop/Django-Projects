import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import './manage_event.css';
import {
  GetEventDetails,
  AddCategory,
  UpdateCategory,
  DeleteCategory,
  AddContestant,
  UpdateContestant,
  DeleteContestant,
  DeleteEvent,
  UpdateEvent
} from "./apiCalls";
import { handleAddCategory, handleAddContestant, handlePublishEvent, loadEventDetails } from "./functions";
import { DeleteModal } from "./delete_modal";
import { ManageCategories } from "./manage_categories";
import { EditContestants, ManageContestants } from "./manage_contestants";
import { FaClock, FaHome } from "react-icons/fa";
export default function EventManagement({ setnotification }) {
  const { id: eventId } = useParams();
  const navigate = useNavigate();

  // Event data
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [eventDetails, setEventDetails] = useState({
    name: "",
    bio: "",
    amount_per_vote: 0,
    start_time: "",
    end_time: ""
  });
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  // Categories state
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  // Contestants state
  const [contestants, setContestants] = useState([]);
  const [contestant, setContestant] = useState({ name: "", category_id: "", bio: "", hobby: "" });
  const [editingContestantId, setEditingContestantId] = useState(null);
  const [contestantPhoto, setContestantPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showEditContestantModal, setShowEditContestantModal] = useState(false);

  console.log("EventManagement mounted with eventId:", eventId);

  // Load event details on mount
  useEffect(() => {
    loadEventDetails({ setLoading, eventId, setEvent, setCategories, setContestants, setnotification })

    // if (eventId) {
    //   loadEventDetails();
    // }
  }, [eventId]);



  // Handle edit category
  const handleEditCategory = (category) => {
    setCategoryName(category.name);
    setEditingCategoryId(category.id);
  };

  // Handle delete category
  const handleDeleteCategory = async (categoryId) => {
    const success = await DeleteCategory({ eventId, categoryId, setnotification });
    if (success) {
      setCategories(categories.filter(cat => cat.id !== categoryId));
      // Remove contestants in this category
      setContestants(contestants.filter(c => c.category_id !== categoryId));
    }
    setShowDeleteModal(false);
    setItemToDelete(null);
  };



  // Handle edit contestant - opens modal
  const handleEditContestant = (c) => {
    setContestant({
      name: c.name,
      category_id: c.category_id,
      bio: c.bio || '',
      hobby: c.hobby || ''
    });
    setEditingContestantId(c.id);
    setPhotoPreview(c.photo || null);
    setContestantPhoto(null);
    setShowEditContestantModal(true);
  };

  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setContestantPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle edit event modal open
  const handleEditEventOpen = () => {
    if (event) {
      setEventDetails({
        name: event.name || "",
        bio: event.bio || "",
        amount_per_vote: event.amount_per_vote || 0,
        start_time: event.start_time || "",
        end_time: event.end_time || ""
      });
      setBannerPreview(event.banner || null);
      setBannerFile(null);
      setShowEditEventModal(true);
    }
  };

  // Handle banner upload
  const handleBannerUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle save event details
  const handleSaveEventDetails = async () => {
    if (!eventDetails.name.trim()) {
      setnotification?.({ message: "Event name is required", type: "warning" });
      return;
    }

    const formData = new FormData();
    formData.append('name', eventDetails.name);
    formData.append('bio', eventDetails.bio || '');
    formData.append('amount_per_vote', eventDetails.amount_per_vote);
    formData.append('start_time', eventDetails.start_time || '');
    formData.append('end_time', eventDetails.end_time || '');

    if (bannerFile) {
      formData.append('banner', bannerFile);
    }

    const updatedEvent = await UpdateEvent({
      eventId,
      eventData: formData,
      setnotification
    });

    if (updatedEvent) {
      setEvent(updatedEvent);
      setShowEditEventModal(false);
    }
  };

  // Handle close event edit modal
  const closeEventEditModal = () => {
    setShowEditEventModal(false);
    setBannerFile(null);
    setBannerPreview(null);
  };

  // Reset contestant form
  const resetContestantForm = () => {
    setContestant({ name: "", category_id: "", bio: "", hobby: "" });
    setEditingContestantId(null);
    setContestantPhoto(null);
    setPhotoPreview(null);
  };

  // Close edit modal
  const closeEditContestantModal = () => {
    setShowEditContestantModal(false);
    resetContestantForm();
  };

  // Handle delete contestant
  const handleDeleteContestant = async (contestantId) => {
    const success = await DeleteContestant({ eventId, contestantId, setnotification });
    if (success) {
      setContestants(contestants.filter(c => c.id !== contestantId));
    }
    setShowDeleteModal(false);
    setItemToDelete(null);
  };



  // Handle delete event
  const handleDeleteEvent = async () => {
    const success = await DeleteEvent({ eventId, setnotification });
    if (success) {
      navigate("/dashboard/events");
    }
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    return categories.find(cat => cat.id === categoryId)?.name || "Unknown";
  };

  if (loading) {
    return <div className="event-manager"><p>Loading event details...</p></div>;
  }

  if (!event) {
    return <div className="event-manager"><p>Event not found</p></div>;
  }

  return (
    <div className="event-manager">
      {/* Event Banner */}
      {event.banner && (
        <div className="event-banner">
          <img src={event.banner} alt={event.name} className="banner-image" />
        </div>
      )}

      <div className="event-header">
        <div>
          <h2>{event.name}</h2>

          {event.bio && <p className="event-bio">{event.bio}</p>}
          {event.start_time && <>


            <p>
              <span>
                

              </span>
              <span className="event-bio">

                <FaClock color="greenyellow"/> Scheduled to start on <b> {
                  new Date(event.start_time).toDateString()} at {new Date(event.start_time).toLocaleTimeString()}</b>    </span>
            </p> </>}

          {
            event.end_time && <span className="event-bio">
           <FaClock color="tomato"/>   Scheduled to end on <b> {
                new Date(event.end_time).toDateString()} at {new Date(event.start_time).toLocaleTimeString()}</b>    </span>
          }
          <div className="event-stats">
            <div className="stat-badge">
              <span className="stat-icon">📁</span>
              <span className="stat-text">{categories.length} Categories</span>
            </div>
            <div className="stat-badge">
              <span className="stat-icon">👥</span>
              <span className="stat-text">{contestants.length} Contestants</span>
            </div>
          </div>
        </div>
        <div className="event-actions">
          <button
            className="btn rename-btn"
            onClick={handleEditEventOpen}
            title="Edit event details"
          >
            Edit Event
          </button>
          <button
            className="btn publish-btn"

            onClick={() => handlePublishEvent({ categories, setnotification, eventId, navigate, contestants })}
            disabled={categories.length === 0 || contestants.length === 0}
          >
            Publish Event
          </button>
          <button
            className="btn delete-btn"
            onClick={() => {
              setItemToDelete({ type: "event" });
              setShowDeleteModal(true);
            }}
          >
            Delete Event
          </button>
        </div>
      </div>

      {/* Categories Section */}
      <ManageCategories setCategories={setCategories} setCategoryName={setCategoryName} setEditingCategoryId={setEditingCategoryId} setShowDeleteModal={setShowDeleteModal} setItemToDelete={setItemToDelete} setnotification={setnotification} handleAddCategory={handleAddCategory} handleEditCategory={handleEditCategory} eventId={eventId} contestants={contestants} categoryName={categoryName} editingCategoryId={setEditingCategoryId} categories={categories} />

      {/* Contestants Section */}

      <ManageContestants setCategories={setCategories} setCategoryName={setCategoryName} setEditingCategoryId={setEditingCategoryId} setShowDeleteModal={setShowDeleteModal} setItemToDelete={setItemToDelete} setnotification={setnotification} handleAddCategory={handleAddCategory} handleEditCategory={handleEditCategory} eventId={eventId} contestants={contestants} categoryName={categoryName} editingCategoryId={setEditingCategoryId} categories={categories} />

      {/* Edit Event Modal */}
      {showEditEventModal && (
        <div className="modal-overlay" onClick={closeEventEditModal}>
          <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Event Details</h3>
              <button className="close-btn" onClick={closeEventEditModal}>×</button>
            </div>

            <div className="modal-body">
              {/* Banner Upload Section */}
              <div className="photo-upload-section">
                <div className="photo-preview">
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="Banner Preview" />
                  ) : (
                    <div className="photo-placeholder">🖼️</div>
                  )}
                </div>
                <div className="photo-upload-controls">
                  <label htmlFor="banner-input" className="upload-label">
                    Upload Banner
                  </label>
                  <input
                    id="banner-input"
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="file-input"
                  />
                  <p className="upload-hint">JPG, PNG or GIF (Max 5MB)</p>
                </div>
              </div>

              {/* Event Details Form */}
              <div className="form-group">
                <label>Event Name *</label>
                <input
                  type="text"
                  placeholder="Enter event name"
                  value={eventDetails.name}
                  onChange={(e) => setEventDetails({ ...eventDetails, name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Enter event description"
                  value={eventDetails.bio}
                  onChange={(e) => setEventDetails({ ...eventDetails, bio: e.target.value })}
                  className="input-field textarea-field"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Amount Per Vote</label>
                <input
                  type="number"
                  placeholder="Enter amount per vote"
                  value={eventDetails.amount_per_vote}
                  onChange={(e) => setEventDetails({ ...eventDetails, amount_per_vote: e.target.value })}
                  className="input-field"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Start Date & Time</label>
                <input
                  type="datetime-local"
                  defaultValue={eventDetails.start_time}
                  onChange={(e) => setEventDetails({ ...eventDetails, start_time: e.target.value })}
                  className="input-field"
                />
                 <p>Start Date Is {new Date(eventDetails.start_time).toDateString()} at {new Date(eventDetails.start_time).toLocaleTimeString()}</p>
              </div>

              <div className="form-group">
                <label>End Date & Time</label>
                <input
                  type="datetime-local"

                  defaultValue={new Date(eventDetails.end_time)}
                  onChange={(e) => setEventDetails({ ...eventDetails, end_time: e.target.value })}
                  className="input-field"
                />
                <p>End Date Is {new Date(eventDetails.end_time).toDateString()} at {new Date(eventDetails.end_time).toLocaleTimeString()}</p>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn cancel-btn"
                onClick={closeEventEditModal}
              >
                Cancel
              </button>
              <button
                className="btn add-btn"
                onClick={handleSaveEventDetails}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Contestant Modal */}
      {showEditContestantModal && (
        <EditContestants closeEditContestantModal={closeEditContestantModal} photoPreview={photoPreview} handlePhotoUpload={handlePhotoUpload} contestant={contestant} setContestant={setContestant} categories={categories} handleAddContestant={handleAddContestant} />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteModal handleDeleteEvent={handleDeleteEvent} setShowDeleteModal={setShowDeleteModal} handleDeleteCategory={handleDeleteCategory} handleDeleteContestant={handleDeleteContestant} itemToDelete={itemToDelete} />
      )}
    </div>
  );
}