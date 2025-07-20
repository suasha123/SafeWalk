import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import TextTransition, { presets } from "react-text-transition";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "../Style/reportarea.css";
import { useAuth } from "./AuthContext";
import { NavBar } from "./Navbar";
import { useNavigate } from "react-router-dom";
import { SplashScreen } from "./SplashScreen";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
const TEXTS = ["Loading Map", "Fetching Location"];
export const  Report = () => {
  const navigate = useNavigate();
  const [showOverlay, setShowOverlay] = useState(true);
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
          console.log(pos);
          setLoc([latitude, longitude]);
        }
      },
      (err) => {
        console.error("Geolocation error:", err.message);
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
  if (loading) return <SplashScreen />;
  if (!isLoggedIn) return null;
  return (
    <>
      <NavBar />
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
              <h2 className="heading">📍 Report Area Info</h2>
              <div>
                <li className="info">
                  This section allows you to see your current location on the
                  map.{" "}
                </li>
                <li className="info">Report by tapping on map.</li>
              </div>
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
          <div className="mapcontainerr">
            <MapContainer
              center={pos != null ? pos : [51.505, -0.09]}
              zoom={13}
              scrollWheelZoom={true}
              className="map"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={pos != null ? pos : [51.505, -0.09]}>
                <Popup>You are here!</Popup>
              </Marker>
            </MapContainer>
          </div>
        )}
      </div>
    </>
  );
};
