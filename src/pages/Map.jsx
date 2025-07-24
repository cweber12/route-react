import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../App.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom climbing route icon
const routeIcon = new L.Icon({
  iconUrl: '/assets/route_icon.jpg',
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom area icon (for states and sub-locations)
const areaIcon = new L.Icon({
  iconUrl: '/assets/map_pin.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const Map = () => {
  const [mapCenter, setMapCenter] = useState([39.7392, -104.9903]); // Default to Denver, CO
  const [mapZoom, setMapZoom] = useState(10);
  const [mapData, setMapData] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [showLegend, setShowLegend] = useState(false);

  const userName = sessionStorage.getItem("userName");
  const API = import.meta.env.VITE_API_BASE_URL_M;

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          setMapZoom(12);
        },
        (error) => {
          console.log("Error getting location:", error);
          // Fallback to popular climbing areas
          setMapCenter([39.7392, -104.9903]); // Denver area
        }
      );
    }
  }, []);

  // Fetch map data from the backend
  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const res = await fetch(`${API}/api/map-data`);
        if (res.ok) {
          const data = await res.json();
          console.log("Backend response:", data);
          
          // Handle different response formats
          if (data.features) {
            // Expected format with features array
            setMapData(data.features);
          } else if (data.message) {
            // Debug format - log the schema info
            console.log("Backend is in debug mode");
            console.log("Available tables:", data.tables);
            console.log("State columns:", data.state_columns);
            setMapData([]); // No map data available yet
          } else if (Array.isArray(data)) {
            // Direct array format
            setMapData(data);
          } else {
            console.log("Unexpected response format:", data);
            setMapData([]);
          }
        } else {
          console.error("Failed to fetch map data:", res.status, res.statusText);
        }
      } catch (err) {
        console.error("Error fetching map data:", err);
      }
    };

    fetchMapData();
  }, [API]);

  return (
    <div className="page-container map-page">
      
      <div className="map-container">
        {/* Legend toggle button */}
        <button 
          className="map-legend-toggle"
          onClick={() => setShowLegend(!showLegend)}
        >
          Legend {showLegend ? '▼' : '▶'}
        </button>

        {/* Legend dropdown */}
        {showLegend && (
          <div className="map-legend-dropdown">
            <h3>Map Legend</h3>
            <div className="map-legend-item">
              <div 
                className="map-legend-icon" 
                style={{ backgroundColor: '#007bff' }}
              ></div>
              <span>Your current location</span>
            </div>
            <div className="map-legend-item">
              <img 
                src="/assets/route_icon.jpg" 
                alt="Route icon" 
                style={{ width: '20px', height: '20px' }}
              />
              <span>Climbing routes</span>
            </div>
            <div className="map-legend-item">
              <img 
                src="/assets/map_pin.png" 
                alt="Area icon" 
                style={{ width: '20px', height: '20px' }}
              />
              <span>Climbing areas & locations</span>
            </div>
          </div>
        )}

        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          className="leaflet-container"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User's current location */}
          {userLocation && (
            <Marker position={userLocation}>
              <Popup>
                <div>
                  <strong>Your Location</strong>
                  <br />
                  Current position
                </div>
              </Popup>
            </Marker>
          )}

          {/* Map data from backend - areas and routes */}
          {mapData.length > 0 ? (
            mapData.map((item, index) => {
              console.log("Rendering map item:", item);
              
              // Check for coordinates in different possible property names
              let lat, lng;
              
              // Handle different coordinate property formats
              if (item.lat !== null && item.lng !== null && 
                  typeof item.lat === 'number' && typeof item.lng === 'number' &&
                  !isNaN(item.lat) && !isNaN(item.lng)) {
                lat = item.lat;
                lng = item.lng;
              } else if (item.latitude !== null && item.longitude !== null && 
                         typeof item.latitude === 'number' && typeof item.longitude === 'number' &&
                         !isNaN(item.latitude) && !isNaN(item.longitude)) {
                lat = item.latitude;
                lng = item.longitude;
              } else if (item.coordinates) {
                // Handle coordinate objects or arrays
                if (Array.isArray(item.coordinates) && item.coordinates.length >= 2) {
                  const [coordLat, coordLng] = item.coordinates;
                  if (typeof coordLat === 'number' && typeof coordLng === 'number' &&
                      !isNaN(coordLat) && !isNaN(coordLng)) {
                    lat = coordLat;
                    lng = coordLng;
                  }
                } else if (item.coordinates.lat && item.coordinates.lng &&
                          typeof item.coordinates.lat === 'number' && typeof item.coordinates.lng === 'number' &&
                          !isNaN(item.coordinates.lat) && !isNaN(item.coordinates.lng)) {
                  lat = item.coordinates.lat;
                  lng = item.coordinates.lng;
                }
              }
              
              // Validate coordinate ranges (lat: -90 to 90, lng: -180 to 180)
              if (lat === undefined || lng === undefined || 
                  lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                console.log("Skipping item with invalid coordinates:", {
                  name: item.name,
                  lat: item.lat,
                  lng: item.lng,
                  validLat: lat,
                  validLng: lng,
                  allProperties: Object.keys(item)
                });
                return null;
              }
              
              console.log(`Valid coordinates found for ${item.name}: lat=${lat}, lng=${lng}`);
              
              // Determine if this is a route (has rating) or an area
              const isRoute = item.rating !== null && item.rating !== undefined;
              const icon = isRoute ? routeIcon : areaIcon;
              
              return (
                <Marker
                  key={`map-item-${index}`}
                  position={[lat, lng]}
                  icon={icon}
                >
                  <Popup>
                    <div>
                      <strong>{item.name}</strong>
                      <br />
                      {item.rating && <span>Rating: {item.rating}<br /></span>}
                      {item.type && <span>Type: {item.type}<br /></span>}
                      <small>{isRoute ? 'Climbing Route' : 'Climbing Area'}</small>
                    </div>
                  </Popup>
                </Marker>
              );
            })
          ) : (
            // Show a message when no data is available
            console.log("No map data available, mapData:", mapData)
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default Map;
