import { useState } from "react";
import "./search.css";
import { BASE_URL } from "../../baseUrl";

export default function SearchBar({ placeholder = "Search...", setnotification }) {


  const fetchSearchEvents = async ({ event_kwargs, setnotification }) => {
    try {
      const response = await fetch(`${BASE_URL(`event/search/?event_kwargs=${event_kwargs}`)}/`)
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        console.log("Search Results:", data.data);
        return data.data;
      } else {
        setnotification({
          title: "Search Error",
          statusText: [data.message]
        })
        throw new Error(data.message || 'Failed to search events');
      }
    }
    catch (error) {
      console.error("Error searching events:", error);
      setnotification({
        title: "Search Error",
        statusText: [error.message]
      })
    }
  }






  return (
    <div className="search-wrapper">
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        onChange={(e) => fetchSearchEvents({ event_kwargs: e.target.value })}
      />
    </div>
  );
}
