import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import * as turf from "@turf/turf";
import "leaflet/dist/leaflet.css";
import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "../Style/reportarea.css";
import "../Style/safeWalk.css";
import { NavBar } from "./Navbar";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useAuth } from "./AuthContext";
import { HiOutlineRefresh } from "react-icons/hi";
import { SplashScreen } from "./SplashScreen";
import { Backgroundcover } from "./bgcover";
import { WalkReport } from "./W";
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
export const TrackScreen = () => {
  const [searchParams] = useSearchParams();
  const [showModal, setShowModal] = useState(true);
  const { loading, isLoggedIn } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [access, setAccess] = useState(false);
  const navigate = useNavigate();
  const [isSpinning, setSpinning] = useState(false);
  const [trackId, setTrackId] = useState(null);
  const [pos, setLoc] = useState(null);
  const [sourceMarker, setSourceMarker] = useState(null);
  const [destMarker, setDesMarker] = useState(null);
  const [routePolyline, setRoutePolyline] = useState([]);
  const alertref = useRef(false);
  const [trackedPath, setTrackedPath] = useState([]);
  const [tdd, setTd] = useState(0);
  const [cdd, setCd] = useState(0);
  const [username, setUserParams] = useState(null);
  const [walkk, setWalk] = useState("not Active");
  useEffect(() => {
    const id = searchParams.get("trackid");
    const username = searchParams.get("user");
    if (!id && !username) {
      navigate("/");
      return;
    }
    setTrackId(id);
    setUserParams(username);
  }, [searchParams, navigate]);

  useEffect(() => {
    if (username && trackId) {
      const checkacess = async () => {
        try {
          const response = await fetch(
            `https://safewalk-xbkj.onrender.com/search/checkaccess/${trackId}`,
            {
              credentials: "include",
            }
          );
          if (response.ok) {
            setAccess(true);
          } else {
            navigate("/");
          }
        } catch (err) {
          console.log(err);
          navigate("/");
        }
      };
      checkacess();
    }
  }, [username, trackId, navigate]);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate("/");
    }
  }, [loading, isLoggedIn, navigate]);

  useEffect(() => {
    if (!trackId && !username) return;
    if (!access) return;
    const fetchTrackedPath = async () => {
      setSpinning(true);
      try {
        const res = await fetch(
          `https://safewalk-xbkj.onrender.com/search/cpath/${trackId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await res.json();

        if (res.ok) {
          setSourceMarker(data.src);
          setDesMarker(data.dest);
          setRoutePolyline(data.path);
          setLoc([data.lat, data.long]);
          setCd(data.cdist);
          setTd(data.tdist);
          setWalk(data.completed);
          const covered = [
            ...data.path.slice(0, data.index + 1),
            [data.lat, data.long],
          ];
          setTrackedPath(covered);
          if (data.completed === "completed") {
            window.location.href = "/safe-walk";
          }
          if (data.isNearD === true && alertref.current === false) {
            enqueueSnackbar("IN Danger Zone", { variant: "error" });
            const audio = new Audio("/dangeralert.mp3");
            audio.play();
            alertref.current = true;
            setTimeout(() => {
              alertref.current = false;
            }, 5000);
          }
        } else {
          enqueueSnackbar(data.msg || "Something went wrong", {
            variant: "error",
          });
          navigate("/");
        }
      } catch (err) {
        console.log(err);
        enqueueSnackbar("Error in Tracing", { variant: "error" });
        navigate("/");
      } finally {
        setTimeout(() => setSpinning(false), 600);
      }

      fetchTrackedPath();
    };
    const interval = setInterval(fetchTrackedPath, 3000);

    return () => clearInterval(interval);
  }, [trackId, enqueueSnackbar, navigate, access]);

  if (loading) return <SplashScreen />;
  if (!isLoggedIn) return <Backgroundcover />;
  if (!trackId && !username) return null;
  if (!access) return <Backgroundcover />;

  return (
    <div style={{ height: "100vh", backgroundColor: "#141122" }}>
      <NavBar />
      <div className="tracking-outer-banner">
        {access === false ? (
          <div className="center-spinner">
            <div className="spinner"></div>
          </div>
        ) : (
          access && (
            <div className="tracking-pill">
              Tracking: <span className="username">{username}</span>
            </div>
          )
        )}
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Welcome to SafeWalk</h2>
            <p>Click below to see tracking screen.</p>
            <button
              onClick={() => {
                setShowModal(false);
              }}
            >
              Start Tracking
            </button>
          </div>
        </div>
      )}
      <div className="maincontainer">
        {(sourceMarker || destMarker || pos) && (
          <MapContainer
            center={sourceMarker || destMarker || pos}
            zoom={13}
            scrollWheelZoom={true}
            zoomControl={false}
            className="map"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <div className="tracking-header">
              <div className="tracking-subtitle">
                Automatic Refresh at every 3 sec
              </div>
              <div>
                <HiOutlineRefresh
                  className={`refresh-icon ${isSpinning ? "spin" : ""}`}
                  color="#ffff"
                />
              </div>
            </div>

            {pos && (
              <Marker position={pos}>
                <Popup>Last Known Position</Popup>
              </Marker>
            )}

            {sourceMarker && (
              <Marker position={sourceMarker}>
                <Popup>Source</Popup>
              </Marker>
            )}

            {destMarker && (
              <Marker position={destMarker} icon={destMarkerIcon}>
                <Popup>Destination</Popup>
              </Marker>
            )}

            {routePolyline.length > 0 && (
              <Polyline positions={routePolyline} color="blue" weight={4} />
            )}

            {trackedPath.length > 0 && (
              <Polyline positions={trackedPath} color="#802cf4" weight={5} />
            )}
          </MapContainer>
        )}
      </div>
      <WalkReport tdd={tdd} cdd={cdd} walkk={walkk} />
    </div>
  );
};
