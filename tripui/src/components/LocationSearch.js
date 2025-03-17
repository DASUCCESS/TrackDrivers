import React, { useState } from "react";

const MAPBOX_API_KEY = process.env.REACT_APP_MAPBOX_API_KEY;
// console.log(MAPBOX_API_KEY)

const LocationSearch = ({ label, onSelect }) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const handleInputChange = async (e) => {
    const query = e.target.value;
    setInputValue(query);

    if (query.length < 3) {
      setSuggestions([]); // Don't fetch results for very short queries
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${MAPBOX_API_KEY}&autocomplete=true&types=place,postcode,address`
      );
      const data = await response.json();
      setSuggestions(data.features || []);
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
    }
  };

  const handleSelect = (place) => {
    const { center, place_name } = place;
    setInputValue(place_name);
    setSuggestions([]); // We will hide suggestions after selection
    onSelect(`${center[0]},${center[1]}`); // This code Send longitude, latitude
  };

  return (
    <div style={{ position: "relative" }}>
      <label className="form-label">{label}</label>
      <input
        type="text"
        className="form-control"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={`Search ${label}...`}
      />
      {suggestions.length > 0 && (
        <ul
          style={{
            position: "absolute",
            width: "100%",
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            listStyle: "none",
            padding: 0,
            marginTop: "5px",
            maxHeight: "150px",
            overflowY: "auto",
            zIndex: 1000
          }}
        >
          {suggestions.map((place) => (
            <li
              key={place.id}
              onClick={() => handleSelect(place)}
              style={{ padding: "8px", cursor: "pointer", borderBottom: "1px solid #ddd" }}
            >
              {place.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationSearch;
