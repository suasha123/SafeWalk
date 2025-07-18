import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
export const Surya = () => {
  const [pos, setLoc] = useState(null);
  const [loading , setLoading] = useState(true);
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (pos) {
          const { latitude, longitude } = pos.coords;
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
  }, []);
  useEffect(()=>{
    if(pos){
        setLoading(false);
    }
  },[pos])

  return (
    <div style={{ height: "500px", width: "100%" }}>
    {loading?"Loading Map": (<MapContainer
        center={pos != null ? pos : [51.505, -0.09]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={pos != null ? pos : [51.505, -0.09]}>
          <Popup>You are here!</Popup>
        </Marker>
      </MapContainer>)}
    </div>
  );
};
