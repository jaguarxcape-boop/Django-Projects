import { useState } from "react";
import "./search.css";

export default function SearchBar({ placeholder = "Search..." }) {
  const [query, setQuery] = useState("");

  return (
    <div className="search-wrapper">
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
}
