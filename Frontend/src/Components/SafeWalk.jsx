import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvent,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Fragment, useEffect, useRef, useState } from "react";
import L from "leaflet";
import TextTransition, { presets } from "react-text-transition";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "../Style/reportarea.css";
import "../Style/safeWalk.css";
import { useAuth } from "./AuthContext";
import { NavBar } from "./Navbar";
import { SplashScreen } from "./SplashScreen";
import { FlyToLocation } from "./FlyTo";
import { FaWalking } from "react-icons/fa";
import { TbMessageReport } from "react-icons/tb";
import { useNavigate } from "react-router-dom";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const TEXTS = ["Loading Map", "Fetching Location"];

export const SafeWalk = () => {
  const { loading, isLoggedIn } = useAuth();
  const [pos, setLoc] = useState(null);
  const [loadingg, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const waapiRef = useRef();
  const navigate = useNavigate();

  // Modal States
  const [showSafeWalkModal, setShowSafeWalkModal] = useState(false);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");

  const fetchMyLoc = () => {
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
    fetchMyLoc();
    const interval = setInterval(() => setIndex((index) => index + 1), 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (pos) {
      setLoading(false);
    }
  }, [pos]);

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
      <div className="startButtonDiv">
        <div className="startButton" onClick={() => setShowSafeWalkModal(true)}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <FaWalking style={{ fontSize: "25px" }} />
            <p> Start safeWalk</p>
          </div>
        </div>
        <div className="startButton buttontwo">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "4px",
            }}
            onClick={() => {
              navigate("/report-area");
            }}
          >
            <TbMessageReport style={{ fontSize: "25px", marginRight: "3px" }} />
            <p> Report Area</p>
          </div>
        </div>
      </div>

      <div className="maincontainer">
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
              center={pos ?? [51.505, -0.09]}
              zoom={13}
              scrollWheelZoom={true}
              zoomControl={false}
              className="map"
            >
              <ClickHandler onClick={() => {}} />
              <FlyToLocation position={pos} />
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {pos && (
                <Marker position={pos}>
                  <Popup>You are here!</Popup>
                </Marker>
              )}
            </MapContainer>
          </Fragment>
        )}
      </div>

      {/* SafeWalk Modal */}
      {showSafeWalkModal && (
        <div className="modalOverlay">
          <div className="safeWalkModal">
            <button
              className="modalClose"
              onClick={() => setShowSafeWalkModal(false)}
            >
              ×
            </button>
          

            <label>Source</label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g., Mumbai, Maharashtra"
            />
            <div
              className="useCurrentLocation"
              onClick={() => {
                navigator.geolocation.getCurrentPosition((pos) => {
                  const { latitude, longitude } = pos.coords;
                  setSource(`Lat: ${latitude}, Long: ${longitude}`);
                });
              }}
            >
              Use current location
            </div>

            <label>Destination</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Delhi, Delhi"
            />

            <div className="modalButtons">
              <button className="startBtn">Start SafeWalk</button>
              <button className="sendBtn">Send to Chat & Group</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
