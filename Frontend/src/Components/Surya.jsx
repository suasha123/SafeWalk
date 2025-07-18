import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

export const Surya = () => {
  const [pos, setLoc] = useState(null);

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

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <MapContainer
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
      </MapContainer>
    </div>
  );
};
