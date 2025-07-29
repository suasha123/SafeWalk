import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import * as turf from "@turf/turf";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import L from "leaflet";
import "../Style/reportarea.css";
import "../Style/safeWalk.css";
import { NavBar } from "./Navbar";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSnackbar } from "notistack";
// Setup leaflet marker icons
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
  const { loading, isLoggedIn } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [isSpinning, setSpinning] = useState(false);
  const [trackId, setTrackId] = useState(null);
  const [pos, setLoc] = useState(null);
  const [sourceMarker, setSourceMarker] = useState(null);
  const [destMarker, setDesMarker] = useState(null);
  const [routePolyline, setRoutePolyline] = useState([]);
  const [trackedPath, setTrackedPath] = useState([]);
  const [walkk , setWalk] = useState("not Active");
  // Extract tracking ID
  useEffect(() => {
    const id = searchParams.get("trackid");
    if (!id) {
      navigate("/");
      return;
    }
    setTrackId(id);
  }, [searchParams, navigate]);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate("/");
    }
  }, [loading, isLoggedIn, navigate]);

  // Poll tracking info every 3 seconds
  useEffect(() => {
    if (!trackId) return;

    const fetchTrackedPath = async () => {
      setSpinning(true); // Start spinner
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
          const covered = [
            ...data.path.slice(0, data.index + 1),
            [data.lat, data.long],
          ];
          setTrackedPath(covered);
          if (data.completed === "completed") {
            window.location.href = "/safe-walk";
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
    };

    fetchTrackedPath(); // initial
    const interval = setInterval(fetchTrackedPath, 3000);

    return () => clearInterval(interval); // cleanup
  }, [trackId, enqueueSnackbar, navigate]);

  if (loading) return <SplashScreen />;
  if (!isLoggedIn) return <Backgroundcover />;
  if (!trackId) return null;

  return (
    <>
      <NavBar />
      <div className="maincontainer">
        <MapContainer
          center={pos || [0, 0]}
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
      </div>
      <WalkReport />
    </>
  );
};
