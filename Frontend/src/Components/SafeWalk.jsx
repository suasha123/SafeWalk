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
import { useMap } from "react-leaflet";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
const destMarkerIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png", // red icon from CDN
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const TEXTS = ["Loading Map", "Fetching Location"];
export const SafeWalk = () => {
  const { loading, isLoggedIn } = useAuth();
  const [pos, setLoc] = useState(null);
  const [loadingg, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const waapiRef = useRef();
  const navigate = useNavigate();
  const [sourceQuery, setSourceQuery] = useState("");
  const [sourceResults, setSourceResults] = useState([]);
  const [destinationQuery, setDestinationQuery] = useState("");
  const [destinationResults, setDestinationResults] = useState([]);
  const [showSafeWalkModal, setShowSafeWalkModal] = useState(false);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [sourceLoc, setsourceLoc] = useState(null);
  const [destLoc, setDesLoc] = useState(null);
  const [sourceMarker, setSourceMarker] = useState(null);
  const [desMarker, setDesMarker] = useState(null);
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
  const FitMap = ({ sourceLoc, destLoc }) => {
    const map = useMap();
    useEffect(() => {
      if (map && sourceLoc && destLoc) {
        const bounds = [sourceLoc, destLoc];
        map.flyToBounds(bounds, { padding: [50, 50] });
      }
    }, [map, sourceLoc, destLoc]);
    return null;
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

  useEffect(() => {
    if (!sourceQuery) {
      setSourceResults([]);
      return;
    }

    const controller = new AbortController();
    const fetchResults = async () => {
      try {
        const res = await fetch(
          `https://safewalk-xbkj.onrender.com/search/searchPlace?query=${encodeURIComponent(
            sourceQuery
          )}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setSourceResults(data.slice(0, 5));
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      }
    };

    const timeout = setTimeout(fetchResults, 400);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [sourceQuery]);

  useEffect(() => {
    if (!destinationQuery) {
      setDestinationResults([]);
      return;
    }

    const controller = new AbortController();
    const fetchResults = async () => {
      try {
        const res = await fetch(
          `https://safewalk-xbkj.onrender.com/search/searchPlace?query=${encodeURIComponent(
            destinationQuery
          )}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setDestinationResults(data.slice(0, 5));
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      }
    };

    const timeout = setTimeout(fetchResults, 400);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [destinationQuery]);

  const findPath = async () => {
    if (!sourceLoc || !destLoc) return;
    try {
      const res = await fetch(
        `https://safewalk-xbkj.onrender.com/search/findPath?src=${sourceLoc.join(
          ","
        )}&dest=${destLoc.join(",")}`
      );
      const data = await res.json();
    } catch (err) {
      console.error("Error fetching path:", err);
    }
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
              <FitMap sourceLoc={sourceLoc} destLoc={destLoc} />
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {pos && (
                <Marker position={pos}>
                  <Popup>You are here!</Popup>
                </Marker>
              )}
              {sourceMarker && (
                <Marker position={sourceMarker}>
                  <Popup>Source</Popup>
                </Marker>
              )}
              {desMarker && (
                <Marker position={desMarker} icon={destMarkerIcon}>
                  <Popup>Destination</Popup>
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

            <label htmlFor="src">Source</label>
            <input
              type="text"
              value={source}
              name="src"
              onChange={(e) => {
                setSource(e.target.value);
                setSourceQuery(e.target.value);
              }}
              placeholder="e.g., Mumbai, Maharashtra"
            />
            {sourceResults.length > 0 && (
              <ul className="autocomplete-list">
                {sourceResults.map((result, i) => (
                  <li
                    key={i}
                    className="autocomplete-item"
                    onClick={() => {
                      setSource(result.display_name);
                      setSourceQuery("");
                      setsourceLoc([
                        parseFloat(result.lat),
                        parseFloat(result.lon),
                      ]);
                      setSourceResults([]);
                    }}
                  >
                    {result.display_name}
                  </li>
                ))}
              </ul>
            )}

            <div
              className="useCurrentLocation"
              onClick={() => {
                navigator.geolocation.getCurrentPosition((pos) => {
                  const { latitude, longitude } = pos.coords;
                  const locationText = `Lat: ${latitude}, Long: ${longitude}`;
                  setSource(locationText);
                  setSourceQuery("");
                  setSourceResults([]);
                  setsourceLoc([latitude, longitude]);
                });
              }}
            >
              Use current location
            </div>

            <label htmlFor="dest">Destination</label>
            <input
              type="text"
              value={destination}
              name="dest"
              onChange={(e) => {
                setDestination(e.target.value);
                setDestinationQuery(e.target.value);
              }}
              placeholder="e.g., Delhi, Delhi"
            />
            {destinationResults.length > 0 && (
              <ul className="autocomplete-list">
                {destinationResults.map((result, i) => (
                  <li
                    key={i}
                    className="autocomplete-item"
                    onClick={() => {
                      setDestination(result.display_name);
                      setDestinationQuery("");
                      setDesLoc([
                        parseFloat(result.lat),
                        parseFloat(result.lon),
                      ]);
                      setDestinationResults([]);
                    }}
                  >
                    {result.display_name}
                  </li>
                ))}
              </ul>
            )}

            <div className="modalButtons">
              <button
                className="startBtn"
                onClick={async () => {
                  await findPath();
                  if (sourceLoc && sourceLoc[0] && sourceLoc[1]) {
                    setSourceMarker(sourceLoc);
                  }
                  if (destLoc && destLoc[0] && destLoc[1]) {
                    setDesMarker(destLoc);
                  }
                  setLoc(null);
                }}
              >
                Start SafeWalk
              </button>
              <button className="sendBtn">Send to Chat & Group</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
