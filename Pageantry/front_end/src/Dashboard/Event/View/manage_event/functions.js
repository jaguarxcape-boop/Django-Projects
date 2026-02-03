import { fetchAccessToken } from "../../../../fetchAccessToken";
import { PublishEvent, UpdateCategory, AddCategory, UpdateContestant, GetEventDetails } from "./apiCalls";


// Handle add contestant
export const handleAddContestant = async ({ contestant, setnotification, editingContestantId, contestantPhoto, contestants, setContestants, setShowEditContestantModal, eventId, resetContestantForm }) => {
  if (!contestant.name.trim() || !contestant.category_id) {
    setnotification?.({ message: "Please enter contestant name and select category", type: "warning" });
    return;
  }

  if (editingContestantId) {
    // Update existing contestant
    const formData = new FormData();
    formData.append('name', contestant.name);
    formData.append('category_id', contestant.category_id);
    formData.append('bio', contestant.bio || '');
    formData.append('hobby', contestant.hobby || '');

    if (contestantPhoto) {
      formData.append('photo', contestantPhoto);
    }

    const updatedContestant = await UpdateContestant({
      eventId,
      contestantId: editingContestantId,
      contestantData: formData,
      setnotification
    });
    if (updatedContestant) {
      setContestants(contestants.map(c => c.id === editingContestantId ? {
        ...updatedContestant,
        category_id: contestant.category_id
      } : c));
      resetContestantForm();
      setShowEditContestantModal(false);
    }
  } else {
    // Add new contestant
    const formData = new FormData();
    formData.append('name', contestant.name);
    formData.append('category_id', contestant.category_id);
    formData.append('bio', contestant.bio || '');
    formData.append('hobby', contestant.hobby || '');

    if (contestantPhoto) {
      formData.append('photo', contestantPhoto);
    }

    const newContestant = await AddContestant({
      eventId,
      contestantData: formData,
      setnotification
    });
    if (newContestant) {
      setContestants([...contestants, {
        ...newContestant,
        category_id: parseInt(contestant.category_id)
      }]);
      resetContestantForm();
    }
  }
};


// Handle publish event

export const handlePublishEvent = async ({ categories, setnotification, eventId, navigate, contestants }) => {
  if (categories.length === 0) {
    setnotification?.({ message: "Please add at least one category before publishing", type: "warning" });
    return;
  }
  if (contestants.length === 0) {
    setnotification?.({ message: "Please add at least one contestant before publishing", type: "warning" });
    return;
  }

  const success = await PublishEvent({ eventId, setnotification });
  if (success) {
    navigate("/dashboard/events");
  }
};
// Handle add category
export const handleAddCategory = async ({ categoryName, setnotification, editingCategoryId, setCategories, setCategoryName, setEditingCategoryId, categories, eventId }) => {
  if (!categoryName.trim()) {
    setnotification?.({ message: "Please enter a category name", type: "warning" });
    return;
  }

  if (editingCategoryId) {
    // Update existing category
    const updatedCategory = await UpdateCategory({
      eventId,
      categoryId: editingCategoryId,
      categoryName,
      setnotification
    });
    if (updatedCategory) {
      setCategories(categories.map(cat => cat.id === editingCategoryId ? updatedCategory : cat));
      setCategoryName("");
      setEditingCategoryId(null);
    }
  } else {
    // Add new category
    const newCategory = await AddCategory({ eventId, categoryName, setnotification });
    if (newCategory) {
      setCategories([...categories, newCategory]);
      setCategoryName("");
    }
  }
};



export const loadEventDetails = async ({ setLoading, eventId, setEvent, setCategories, setContestants, setnotification }) => {

  fetchAccessToken({
    setAuthenticated:undefined, setnotification:undefined, OKAYRESPONSECALLBACK: async () => {

      setLoading(true);
      try {
        if (!eventId) {
          throw new Error("Event ID is missing from URL");
        }

        console.log("Loading event with ID:", eventId);
        const eventData = await GetEventDetails({ eventId });
         
        

        if (eventData) {
          setEvent(eventData);

          // Format categories from the API response
          const categoriesData = eventData.categories || eventData.eventcategory_set || [];
          setCategories(categoriesData);

          // Format contestants from categories
          const allContestants = [];
          categoriesData.forEach(cat => {
            if (cat.contestants && Array.isArray(cat.contestants)) {
              cat.contestants.forEach(contestant => {
                allContestants.push({
                  id: contestant.id,
                  name: contestant.name,
                  category_id: cat.id,
                  bio: contestant.bio,
                  hobby: contestant.hobby,
                  photo: contestant.photo
                });
              });
            }
          });
          setContestants(allContestants);
        } else {
          setnotification?.({ message: "Failed to load event details", type: "error" });
        }

      } catch (error) {
        console.error("Error loading event:", error);
        setnotification?.({ message: error.message || "Error loading event", type: "error" });
      }
      setLoading(false);
    }
  })

};


