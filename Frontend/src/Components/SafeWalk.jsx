import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvent,
} from "react-leaflet";
import polyline, { encode } from "@mapbox/polyline";
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
import { useSearchParams } from "react-router-dom";
import { FaWalking } from "react-icons/fa";
import { TbMessageReport } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { FaRoute, FaS } from "react-icons/fa6";
import { GiDeathZone } from "react-icons/gi";
import { MdStopCircle } from "react-icons/md";
import * as turf from "@turf/turf";
import { point, lineString, nearestPointOnLine } from "@turf/turf";
import { enqueueSnackbar } from "notistack";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const destMarkerIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const TEXTS = ["Loading Map", "Fetching Location"];
const FitMapToRoute = ({ polylineCoords }) => {
  const map = useMap();
  const hasFlown = useRef(false);

  useEffect(() => {
    if (polylineCoords?.length > 0 && !hasFlown.current) {
      const bounds = L.latLngBounds(polylineCoords);
      map.flyToBounds(bounds, { padding: [50, 50] });
      hasFlown.current = true;
    }
  }, [polylineCoords, map]);

  return null;
};

export const SafeWalk = () => {
  const [routePolyline, setRoutePolyline] = useState(null);
  const { loading, isLoggedIn } = useAuth();
  const [pos, setLoc] = useState(null);
  const [loadingg, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const waapiRef = useRef();
  const navigate = useNavigate();
  const [trackedPath, setTrackedPath] = useState(null);
  const trackingIntervalRef = useRef(null);
  const [trackingButton, setTrackingButton] = useState(true);
  //const [sourceQuery, setSourceQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  //const [sourceResults, setSourceResults] = useState([]);
  const [updatingLoc, setUpdatingLoc] = useState(false);
  const [destinationResults, setDestinationResults] = useState([]);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [sourceLoc, setSourceLoc] = useState(null);
  const [destLoc, setDestLoc] = useState(null);
  const [sourceMarker, setSourceMarker] = useState(null);
  const [desMarker, setDesMarker] = useState(null);
  const [showSafeWalkModal, setShowSafeWalkModal] = useState(false);
  const [loadingR, setLoadingR] = useState(false);
  const [searchParams] = useSearchParams();
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
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    const walkid = searchParams.get("walkid");
    if (walkid) {
      fetchStoredPathFromBackend(walkid);
    } else {
      fetchMyLoc();
    }
    const interval = setInterval(() => setIndex((i) => i + 1), 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (pos) setLoading(false);
  }, [pos]);

  useEffect(() => {
    if (loading) return;
    const el = waapiRef.current;
    if (!el) return;
    const animation = el.animate([{ color: "#ff0088" }, { color: "#0d63f8" }], {
      duration: 2000,
      iterations: Infinity,
      direction: "alternate",
      easing: "linear",
    });
    return () => animation.cancel();
  }, [loading]);

  {
    /*useEffect(() => {
    const controller = new AbortController();
    const fetchResults = async (query, setter) => {
      if (!query) return setter([]);
      try {
        const res = await fetch(
          `https://safewalk-xbkj.onrender.com/search/searchPlace?query=${encodeURIComponent(
            query
          )}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setter(data.slice(0, 5));
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      }
    };
    const timeout = setTimeout(
      () => fetchResults(sourceQuery, setSourceResults),
      400
    );
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [sourceQuery]);*/
  }

  useEffect(() => {
    const controller = new AbortController();
    const fetchResults = async (query, setter) => {
      if (!query) return setter([]);
      try {
        const res = await fetch(
          `https://safewalk-xbkj.onrender.com/search/searchPlace?query=${encodeURIComponent(
            query
          )}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setter(data.slice(0, 5));
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      }
    };
    const timeout = setTimeout(
      () => fetchResults(destinationQuery, setDestinationResults),
      400
    );
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [destinationQuery]);
  const fetchStoredPathFromBackend = async (id) => {
    try {
      const response = await fetch(
        `https://safewalk-xbkj.onrender.com/search/path/${id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await response.json();

      if (response.ok) {
        setSourceMarker(data.src);
        setDesMarker(data.dest);
        setRoutePolyline(data.path);
      } else {
        enqueueSnackbar(data.msg || "Something went wrong", {
          variant: "error",
        });
      }
    } catch (err) {
      enqueueSnackbar("Error fetching path", { variant: "error" });
    }
  };

  const findPath = async () => {
    if (!sourceLoc || !destLoc) return;
    try {
      const res = await fetch(
        `https://safewalk-xbkj.onrender.com/search/findPath?src=${sourceLoc.join(
          ","
        )}&dest=${destLoc.join(",")}`
      );
      const data = await res.json();
      const decoded = polyline.decode(data.routes[0].geometry);
      const result = await storepathinBackend(decoded);
      const m = await result.json();
      if (result.ok) {
        navigate(`/safe-walk?walkid=${m.id}`);
        //setRoutePolyline(decoded);
      } else {
        enqueueSnackbar(m.msg, { variant: "error" });
      }
    } catch (err) {
      enqueueSnackbar("Error occured", { variant: "error" });
    }
  };
  const storepathinBackend = async (path) => {
    if (!path) {
      return;
    }
    try {
      const payload = { src: sourceLoc, des: destLoc, path };
      const response = await fetch(
        `https://safewalk-xbkj.onrender.com/upload/fetchedpath`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );
      return response;
    } catch (err) {
      enqueueSnackbar("Error Occured", { variant: "error" });
    }
  };
  const handleTracking = () => {
    trackingIntervalRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        updateTrackedPath([latitude, longitude]);
      },
      (err) => console.error(err),
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      }
    );
  };
  const updateTrackedPath = (currentPos) => {
    if (!routePolyline) return;
    const routeLine = lineString(routePolyline.map(([lat, lng]) => [lng, lat]));
    const userPoint = point([currentPos[1], currentPos[0]]);
    const snapped = nearestPointOnLine(routeLine, userPoint);
    const nearestLat = snapped.geometry.coordinates[1];
    const nearestLng = snapped.geometry.coordinates[0];
    //backend ka code likhenege first store then update the resposne form backend
    setLoc([nearestLat, nearestLng]);
    const index = snapped.properties.index;
    const covered = [
      ...routePolyline.slice(0, index + 1),
      [nearestLat, nearestLng],
    ];
    setTrackedPath(covered);
  };
  const stopTracking = () => {
    navigator.geolocation.clearWatch(trackingIntervalRef.current);

    trackingIntervalRef.current = null;
  };

  if (loading) return <SplashScreen />;
  if (!isLoggedIn) return null;

  return (
    <>
      <NavBar />
      <div className="startButtonDiv">
        <div className="startButton" onClick={() => setShowSafeWalkModal(true)}>
          <FaWalking style={{ fontSize: "25px" }} />
          <p>Start safeWalk</p>
        </div>
        <div
          className="startButton buttontwo"
          onClick={() => navigate("/report-area")}
        >
          <TbMessageReport style={{ fontSize: "25px", marginRight: "3px" }} />
          <p>Report Area</p>
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
              center={pos}
              zoom={13}
              scrollWheelZoom={true}
              zoomControl={false}
              className="map"
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {pos && (
                <Marker position={pos}>
                  <Popup>You are here!</Popup>
                </Marker>
              )}
              {sourceMarker && trackingButton && (
                <Marker position={sourceMarker}>
                  <Popup>Source</Popup>
                </Marker>
              )}
              {desMarker && (
                <Marker position={desMarker} icon={destMarkerIcon}>
                  <Popup>Destination</Popup>
                </Marker>
              )}
              {routePolyline && (
                <>
                  <Polyline positions={routePolyline} color="blue" weight={4} />
                  {/*<FitMapToRoute polylineCoords={routePolyline} />*/}
                </>
              )}
              {trackedPath && trackedPath.length > 1 && (
                <Polyline positions={trackedPath} color="#802cf4" weight={5} />
              )}
            </MapContainer>
            {!loadingg && (
              <div className="floating-buttons">
                {trackingButton && (
                  <button
                    className="floating-btn"
                    onClick={() => {
                      if (!sourceLoc || !destLoc) {
                        enqueueSnackbar("Start SafeWalk !", {
                          variant: "warning",
                        });
                        return;
                      }
                      handleTracking();
                      setTrackingButton(false);
                    }}
                  >
                    <FaRoute size={"25px"} color="#ffffffff" /> Start Tracking
                  </button>
                )}
                {!trackingButton && (
                  <button
                    className="floating-btn stop"
                    onClick={() => {
                      stopTracking();
                      setTrackingButton(true);
                    }}
                  >
                    <MdStopCircle fontSize={"25px"} />
                    Stop Tracking
                  </button>
                )}

                <button
                  className="floating-btn danger"
                  onClick={() => {
                    // Add logic to toggle danger zones
                    alert("Toggled Danger Zones");
                  }}
                >
                  <GiDeathZone size={"25px"} color="red" /> Show Danger Zones
                </button>
              </div>
            )}
          </Fragment>
        )}
      </div>

      {showSafeWalkModal && (
        <div className="modalOverlay">
          <div className="safeWalkModal">
            <button
              className="modalClose"
              disabled={loadingR}
              onClick={() => setShowSafeWalkModal(false)}
            >
              ×
            </button>
            <label>Source</label>
            <input
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
                setSourceQuery(e.target.value);
              }}
              placeholder="Choose Your Location"
              readOnly
            />
            {/* {sourceResults.length > 0 && (
              <ul className="autocomplete-list">
                {sourceResults.map((result, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      setSource(result.display_name);
                      setSourceLoc([
                        parseFloat(result.lat),
                        parseFloat(result.lon),
                      ]);
                      setSourceQuery("");
                      setSourceResults([]);
                    }}
                  >
                    {result.display_name}
                  </li>
                ))}
              </ul>
            )}*/}
            <div
              className="useCurrentLocation"
              onClick={() => {
                if (updatingLoc) {
                  enqueueSnackbar("Fetching Location", { variant: "warning" });
                  return;
                }
                setUpdatingLoc(true);
                navigator.geolocation.getCurrentPosition((pos) => {
                  const { latitude, longitude } = pos.coords;
                  setSource(`Lat: ${latitude}, Long: ${longitude}`);
                  setSourceLoc([latitude, longitude]);
                  setUpdatingLoc(false);
                });
              }}
            >
              {updatingLoc ? "Fetching Location" : "Update current location"}
            </div>

            <label>Destination</label>
            <input
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setDestinationQuery(e.target.value);
              }}
              placeholder="e.g. Delhi"
            />
            {destinationResults.length > 0 && (
              <ul className="autocomplete-list">
                {destinationResults.map((result, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      setDestination(result.display_name);
                      setDestLoc([
                        parseFloat(result.lat),
                        parseFloat(result.lon),
                      ]);
                      setDestinationQuery("");
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
                disabled={loadingR}
                onClick={async () => {
                  if (!source || !destination) {
                    enqueueSnackbar("Input Field Required", {
                      variant: "warning",
                    });
                    return;
                  }
                  setLoadingR(true);
                  setRoutePolyline(null);
                  setLoc(null);
                  await findPath();
                  //setSourceMarker(sourceLoc);
                  //setDesMarker(destLoc);
                  setSource("");
                  setDestination("");
                  setShowSafeWalkModal(false);
                  setLoadingR(false);
                }}
              >
                {loadingR ? "Fetching Route" : "Start SafeWalk"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
