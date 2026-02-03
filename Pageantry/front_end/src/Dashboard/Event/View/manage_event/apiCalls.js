import { BASE_URL } from "../../../../baseUrl"
import { fetchAccessToken } from "../../../../fetchAccessToken";

// Get event details
export const GetEventDetails = async ({ eventId, setState }) => {
    // fetchAccessToken({
    //     setAuthenticated: undefined, setnotification: undefined, OKAYRESPONSECALLBACK: async () => {
            try {

                const accessToken = localStorage.getItem("access_token");
                const call = await fetch(`${BASE_URL(`event/${eventId}/`)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                })

                if (!call.ok) {
                    console.error("Failed to fetch event details", call.status)
                    return null
                }

                const data = await call.json()
                console.log("Event data:", data)

                if (data.status === "success" && setState) {
                    setState(data.data)
                }
                return data.data || data
            } catch (error) {
                console.error("Error fetching event details:", error)
                return null
            }
    //     }
    // })

}

// Add category to event
export const AddCategory = async ({ eventId, categoryName, setnotification }) => {
    return await fetchAccessToken({
        setAuthenticated: undefined, setnotification: undefined, OKAYRESPONSECALLBACK: async () => {
            try {
                const response = await fetch(`${BASE_URL(`event/${eventId}/categories/`)}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                    },
                    body: JSON.stringify({ name: categoryName })
                })

                const data = await response.json()

                if (response.ok && data.status === "success") {
                    setnotification?.({ message: "Category added successfully", type: "success" })
                    return data.data
                } else {
                    setnotification?.({ message: data.message || "Failed to add category", type: "error" })
                    return null
                }
            } catch (error) {
                console.error("Error adding category:", error)
                setnotification?.({ message: "Error adding category", type: "error" })
                return null
            }
        }
    })

}

// Update category
export const UpdateCategory = async ({ eventId, categoryId, categoryName, setnotification }) => {
    return await fetchAccessToken({
        setnotification: undefined, setAuthenticated: undefined, OKAYRESPONSECALLBACK: async () => {
            try {
                const response = await fetch(`${BASE_URL(`event/${eventId}/categories/${categoryId}/`)}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                    },
                    body: JSON.stringify({ name: categoryName })
                })

                const data = await response.json()

                if (response.ok && data.status === "success") {
                    setnotification?.({ message: "Category updated successfully", type: "success" })
                    return data.data
                } else {
                    setnotification?.({ message: data.message || "Failed to update category", type: "error" })
                    return null
                }
            } catch (error) {
                console.error("Error updating category:", error)
                setnotification?.({ message: "Error updating category", type: "error" })
                return null
            }
        }
    })

}

// Delete category
export const DeleteCategory = async ({ eventId, categoryId, setnotification }) => {
    return await fetchAccessToken({
        setnotification: undefined, setAuthenticated: undefined, OKAYRESPONSECALLBACK: async () => {

            try {
                const response = await fetch(`${BASE_URL(`event/${eventId}/categories/${categoryId}/`)}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                    }
                })

                const data = await response.json()

                if (response.ok) {
                    setnotification?.({ message: "Category deleted successfully", type: "success" })
                    return true
                } else {
                    setnotification?.({ message: data.message || "Failed to delete category", type: "error" })
                    return false
                }
            } catch (error) {
                console.error("Error deleting category:", error)
                setnotification?.({ message: "Error deleting category", type: "error" })
                return false
            }
        }
    })
}

