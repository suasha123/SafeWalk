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
import { useMapEvent } from "react-leaflet";
import { MdMyLocation } from "react-icons/md";
import { TbReport } from "react-icons/tb";
import "aos/dist/aos.css";
import Aos from "aos";
import { enqueueSnackbar } from "notistack";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
const TEXTS = ["Loading Map", "Fetching Location"];
export const Report = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("user");
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
  const [clickLoc, setclickLoc] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userCount, setuserCount] = useState(null);
  const [userReports, setUserReports] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [lastFetchedLoc, setLastFetchedLoc] = useState(null);
  const [hasFetchedMyReports, setHasFetchedMyReports] = useState(false);
  const [reportData, setReportData] = useState({
    type: "Accident",
    description: "",
    datetime: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16),
  });

  const fetchmyLoc = () => {
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
  };
  useEffect(() => {
    fetchmyLoc();
    Aos.init({ once: true });
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
        setResults(data.slice(0, 5));
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      }
    };

    const timeout = setTimeout(fetchResults, 400);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);
  const handleReport = async () => {
    const location = selectedLoc || clickLoc || pos;
    if (!location) return alert("No location selected");
    setIsSubmitting(true);
    try {
      const payload = {
        ...reportData,
        location: {
          lat: location[0],
          lng: location[1],
        },
      };
      const response = await fetch(
        `https://safewalk-xbkj.onrender.com/upload/report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          credentials: "include",
        }
      );
      const res = await response.json();
      if (response.ok) {
        enqueueSnackbar(res.msg, { variant: "success" });
        setReportData((prev) => ({
          ...prev,
          description: "",
        }));
        setShowReportModal(false);
      } else {
        enqueueSnackbar(res.msg, { variant: "Warning" });
      }
    } catch (err) {
      enqueueSnackbar("Error Occured", { variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      const Location = pos || selectedLoc || clickLoc;

      if (!Location || Location.length !== 2) return;

      const [lat, long] = Location;

      setuserCount(null);
      try {
        const response = await fetch(
          `https://safewalk-xbkj.onrender.com/api/getCount?lat=${lat}&long=${long}`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        if (response.ok) {
          setuserCount(data.count);
        }
      } catch (error) {
        console.error("Failed to fetch count:", error);
      }
    };

    fetchData();
  }, [pos, selectedLoc, clickLoc]);

  useEffect(() => {
    const fetchReports = async () => {
      const loc = pos || selectedLoc || clickLoc;

      if (activeTab === "user") {
        if (!loc || loc.length !== 2) return;

        const key = `${loc[0].toFixed(5)}-${loc[1].toFixed(5)}`;
        if (lastFetchedLoc === key) return;

        setTabLoading(true);
        try {
          const res = await fetch(
            `https://safewalk-xbkj.onrender.com/api/getReportsByLocation?lat=${loc[0]}&long=${loc[1]}`,
            { credentials: "include" }
          );
          const data = await res.json();
          setUserReports(data || []);
          setLastFetchedLoc(key);
        } catch (error) {
          console.error("Error fetching user reports:", error);
        } finally {
          setTabLoading(false);
        }
      }

      if (activeTab === "your") {
        if (hasFetchedMyReports) return;

        setTabLoading(true);
        try {
          const res = await fetch(
            `https://safewalk-xbkj.onrender.com/api/getReportsByUser`,
            { credentials: "include" }
          );
          const data = await res.json();
          setMyReports(data || []);
          setHasFetchedMyReports(true);
        } catch (error) {
          console.error("Error fetching my reports:", error);
        } finally {
          setTabLoading(false);
        }
      }
    };

    fetchReports();
  }, [activeTab, pos, selectedLoc, clickLoc]);

  const ClickHandler = ({ onClick }) => {
    useMapEvent("click", (e) => {
      onClick(e);
    });
    return null;
  };
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
            <MapContainer
              center={selectedLoc ?? pos ?? clickLoc ?? [51.505, -0.09]}
              zoom={13}
              scrollWheelZoom={true}
              zoomControl={false}
              className="map"
            >
              <ClickHandler
                onClick={(e) => {
                  setLoc(null);
                  setSelectedLoc(null);
                  setclickLoc([e.latlng.lat, e.latlng.lng]);
                }}
              />
              <FlyToLocation position={selectedLoc || pos || clickLoc} />

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

              {clickLoc && (
                <Marker position={clickLoc}>
                  <Popup>Search Result</Popup>
                </Marker>
              )}
            </MapContainer>
            {/* Floating Map Controls */}
            <div className="map-action-buttons">
              <button
                className="map-button loc-btn"
                onClick={() => {
                  setSelectedLoc(null);
                  setclickLoc(null);
                  setLoc(null);
                  fetchmyLoc();
                }}
              >
                <MdMyLocation
                  style={{ fontSize: "18px", marginRight: "5px" }}
                />{" "}
                My Location
              </button>
              <button
                className="map-button report-btn"
                onClick={() => {
                  if (pos || clickLoc || selectedLoc) {
                    setShowReportModal(true);
                  }
                }}
              >
                <TbReport style={{ fontSize: "20px", marginRight: "3px" }} />{" "}
                Report Here
              </button>
            </div>
          </Fragment>
        )}
      </div>
      <div className="summary-cards-row">
        <div
          data-aos="fade-right"
          data-aos-duration="1000"
          data-aos-easing="ease"
          className="summary-card"
        >
          <h4 className="heading-with-icon">
            <CiLocationOn className="glow-icon" />
            <span>Current Location</span>
          </h4>
          <p>
            {selectedLoc
              ? `${selectedLoc[0].toFixed(3)}, ${selectedLoc[1].toFixed(3)}`
              : pos
              ? `${pos[0].toFixed(3)}, ${pos[1].toFixed(3)}`
              : clickLoc
              ? `${clickLoc[0].toFixed(3)}, ${clickLoc[1].toFixed(3)}`
              : "Fetching..."}
          </p>
        </div>
        <div
          data-aos="zoom-in-up"
          data-aos-duration="1000"
          data-aos-easing="ease"
          className="summary-card"
        >
          <h4 className="heading-with-icon">
            <TbMessageReport className="glow-icon" />
            <span>Users Reported</span>
          </h4>
          <p>{userCount === null ? "Loading" : userCount}</p>
        </div>
        <div
          data-aos="fade-left"
          data-aos-duration="1000"
          data-aos-easing="ease"
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
          <div className="tab-switcher">
            <div
              className={`tab-button ${
                activeTab === "user" ? "active-tab" : ""
              }`}
              onClick={() => setActiveTab("user")}
            >
              📋 User Reports
            </div>
            <div
              className={`tab-button ${
                activeTab === "your" ? "active-tab" : ""
              }`}
              onClick={() => setActiveTab("your")}
            >
              🧾 Your Reports
            </div>
          </div>
        </div>

        <div
          data-aos="fade-down"
          data-aos-duration="1000"
          data-aos-easing="ease"
          className="review-scroll-area"
        >
          {tabLoading ? (
            <div className="tab-loading-spinner" />
          ) : activeTab === "user" ? (
            <>
              {userReports.length > 0 ? (
                userReports.map((report, idx) => (
                  <div className="review-card" key={idx}>
                    <img src={report.avatar} className="avatar" />
                    <div className="review-content">
                      <h4 className="reviewer-name">
                        {report.username || "Anonymous"}
                      </h4>
                      <p>
                        <strong style={{color :  "#2563eb" , marginRight : "10px" }}>Incident:</strong> {report.type}
                      </p>
                      <p className="review-text">
                      <strong style={{color :  "#ff3d5dff" , marginRight : "10px" }}>Description :</strong>
                        {report.description}
                        <br />
                      </p>
                    </div>
                     
                  </div>
                ))
              ) : (
                <p className="no-reports">
                  🔍 No reports found for this area yet.
                </p>
              )}
            </>
          ) : (
            <>
              {myReports.length > 0 ? (
                myReports.map((report, idx) => (
                  <div className="review-card" key={idx}>
                    <div className="review-content">
                      <h4 className="reviewer-name">
                      <strong style={{color :  "#e357d8ff" , marginRight : "10px" }}>Location:</strong>
                        {parseFloat(report.lat).toFixed(2)}, 
                        {parseFloat(report.long).toFixed(2)}
                      </h4>
                      <p>
                        <strong style={{color :  "#2563eb" , marginRight : "10px" }}>Incident:</strong> {report.type}
                      </p>
                      <p className="review-text">
                      <strong style={{color :  "#ff3d5dff" , marginRight : "10px" }}>Description:</strong>
                        {report.description} <br />
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-reports">
                  📭 You haven't submitted any reports yet.
                </p>
              )}
            </>
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
            <select
              value={reportData.type}
              onChange={(e) =>
                setReportData({ ...reportData, type: e.target.value })
              }
              className="report-input"
            >
              <option>Accident</option>
              <option>Harassment</option>
              <option>Theft</option>
              <option>Suspicious Activity</option>
            </select>

            <label>Description</label>
            <textarea
              className="report-input"
              placeholder="Describe what happened..."
              maxLength={50}
              value={reportData.description}
              onChange={(e) =>
                setReportData({ ...reportData, description: e.target.value })
              }
            />

            <label>Date & Time</label>
            <input
              className="report-input"
              type="datetime-local"
              value={reportData.datetime}
              onChange={(e) =>
                setReportData({ ...reportData, datetime: e.target.value })
              }
            />

            <div className="report-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowReportModal(false)}
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleReport}
                className="submit-btn"
              >
                {isSubmitting ? "Processing..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
