import { useEffect, useState } from "react";
import './manage_event.css';
import { GetEventDetails } from "./apiCalls";

export default function EventManagement({ eventId }) {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");

  const [contestants, setContestants] = useState([]);
  const [contestant, setContestant] = useState({ name: "", category: "" });

  const addCategory = () => {
    if (!categoryName.trim()) return;
    setCategories([...categories, categoryName]);
    setCategoryName("");
  };

  const renameCategory = (index) => {
    const newName = prompt("Enter new category name:", categories[index]);
    if (!newName || !newName.trim()) return;
    const updatedCategories = [...categories];
    const oldName = updatedCategories[index];
    updatedCategories[index] = newName;
    setCategories(updatedCategories);

    const updatedContestants = contestants.map(c => c.category === oldName ? { ...c, category: newName } : c);
    setContestants(updatedContestants);
  };

  const deleteCategory = (index) => {
    const removedCategory = categories[index];
    const newCategories = categories.filter((_, i) => i !== index);
    setCategories(newCategories);

    const newContestants = contestants.filter(c => c.category !== removedCategory);
    setContestants(newContestants);
  };

  const addContestant = () => {
    if (!contestant.name || !contestant.category) return;
    setContestants([...contestants, contestant]);
    setContestant({ name: "", category: "" });
  };

  const renameContestant = (index) => {
    const newName = prompt("Enter new contestant name:", contestants[index].name);
    if (!newName || !newName.trim()) return;
    const updatedContestants = [...contestants];
    updatedContestants[index].name = newName;
    setContestants(updatedContestants);
  };

  const deleteContestant = (index) => {
    const newContestants = contestants.filter((_, i) => i !== index);
    setContestants(newContestants);
  };


  useEffect(() => {
    GetEventDetails({ eventId })
  }, [])
  return (
    <div className="event-manager">
      <h2>Manage Event</h2>

      <section className="card">
        <h3>Categories</h3>
        <div className="row">
          <input
            type="text"
            placeholder="Category name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="input-field"
          />
          <button className="btn add-btn" onClick={addCategory}>Add</button>
        </div>

        <ul className="item-list">
          {categories.map((cat, i) => (
            <li key={i} className="item">
              <span>{cat}</span>
              <div className="item-buttons">
                <button className="btn rename-btn" onClick={() => renameCategory(i)}>Rename</button>
                <button className="btn delete-btn" onClick={() => deleteCategory(i)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h3>Contestants</h3>
        <div className="row">
          <input
            type="text"
            placeholder="Contestant name"
            value={contestant.name}
            onChange={(e) => setContestant({ ...contestant, name: e.target.value })}
            className="input-field"
          />
          <select
            value={contestant.category}
            onChange={(e) => setContestant({ ...contestant, category: e.target.value })}
            className="input-field"
          >
            <option value="">Select category</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
          </select>
          <button className="btn add-btn" onClick={addContestant}>Add Contestant</button>
        </div>

        <ul className="item-list">
          {contestants.map((c, i) => (
            <li key={i} className="item">
              <span>{c.name} — {c.category}</span>
              <div className="item-buttons">
                <button className="btn rename-btn" onClick={() => renameContestant(i)}>Rename</button>
                <button className="btn delete-btn" onClick={() => deleteContestant(i)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}