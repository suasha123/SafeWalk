import { useMap } from "react-leaflet";
import { useEffect } from "react";
export const FlyToLocation = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 13, {
        duration: 1.5,
      });
    }
  }, [position, map]);

  return null;
};