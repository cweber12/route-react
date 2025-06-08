import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const LocationMarker = ({ setCoordinates, setSearch }) => {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);
      setCoordinates({ lat, lng });

      // Reverse geocode
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
        );
        const data = await res.json();
        if (data.display_name) {
          setSearch(data.display_name);
        }
      } catch (err) {
        console.error("Reverse geocoding failed", err);
      }
    },
  });

  return position ? <Marker position={position} /> : null;
};

const RecenterMap = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords.lat && coords.lng) {
      map.setView([coords.lat, coords.lng], 12);
    }
  }, [coords]);
  return null;
};

const SelectLocationMap = ({ coordinates, setCoordinates }) => {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = async (query) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    setSuggestions(data);
  };

  const handleSelect = (place) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    setCoordinates({ lat, lng });
    setSearch(place.display_name);
    setSuggestions([]);
  };

  useEffect(() => {
    if (search.length > 2) {
      fetchSuggestions(search);
    } else {
      setSuggestions([]);
    }
  }, [search]);

  const defaultCenter =
    coordinates?.lat && coordinates?.lng
      ? [coordinates.lat, coordinates.lng]
      : [47.6062, -122.3321];

  return (
    

    <div className="map-container">
      
    <MapContainer
      center={defaultCenter}
      zoom={5}
      scrollWheelZoom={true}
      style={{ height: "400px", width: "100%" }} 
    >
      <TileLayer
        attribution='© MapTiler'
        url="https://api.maptiler.com/maps/outdoor/{z}/{x}/{y}.png?key=Xk05KTM1m55dkfebyheN"
        tileSize={512}
        zoomOffset={-1}
      />
      <LocationMarker setCoordinates={setCoordinates} setSearch={setSearch} />
      <RecenterMap coords={coordinates} />
    </MapContainer>
  </div>




  );
};

export default SelectLocationMap;
