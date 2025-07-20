import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import L from "leaflet";
import '../Style/reportarea.css';

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// ✅ Updated SearchBox using fetch instead of axios
function SearchBox({ onSelect }) {
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);

  const handleChange = async (e) => {
    const value = e.target.value;
    setInput(value);

    if (value.length > 2) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&addressdetails=1&limit=5`, {
          headers: {
            "User-Agent": "SafeWalkApp/1.0", // Nominatim requires this
            "Accept": "application/json"
          }
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Search error:", err.message);
        setResults([]);
      }
    }
  };

  return (
    <div className="search-box">
      <input
        type="text"
        value={input}
        onChange={handleChange}
        placeholder="Search street or area..."
      />
      <ul>
        {results.map((loc, idx) => (
          <li key={idx} onClick={() => onSelect(loc)}>
            {loc.display_name}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TapMarker({ onReport }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onReport(e.latlng);
    },
  });

  return position ? (
    <Marker position={position}>
      <Popup>
        <form className="report-form">
          <select>
            <option>Dark Area</option>
            <option>Suspicious Activity</option>
            <option>Street Harassment</option>
          </select>
          <textarea placeholder="Add optional notes..." rows={3} />
          <button type="button">Submit</button>
        </form>
      </Popup>
    </Marker>
  ) : null;
}

export const SafeWalkMap = () => {
  const [pos, setPos] = useState(null);
  const [center, setCenter] = useState([28.6139, 77.2090]); // Default: Delhi
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setPos([latitude, longitude]);
        setCenter([latitude, longitude]);
        setLoading(false);
      },
      (err) => {
        console.error("Geolocation error:", err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  const handlePlaceSelect = (loc) => {
    const lat = parseFloat(loc.lat);
    const lon = parseFloat(loc.lon);
    setCenter([lat, lon]);
  };

  return (
    <div className="map-container">
      <SearchBox onSelect={handlePlaceSelect} />
      {loading ? (
        <div className="loading">Loading map...</div>
      ) : (
        <MapContainer center={center} zoom={16} scrollWheelZoom className="leaflet-map">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {pos && (
            <Marker position={pos}>
              <Popup>You are here</Popup>
            </Marker>
          )}
          <TapMarker onReport={(latlng) => console.log("Report at:", latlng)} />
        </MapContainer>
      )}
    </div>
  );
};
