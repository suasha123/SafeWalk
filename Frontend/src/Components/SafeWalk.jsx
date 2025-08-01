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
import ModalOverlay from "./SharingModel.jsx";
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
import "aos/dist/aos.css";
import Aos from "aos";
import { FlyToLocation } from "./FlyTo";
import { useSearchParams } from "react-router-dom";
import { FaWalking } from "react-icons/fa";
import { TbMessageReport } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { FaRoute, FaS } from "react-icons/fa6";
import { GiDeathZone } from "react-icons/gi";
import { MdAltRoute } from "react-icons/md";
import { MdStopCircle } from "react-icons/md";
import * as turf from "@turf/turf";
import { RxExit } from "react-icons/rx";
import { point, lineString, nearestPointOnLine } from "@turf/turf";
import { enqueueSnackbar } from "notistack";
import { Backgroundcover } from "./bgcover";
import { useLocation } from "react-router-dom";
import { FaUserGroup } from "react-icons/fa6";
import { WalkReport } from "./W.jsx";
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
const pulsingIcon = L.divIcon({
  className: "pulse-marker",
  iconSize: [20, 20],
  html: `<div class="pulse-ring"></div>`,
});

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
  const [trackingStatus, setTrackingStatus] = useState("idle");
  // "idle" | "processing" | "tracking"
  const alertRef = useRef(false);
  const [routePolyline, setRoutePolyline] = useState(null);
  const { loading, isLoggedIn, user } = useAuth();
  const [showMapOverlay, setShowMapOverlay] = useState(true);
  const [pos, setLoc] = useState(null);
  const [loadingg, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const waapiRef = useRef();
  const navigate = useNavigate();
  const [trackedPath, setTrackedPath] = useState(null);
  const trackingIntervalRef = useRef(null);
  const hasStartedTracking = useRef(false);
  const [startWalkButton, setWalkButton] = useState(false);
  const [trackingButton, setTrackingButton] = useState(true);
  const [td, setTd] = useState(0);
  const [cd, setCd] = useState(0);
  const [walk, setWalk] = useState("not Active");
  const [showModal, setShowModal] = useState(false);
  const [link, setLink] = useState("");
  //const [sourceQuery, setSourceQuery] = useState("");
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeWalkId, setActiveSessionId] = useState(null);
  const [destinationQuery, setDestinationQuery] = useState("");
  //const [sourceResults, setSourceResults] = useState([]);
  const [isLoadingAlt, setIsLoadingAlt] = useState(false);
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
  const location = useLocation();
  const [dangerZones, setDangerZones] = useState([]);
  const [mode, setMode] = useState({
    showD: true,
    showP: false,
    showAlt: false,
  });
  useEffect(() => {
    return () => {
      if (trackingIntervalRef.current) {
        navigator.geolocation.clearWatch(trackingIntervalRef.current);
        trackingIntervalRef.current = null;
        console.log("✅ Cleared geolocation tracking on route change");
      }
    };
  }, [location.pathname]);
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
    Aos.init({ once: true });
    let intervaltwo;
    const fetchData = async () => {
      const walkid = searchParams.get("walkid");
      const trackingid = searchParams.get("trackid");
      if (trackingid !== null) {
        await fetchTrackedPathFrombackend(trackingid);
        setTrackingStatus("tracking");
        setLoading(false);
        return;
      }
      if (walkid) {
        await fetchStoredPathFromBackend(walkid);
        setLoading(false);
        intervaltwo = setTimeout(() => {
          setShowMapOverlay(false);
        }, 2000);
        return;
      }
      if (!trackingid || !walkid) {
        const response = await isActiveSession();
        if (response && response.status === 200) {
          const res = await response.json();
          if (res.trackedid !== null) {
            navigate(`/safe-walk?trackid=${res.trackedid}`);
            setTrackingStatus("tracking");
            return;
          }

          if (res.id) {
            setShowResumeModal(true);
            setActiveSessionId(res.id);
            console.log(resumeWalkId);
            return;
          }
        }
        if (response && response.status == 500) {
          enqueueSnackbar("Please Try Later", { variant: "warning" });
          navigate("/");
        }
        setShowMapOverlay(false);
        return;
      }
    };

    fetchData();
    fetchMyLoc();

    const interval = setInterval(() => setIndex((i) => i + 1), 2000);
    return () => {
      clearInterval(interval), clearTimeout(intervaltwo);
    };
  }, [searchParams]);
  useEffect(() => {
    if (
      trackingStatus === "tracking" &&
      routePolyline &&
      routePolyline.length > 0 &&
      !trackingIntervalRef.current &&
      user?.id
    ) {
      handleTracking();
      setTrackingStatus("tracking");
    }
  }, [trackingStatus, routePolyline, user]);
  useEffect(() => {
    return () => {
      if (trackingIntervalRef.current) {
        navigator.geolocation.clearWatch(trackingIntervalRef.current);
        trackingIntervalRef.current = null;
      }
    };
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
  const isActiveSession = async () => {
    try {
      const response = await fetch(
        "https://safewalk-xbkj.onrender.com/search/activesession",
        {
          credentials: "include",
        }
      );
      return response;
    } catch (err) {
      enqueueSnackbar("Error occured", { variant: "error" });
    }
  };

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
      //////////////////////////////////////////////
      if (response.ok) {
        setSourceMarker(data.src);
        setDesMarker(data.dest);
        setRoutePolyline(data.path);
        setLoc(data.src);
      } else {
        enqueueSnackbar(data.msg || "Something went wrong", {
          variant: "error",
        });
        navigate("/");
      }
    } catch (err) {
      enqueueSnackbar("Error fetching path", { variant: "error" });
    }
  };
  const fetchTrackedPathFrombackend = async (id) => {
    try {
      const response = await fetch(
        `https://safewalk-xbkj.onrender.com/search/cpath/${id}`,
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
        setLoc([data.lat, data.long]);
        const covered = [
          ...data.path.slice(0, data.index + 1),
          [data.lat, data.long],
        ];
        setTrackedPath(covered);
        setShowMapOverlay(false);
      } else {
        enqueueSnackbar(data.msg || "Something went wrong", {
          variant: "error",
        });
        navigate("/");
      }
    } catch (err) {
      enqueueSnackbar("Error in Tracing", { variant: "error" });
      navigate("/");
    }
  };

  const findPath = async () => {
    if (!sourceLoc || !destLoc) return;
    try {
      setShowMapOverlay(true);
      const res = await fetch(
        `https://safewalk-xbkj.onrender.com/search/findPath?src=${sourceLoc.join(
          ","
        )}&dest=${destLoc.join(",")}`
      );
      const data = await res.json();
      const allRoutes = data.routes.map((route) => route.geometry);
      console.log(allRoutes);
      const decoded = polyline.decode(data.routes[0].geometry);
      const result = await storepathinBackend(decoded, allRoutes);
      const m = await result.json();
      if (result.ok) {
        navigate(`/safe-walk?walkid=${m.id}`);
        setTimeout(() => {
          setShowMapOverlay(false);
        }, 2000);
      } else {
        enqueueSnackbar(m.msg, { variant: "error" });
      }
    } catch (err) {
      enqueueSnackbar("Error occured", { variant: "error" });
    }
  };

  const storepathinBackend = async (path, allRoutes) => {
    if (!path) {
      return;
    }
    try {
      const payload = {
        src: sourceLoc,
        des: destLoc,
        path,
        allpath: allRoutes,
      };
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
  const handleTracking = async () => {
    if (!searchParams.get("walkid") && !searchParams.get("trackid")) {
      enqueueSnackbar("Start SafeWalk", { variant: "warning" });
      return;
    }
    if (!hasStartedTracking.current && !searchParams.get("trackid")) {
      const routeLine = lineString(
        routePolyline.map(([lat, lng]) => [lng, lat])
      );
      if (!sourceLoc) {
        enqueueSnackbar("starting track from Current Location", {
          variant: "success",
        });
        console.log(pos);
      }
      const userPoint = point([
        sourceLoc?.[1] !== undefined ? sourceLoc[1] : pos?.[1],
        sourceLoc?.[0] !== undefined ? sourceLoc[0] : pos?.[0],
      ]);
      const snapped = nearestPointOnLine(routeLine, userPoint);
      const nearestLat = snapped.geometry.coordinates[1];
      const nearestLng = snapped.geometry.coordinates[0];
      const index = snapped.properties.index;
      setTrackingStatus("processing");
      setIsLoadingAlt(true);
      const res = await storeTrackedPath(nearestLat, nearestLng, index);
      if (res && res.ok) {
        const result = await res.json();
        const track = result.id;
        navigate(`/safe-walk?trackid=${track}`);
        setTrackingStatus("tracking");
        hasStartedTracking.current = true;
        setTrackingButton(false);
      } else {
        if (res.status === 409) {
          return;
        }
        enqueueSnackbar("Unable to track", { variant: "warning" });
        return;
      }
    } else {
      trackingIntervalRef.current = navigator.geolocation.watchPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          console.log(latitude);
          console.log(longitude);
          await updateTrackedPath([latitude, longitude]);
          if (!hasStartedTracking.current) {
            setTrackingStatus("tracking");
          }
        },
        (err) => {
          console.error("Polling error:", err);
          enqueueSnackbar("Location fetch failed", { variant: "error" });
          setTrackingStatus("idle");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }
  };

  const updateTrackedPath = async (currentPos) => {
    if (!routePolyline || routePolyline.length === 0) {
      enqueueSnackbar("Route not ready", { variant: "error" });
      return;
    }
    const routeLine = lineString(routePolyline.map(([lat, lng]) => [lng, lat]));
    const userPoint = point([currentPos[1], currentPos[0]]);
    const snapped = nearestPointOnLine(routeLine, userPoint);

    if (!snapped || !snapped.geometry || !snapped.properties) {
      enqueueSnackbar("Unable to find nearest route point", {
        variant: "warning",
      });
      return;
    }

    const nearestLat = snapped.geometry.coordinates[1];
    const nearestLng = snapped.geometry.coordinates[0];
    const index = snapped.properties.index;
    if (!hasStartedTracking.current) {
      if (searchParams.get("trackid")) {
        hasStartedTracking.current = true;
        setTrackingButton(false);
      }
    } else {
      const response = await updateCurrPath(nearestLat, nearestLng, index);

      if (response.ok) {
        setLoc([nearestLat, nearestLng]);
        const covered = [
          ...routePolyline.slice(0, index + 1),
          [nearestLat, nearestLng],
        ];
        setTrackedPath(covered);
        const result = await response.json();
        setTd(result.t);
        setCd(result.r);
        setWalk(result.walkdone === false ? "active" : "Completed");
        if (result.isNearD === true && alertRef.current === false) {
          enqueueSnackbar("IN Danger Zone", { variant: "error" });
          const audio = new Audio("/dangeralert.mp3");
          audio.play();
          alertRef.current = true;
          setTimeout(() => {
            alertRef.current = false;
          }, 5000);
        }

        if (result.walkdone) {
          if (trackingIntervalRef.current) {
            navigator.geolocation.clearWatch(trackingIntervalRef.current);
            trackingIntervalRef.current = null;
          }
          enqueueSnackbar("Walk Completed", { variant: "success" });
          exitWalk();
        }
      } else {
        const result = await response.json();
        const ms = result.msg;
        enqueueSnackbar(ms, { variant: "error" });
      }
    }
  };

  const updateCurrPath = async (nearestLat, nearestLng, index) => {
    const payload = { nearestLat, nearestLng, index, userid: user.id };
    try {
      const response = await fetch(
        "https://safewalk-xbkj.onrender.com/api/updatePath",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          credentials: "include",
        }
      );
      return response;
    } catch (err) {
      console.log(err);
    }
  };
  const storeTrackedPath = async (nearestLat, nearestLng, index) => {
    const payload = { nearestLat, nearestLng, index };
    try {
      const response = await fetch(
        "https://safewalk-xbkj.onrender.com/upload/trackedPath",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          credentials: "include",
        }
      );
      return response;
    } catch (err) {
      console.log(err);
    }
  };

  const exitWalk = async () => {
    try {
      const response = await fetch(
        "https://safewalk-xbkj.onrender.com/api/exitWalk",
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        // if (showResumeModal) {
        //  setShowResumeModal(false);
        // }
        //if (resumeWalkId) {
        //  setActiveSessionId(null);
        //}
        {
          /*  setTrackedPath(null);
        setSourceLoc(null);
        setDesMarker(null);
        setSourceMarker(null);
        setDestLoc(null);
        setRoutePolyline(null);
        trackingIntervalRef.current = null;
        setTrackingStatus("idle");
        hasStartedTracking.current = false;
        setTrackingButton(true);

        navigate("/safe-walk", { replace: true });
        fetchMyLoc();
        setLoading(false);*/
        }
        window.location.href = "/safe-walk";
      } else {
        const ms = await response.json();
        enqueueSnackbar(ms.msg, { variant: "error" });
      }
    } catch (err) {
      enqueueSnackbar("Error occured", { variant: "error" });
    }
  };
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate("/");
    }
  }, [loading, isLoggedIn, navigate]);
  const showAltRoute = async () => {
    if (searchParams.get("trackid")) {
      enqueueSnackbar("Tracking already started", { variant: "warning" });
      return;
    }
    if (!routePolyline) {
      enqueueSnackbar("Route Not set yet", { variant: "warning" });
      return;
    }
    setIsLoadingAlt(true);
    setShowMapOverlay(true);
    try {
      const response = await fetch(
        "https://safewalk-xbkj.onrender.com/api/altRoute",
        {
          credentials: "include",
        }
      );
      const result = await response.json();
      if (response.ok) {
        const decoded = polyline.decode(result.nextr);
        const latlngs = decoded.map(([lat, lng]) => [lat, lng]);
        setRoutePolyline(latlngs);
        if (result.explored) {
          enqueueSnackbar("All path explored", { variant: "warning" });
        }
      } else {
        enqueueSnackbar(result.msg, { variant: "warning" });
      }
    } catch (err) {
      enqueueSnackbar("Error occured", { variant: "error" });
      console.log(err);
    } finally {
      setShowMapOverlay(false);
      setIsLoadingAlt(false);
    }
  };
  const showdangerzone = async () => {
    if (searchParams.get("trackid") || searchParams.get("walkid")) {
      setMode({ showD: false, showP: true, showAlt: false });
      try {
        const response = await fetch(
          "https://safewalk-xbkj.onrender.com/api/markzone",
          {
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();
          setDangerZones(data);
          setMode({ showD: false, showP: false, showAlt: true });
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      enqueueSnackbar("Start SafeWalk", { variant: "warning" });
      return;
    }
  };
  const sendlink = () => {
    const link = `https://safee-walk.vercel.app/trackscreen?trackid=${searchParams.get(
      "trackid"
    )}&user=${user.username}`;
    setLink(link);
    setShowModal(true);
  };
  useEffect(() => {
  if (showModal) {
    document.body.style.overflow = "hidden";  // ✅ Prevent scroll
  } else {
    document.body.style.overflow = "auto";    // ✅ Re-enable scroll
  }

  return () => {
    document.body.style.overflow = "auto";    // ✅ Cleanup on unmount
  };
}, [showModal]);
  if (loading) return <SplashScreen />;
  if (!isLoggedIn) return <Backgroundcover />;

  return (
    <>
      <NavBar />

      <div className="startButtonDiv">
        {showMapOverlay ? (
          <div className="spinner-container">
            <div className="spinner-circle loadd" />
          </div>
        ) : (
          <>
            {searchParams.get("walkid") ||
            resumeWalkId ||
            searchParams.get("trackid") ? (
              <div
                className="startButton exitButton"
                onClick={() => {
                  setShowMapOverlay(true);
                  exitWalk();
                }}
              >
                <RxExit style={{ fontSize: "20px", marginRight: "8px" }} />
                <p>Exit Walk</p>
              </div>
            ) : (
              <div
                className="startButton"
                disabled={startWalkButton}
                onClick={async () => {
                  setWalkButton(true);
                  if (resumeWalkId) {
                    setShowResumeModal(true);
                  } else {
                    const response = await isActiveSession();
                    if (response.ok) {
                      const result = await response.json();
                      setActiveSessionId(result.id);
                      setShowResumeModal(true);
                    } else {
                      setShowSafeWalkModal(true);
                    }
                  }
                }}
              >
                <FaWalking style={{ fontSize: "25px" }} />
                <p>Start safeWalk</p>
              </div>
            )}

            <div
              className="startButton buttontwo"
              onClick={() => navigate("/report-area")}
            >
              <TbMessageReport
                style={{ fontSize: "25px", marginRight: "3px" }}
              />
              <p>Report Area</p>
            </div>
          </>
        )}
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
            {showMapOverlay && (
              <div className="map-loading-overlay">
                <div className="map-loading-box">
                  <div className="spinner-container">
                    <div className="spinner-circle load" />
                  </div>
                  <p>Processing...</p>
                </div>
              </div>
            )}
            {showModal && (
              <ModalOverlay link={link} onClose={() => setShowModal(false)} />
            )}
            {searchParams.get("walkid") && (
              <button
                className={`alt-route ${isLoadingAlt ? "disabled-alt" : ""}`}
                disabled={isLoadingAlt}
                onClick={() => {
                  showAltRoute();
                }}
              >
                <MdAltRoute size={"25px"} color="white" />{" "}
                {isLoadingAlt ? "Loading..." : "Show Alternate Route"}
              </button>
            )}
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
              {dangerZones.map((zone, index) => (
                <Marker
                  key={index}
                  position={[parseFloat(zone.lat), parseFloat(zone.long)]}
                  icon={pulsingIcon}
                >
                  <Popup>Danger Zone</Popup>
                </Marker>
              ))}
            </MapContainer>
            {!loadingg && !showMapOverlay && (
              <div className="floating-buttons">
                {trackingStatus === "idle" && (
                  <button
                    className="floating-btn"
                    data-aos="fade-down"
                    data-aos-duration="500"
                    data-aos-easing="ease"
                    onClick={handleTracking}
                  >
                    <FaRoute size={"25px"} color="#ffffff" />
                    Start Tracking
                  </button>
                )}

                {trackingStatus === "processing" && (
                  <button className="floating-btn processing" disabled>
                    <div className="spinner-circle small" /> Processing...
                  </button>
                )}

                {trackingStatus === "tracking" && (
                  <button
                    data-aos="fade-down"
                    data-aos-duration="500"
                    data-aos-easing="ease"
                    className="floating-btn grp"
                    onClick={sendlink}
                  >
                    <FaUserGroup size={"20px"} /> Send to Group & Chats
                  </button>
                )}

                {mode && mode.showD && (
                  <button
                    data-aos="fade-down"
                    data-aos-duration="500"
                    data-aos-easing="ease"
                    className="floating-btn danger"
                    onClick={() => {
                      if (routePolyline) {
                        showdangerzone();
                      } else {
                        enqueueSnackbar("Route Not set yet", {
                          variant: "warning",
                        });
                        return;
                      }
                    }}
                  >
                    <GiDeathZone size={"25px"} color="red" /> Show Danger Zones
                  </button>
                )}
                {mode && mode.showP && (
                  <button className="floating-btn processing" disabled>
                    <div className="spinner-circle small" /> Processing...
                  </button>
                )}

                {mode && mode.showAlt && (
                  <button
                    className="floating-btn danger"
                    onClick={() => {
                      setDangerZones([]);
                      setMode({ showD: true, showP: false, showAlt: false });
                    }}
                  >
                    Stop Showing Danger Zone
                  </button>
                )}

                {/* <button
                    className="alt-route"
                    disabled={true}
                    onClick={() => {
                      setDangerZones([]);
                      setMode({ showD: true, showP: false, showAlt: false });
                    }}
                  >
                    <MdAltRoute size={"25px"} color="white" /> Show Alternate
                    Route
                  </button> */}
              </div>
            )}
          </Fragment>
        )}
      </div>
      {showResumeModal && (
        <div className="modal-overlay">
          <div className="resume-modal">
            <h2>Resume your last SafeWalk?</h2>
            <p>You had an active walk. Do you want to continue?</p>
            <div className="button-group">
              <button
                onClick={() => {
                  if (searchParams.get("walkid")) {
                    setWalkButton(false);
                    setShowResumeModal(false);
                    return;
                  }

                  navigate(`/safe-walk?walkid=${resumeWalkId}`);
                  setShowResumeModal(false);
                }}
              >
                Resume Walk
              </button>
              <button
                onClick={() => {
                  exitWalk();
                }}
              >
                Exit Walk
              </button>
            </div>
          </div>
        </div>
      )}

      {showSafeWalkModal && (
        <div className="modalOverlay">
          <div className="safeWalkModal">
            <button
              className="modalClose"
              disabled={loadingR}
              onClick={() => {
                setWalkButton(false);
                setShowSafeWalkModal(false);
              }}
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
                  setWalkButton(false);
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
      <WalkReport td={td} cd={cd} walk={walk} />
    </>
  );
};