// Add contestant to event
export const AddContestant = async ({ eventId, contestantData, setnotification }) => {
    return await fetchAccessToken({
        setnotification: undefined, setAuthenticated: undefined, OKAYRESPONSECALLBACK: async () => {

            try {
                const response = await fetch(`${BASE_URL(`event/${eventId}/contestants/`)}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                    },
                    body: contestantData instanceof FormData ? contestantData : JSON.stringify(contestantData)
                })

                const data = await response.json()

                if (response.ok && data.status === "success") {
                    setnotification?.({ message: "Contestant added successfully", type: "success" })
                    return data.data
                } else {
                    setnotification?.({ message: data.message || "Failed to add contestant", type: "error" })
                    return null
                }
            } catch (error) {
                console.error("Error adding contestant:", error)
                setnotification?.({ message: "Error adding contestant", type: "error" })
                return null
            }
        }
    })
}

// Update contestant
export const UpdateContestant = async ({ eventId, contestantId, contestantData, setnotification }) => {
    return await fetchAccessToken({
        setnotification: undefined, setAuthenticated: undefined, OKAYRESPONSECALLBACK: async () => {

            try {
                const response = await fetch(`${BASE_URL(`event/${eventId}/contestants/${contestantId}/`)}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                    },
                    body: contestantData instanceof FormData ? contestantData : JSON.stringify(contestantData)
                })

                const data = await response.json()

                if (response.ok && data.status === "success") {
                    setnotification?.({ message: "Contestant updated successfully", type: "success" })
                    return data.data
                } else {
                    setnotification?.({ message: data.message || "Failed to update contestant", type: "error" })
                    return null
                }
            } catch (error) {
                console.error("Error updating contestant:", error)
                setnotification?.({ message: "Error updating contestant", type: "error" })
                return null
            }
        }
    })
}

// Delete contestant
export const DeleteContestant = async ({ eventId, contestantId, setnotification }) => {
    return await fetchAccessToken({
        setnotification: undefined, setAuthenticated: undefined, OKAYRESPONSECALLBACK: async () => {

            try {
                const response = await fetch(`${BASE_URL(`event/${eventId}/contestants/${contestantId}/`)}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                    }
                })

                const data = await response.json()

                if (response.ok) {
                    setnotification?.({ message: "Contestant deleted successfully", type: "success" })
                    return true
                } else {
                    setnotification?.({ message: data.message || "Failed to delete contestant", type: "error" })
                    return false
                }
            } catch (error) {
                console.error("Error deleting contestant:", error)
                setnotification?.({ message: "Error deleting contestant", type: "error" })
                return false
            }
        }
    })
}

// Publish event
export const PublishEvent = async ({ eventId, setnotification }) => {
    return await fetchAccessToken({
        setnotification: undefined, setAuthenticated: undefined, OKAYRESPONSECALLBACK: async () => {

            try {
                const response = await fetch(`${BASE_URL(`event/${eventId}/publish/`)}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                    }
                })

                const data = await response.json()

                if (response.ok && data.status === "success") {
                    setnotification?.({ message: "Event published successfully", type: "success" })
                    return true
                } else {
                    setnotification?.({ message: data.message || "Failed to publish event", type: "error" })
                    return false
                }
            } catch (error)
            {
                console.error("Error publishing event:", error)
                setnotification?.({ message: "Error publishing event", type: "error" })
                return false
}
            }
        }
    )
}

// Delete event
export const DeleteEvent = async ({ eventId, setnotification }) => {

    return await fetchAccessToken({
        setnotification: undefined, setAuthenticated: undefined, OKAYRESPONSECALLBACK: async () => {

            try {
                const response = await fetch(`${BASE_URL(`event/${eventId}/`)}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                    }
                })

                const data = await response.json()

                if (response.ok) {
                    setnotification?.({ message: "Event deleted successfully", type: "success" })
                    return true
                } else {
                    setnotification?.({ message: data.message || "Failed to delete event", type: "error" })
                    return false
                }
            } catch (error) {
                console.error("Error deleting event:", error)
                setnotification?.({ message: "Error deleting event", type: "error" })
                return false
            }
        }
    })
}

// Update event details
export const UpdateEvent = async ({ eventId, eventData, setnotification }) => {

    return await fetchAccessToken({
        setnotification: undefined, setAuthenticated: undefined, OKAYRESPONSECALLBACK: async () => {
            try {
                const response = await fetch(`${BASE_URL(`event/${eventId}/`)}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                    },
                    body: eventData instanceof FormData ? eventData : JSON.stringify(eventData)
                })

                const data = await response.json()

                if (response.ok && data.status === "success") {
                    setnotification?.({ message: "Event updated successfully", type: "success" })
                    return data.data
                } else {
                    setnotification?.({ message: data.message || "Failed to update event", type: "error" })
                    return null
                }
            } catch (error) {
                console.error("Error updating event:", error)
                setnotification?.({ message: "Error updating event", type: "error" })
                return null
            }


        }
    })
}
