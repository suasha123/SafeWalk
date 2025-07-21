import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Fragment, useEffect, useRef, useState } from "react";
import L from "leaflet";
import TextTransition, { presets } from "react-text-transition";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "../Style/reportarea.css";
import { useAuth } from "./AuthContext";
import { CiLocationOn } from "react-icons/ci";
import { TbMessageReport } from "react-icons/tb";
import { NavBar } from "./Navbar";
import { useNavigate } from "react-router-dom";
import { SplashScreen } from "./SplashScreen";
import { FlyToLocation } from "./FlyTo";
import { IoEyeOutline } from "react-icons/io5";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
const TEXTS = ["Loading Map", "Fetching Location"];
export const Report = () => {
  const navigate = useNavigate();
  const [showOverlay, setShowOverlay] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [overlayExit, setOverlayExit] = useState(false);
  const { loading, isLoggedIn } = useAuth();
  const [pos, setLoc] = useState(null);
  const waapiRef = useRef();
  const [loadingg, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (pos) {
          const { latitude, longitude } = pos.coords;
          setLoc([latitude, longitude]);
        }
      },
      (err) => {
        console.error("Geolocation error:", err.code, err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
    const interval = setInterval(() => setIndex((index) => index + 1), 2000);
    return () => clearTimeout(interval);
  }, []);
  useEffect(() => {
    if (pos) {
      setLoading(false);
    }
  }, [pos]);
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate("/");
    }
  }, [loading, isLoggedIn, navigate]);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setOverlayExit(true);
      setTimeout(() => setShowOverlay(false), 500);
    }, 10000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (loading) return;
    const waapiElement = waapiRef.current;
    if (!waapiElement) return;
    const waapiAnimation = waapiElement.animate(
      [{ color: "#ff0088" }, { color: "#0d63f8" }],
      {
        duration: 2000,
        iterations: Infinity,
        direction: "alternate",
        easing: "linear",
      }
    );
    return () => {
      waapiAnimation.cancel();
    };
  }, [loading]);
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const controller = new AbortController();

    const fetchResults = async () => {
      try {
        const res = await fetch(
          `https://safewalk-xbkj.onrender.com/search/searchPlace?query=${encodeURIComponent(
            query
          )}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        console.log(data);
        setResults(data.slice(0, 5)); // Show top 5
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      }
    };

    const timeout = setTimeout(fetchResults, 400); // Debounce
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  if (loading) return <SplashScreen />;
  if (!isLoggedIn) return null;
  return (
    <>
      <NavBar />

      {/* Floating Search Input */}
      <div className="search-bar-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search a location..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {results.length > 0 && (
          <ul className="search-results">
            {results.map((res, idx) => (
              <li
                key={idx}
                onClick={() => {
                  setSelectedLoc([+res.lat, +res.lon]);
                  setLoc(null);
                  setQuery("");
                  setResults([]);
                }}
              >
                {res.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="maincontainer">
        {showOverlay && (
          <div className={`overlay ${overlayExit ? "overlay-exit" : ""}`}>
            <div className="overlay-content">
              <button
                className="overlay-close"
                onClick={() => {
                  setOverlayExit(true);
                  setTimeout(() => setShowOverlay(false), 500);
                }}
              >
                &times;
              </button>
              <h2 className="heading">Report Area Info</h2>
              <li className="info">
                This section allows you to see your current location on the map.
              </li>
              <li className="info">
                Report by tapping on map or searching location.
              </li>
            </div>
          </div>
        )}

        {loadingg ? (
          <div className="loading-container">
            <div className="spinner" />
            <h1 ref={waapiRef} className="loading-text">
              <TextTransition springConfig={presets.gentle}>
                {TEXTS[index % TEXTS.length]}
              </TextTransition>
            </h1>
          </div>
        ) : (
          <Fragment>
            {/*<button onClick={() => setShowReportModal(true)}>Test Modal</button>*/}
            <MapContainer
              center={selectedLoc ?? pos ?? [51.505, -0.09]}
              zoom={13}
              scrollWheelZoom={true}
              zoomControl={false}
              className="map"
              // onClick={(e) => handleMapClick(e)} // Add this later
            >
              <FlyToLocation position={selectedLoc} />

              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {pos && (
                <Marker position={pos}>
                  <Popup>You are here!</Popup>
                </Marker>
              )}

              {selectedLoc && (
                <Marker position={selectedLoc}>
                  <Popup>Search Result</Popup>
                </Marker>
              )}
            </MapContainer>
          </Fragment>
        )}
      </div>
      <div className="summary-cards-row">
        <div className="summary-card">
          <h4 className="heading-with-icon">
            <CiLocationOn className="glow-icon" />
            <span>Current Location</span>
          </h4>
          <p>
            {selectedLoc
              ? `${selectedLoc[0].toFixed(3)}, ${selectedLoc[1].toFixed(3)}`
              : pos
              ? `${pos[0].toFixed(3)}, ${pos[1].toFixed(3)}`
              : "Fetching..."}
          </p>
        </div>
        <div className="summary-card">
          <h4 className="heading-with-icon">
            <TbMessageReport className="glow-icon" />
            <span>Users Reported</span>
          </h4>
          <p>0</p>
        </div>
        <div
          className="summary-card see-reviews"
          onClick={() => {
            const section = document.querySelector(".bottom-info");
            section?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <h4 className="heading-with-icon">
            <IoEyeOutline className="glow-icon" />
            <span>See Reviews</span>
          </h4>
          <p>Scroll to bottom</p>
        </div>
      </div>

      <div className="bottom-info">
        <div className="report-div">
          <h3 className="report-heading">📋 User Reports</h3>
        </div>

        <div className="review-scroll-area">
          {selectedLoc || pos ? (
            <>
              <div className="review-card">
                <img src="https://i.pravatar.cc/40?img=5" className="avatar" />
                <div className="review-content">
                  <h4 className="reviewer-name">Riya Sharma</h4>
                  <p className="review-text">
                    Felt safe walking here at night. Good lighting and crowd
                    around.
                  </p>
                </div>
              </div>
              <div className="review-card">
                <img src="https://i.pravatar.cc/40?img=5" className="avatar" />
                <div className="review-content">
                  <h4 className="reviewer-name">Riya Sharma</h4>
                  <p className="review-text">
                    Felt safe walking here at night. Good lighting and crowd
                    around.
                  </p>
                </div>
              </div>
              <div className="review-card">
                <img src="https://i.pravatar.cc/40?img=5" className="avatar" />
                <div className="review-content">
                  <h4 className="reviewer-name">Riya Sharma</h4>
                  <p className="review-text">
                    Felt safe walking here at night. Good lighting and crowd
                    around.
                  </p>
                </div>
              </div>
              <div className="review-card">
                <img src="https://i.pravatar.cc/40?img=8" className="avatar" />
                <div className="review-content">
                  <h4 className="reviewer-name">Amit Verma</h4>
                  <p className="review-text">
                    Saw suspicious people last week. Be alert around 10PM.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="no-reports">🔍 No reports found for this area yet.</p>
          )}
        </div>
      </div>

      {/* Bottom Sheet Modal for Report */}
      {showReportModal && (
        <div className="report-modal">
          <div className="report-header">
            <h3>📍 Report Incident</h3>
            <button
              className="report-close"
              onClick={() => setShowReportModal(false)}
            >
              &times;
            </button>
          </div>
          <div className="report-body">
            <label>Incident Type</label>
            <select className="report-input">
              <option>Accident</option>
              <option>Harassment</option>
              <option>Theft</option>
              <option>Suspicious Activity</option>
            </select>

            <label>Description</label>
            <textarea
              className="report-input"
              placeholder="Describe what happened..."
            />

            <label>Date & Time</label>
            <input
              className="report-input"
              type="datetime-local"
              defaultValue={new Date().toISOString().slice(0, 16)}
            />

            <div className="report-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowReportModal(false)}
              >
                Cancel
              </button>
              <button className="submit-btn">Submit</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
