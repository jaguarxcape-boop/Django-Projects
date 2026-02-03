import { BASE_URL } from "../../baseUrl";

export const fetchEventDetails = async ({ 
    setnotification, 
    navigate, 
    setLoading, 
    setEvent, 
    setCategories, 
    setExpandedCategories, 
    setContestants, 
    eventId }) => {
    try {
        setLoading(true);
        const response = await fetch(BASE_URL(`event/public/${eventId}/`));
        const data = await response.json();

        if (response.ok && data.status === 'success') {
            setEvent(data.data);

            // Process categories with contestants
            if (data.data.categories && data.data.categories.length > 0) {
                setCategories(data.data.categories);
                // Initialize all categories as expanded by default
                const expandedState = {};
                data.data.categories.forEach(cat => {
                    expandedState[cat.id] = true;
                });
                setExpandedCategories(expandedState);
                // Flatten all contestants from all categories
                const allContestants = data.data.categories.flatMap(cat =>
                    cat.contestants.map(c => ({
                        ...c,
                        categoryName: cat.name,
                        categoryId: cat.id
                    }))
                );
                setContestants(allContestants);
            }
        } else {
            setnotification({ type: 'error', message: 'Event not found' });
            navigate('/vote');
        }
    } catch (error) {
        console.error('Error fetching event:', error);
        setnotification({ type: 'error', message: 'Failed to load event' });
    } finally {
        setLoading(false);
    }
};
