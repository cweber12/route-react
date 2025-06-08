import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Helper to fetch all locations (areas and routes) with coordinates from the MySQL database
async function fetchAllLocations() {
  // Use the existing endpoint that is available in your backend
  const API = import.meta.env.VITE_API_BASE_URL_P || import.meta.env.VITE_API_BASE_URL_M;
  const res = await fetch(`${API}/api/location-tree`); // changed from /api/all-areas-and-routes
  if (!res.ok) throw new Error("Failed to fetch locations");
  return await res.json();
}

function MapBoundsListener({ onBoundsChange }) {
  const map = useMap();
  useEffect(() => {
    function handleMove() {
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      const payload = {
        sw: bounds.getSouthWest(),
        ne: bounds.getNorthEast(),
        zoom,
      };
      // Log payload for debugging
      console.log("Sending to backend:", {
        swLat: payload.sw.lat,
        swLng: payload.sw.lng,
        neLat: payload.ne.lat,
        neLng: payload.ne.lng,
        zoom: payload.zoom,
      });
      onBoundsChange({
        swLat: payload.sw.lat,
        swLng: payload.sw.lng,
        neLat: payload.ne.lat,
        neLng: payload.ne.lng,
        zoom: payload.zoom,
      });
    }
    map.on("moveend", handleMove);
    // Initial fetch
    handleMove();
    return () => {
      map.off("moveend", handleMove);
    };
  }, [map, onBoundsChange]);
  return null;
}

function MapView({ coordinates = [], onPinClick, userLocationTree = [], userRouteNames = [] }) {
  const [pins, setPins] = useState([]);
  const [matchedPins, setMatchedPins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all locations (areas and routes) with coordinates from the database on mount
  useEffect(() => {
    let mounted = true;
    fetchAllLocations()
      .then((locs) => {
        if (mounted) setPins(locs);
      })
      .catch(() => setPins([]))
      .finally(() => setLoading(false));
    return () => { mounted = false; };
  }, []);

  // Fetch pins for the current bounds/zoom
  const fetchPins = async ({ swLat, swLng, neLat, neLng, zoom }) => {
    const API = import.meta.env.VITE_API_BASE_URL_P || import.meta.env.VITE_API_BASE_URL_M;
    // Backend endpoint must be implemented
    const url = `${API}api/locations-in-bounds?swLat=${swLat}&swLng=${swLng}&neLat=${neLat}&neLng=${neLng}&zoom=${zoom}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        setPins([]);
        return;
      }
      const data = await res.json();
      setPins(data);
    } catch (err) {
      setPins([]);
    }
  };

  // Match user routes to map pins using route names and user location tree
  useEffect(() => {
    if (!pins.length || !userRouteNames.length) {
      setMatchedPins([]);
      return;
    }
    // Match by route name (case-insensitive)
    const matched = pins.filter(loc =>
      userRouteNames.some(userRoute =>
        userRoute && loc.name && userRoute.toLowerCase() === loc.name.toLowerCase()
      )
    );
    setMatchedPins(matched);
  }, [pins, userRouteNames]); // Only depend on pins and userRouteNames

  // Only show pins for locations/routes with valid coordinates
  const validPins = pins.filter(loc =>
    loc.latitude != null && loc.longitude != null && !isNaN(loc.latitude) && !isNaN(loc.longitude)
  );

  const defaultCenter = [47.6062, -122.3321];

  return (
    <div className="page-container map-page">
      <MapContainer
        center={defaultCenter}
        zoom={5}
        scrollWheelZoom={true}
        style={{
          maxHeight: "70vh",
          maxWidth: "90vw",
          borderRadius: "4px",
          boxShadow: "0 4px 24px #000"
        }}
      >
        <TileLayer
          attribution="© MapTiler"
          url="https://api.maptiler.com/maps/outdoor/{z}/{x}/{y}.png?key=Xk05KTM1m55dkfebyheN"
          tileSize={512}
          zoomOffset={-1}
        />
        <MapBoundsListener onBoundsChange={fetchPins} />
        {/* All database locations (areas and routes) as pins */}
        {validPins.map(({ latitude, longitude, name, id, type }) => (
          <Marker
            key={id || name}
            position={[latitude, longitude]}
            eventHandlers={{
              click: () => onPinClick && onPinClick(name),
            }}
          >
            <Popup>
              <strong>{name}</strong> {type ? `(${type})` : null}
            </Popup>
          </Marker>
        ))}
        {/* Highlight user's matched routes (if any) */}
        {matchedPins.map(({ latitude, longitude, name, id }) => (
          <Marker
            key={"user-" + (id || name)}
            position={[latitude, longitude]}
            icon={new L.Icon({
              iconUrl: markerIcon2x,
              iconRetinaUrl: markerIcon2x,
              shadowUrl: markerShadow,
              iconSize: [32, 48],
              iconAnchor: [16, 48],
              popupAnchor: [0, -48],
              className: "user-route-marker"
            })}
            eventHandlers={{
              click: () => onPinClick && onPinClick(name),
            }}
          >
            <Popup>
              <strong>{name}</strong> (Your Route)
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapView;




