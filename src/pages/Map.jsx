import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../App.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ROUTE ICON
const routeIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="8" fill="#2bff00ff" stroke="#130033ff" stroke-width="2"/>
    </svg>
  `),
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
  shadowSize: [0, 0]
});

// USER LOCATION ICON
const userLocationIcon = new L.Icon({
  iconUrl: '/assets/location_icon.png',
  iconSize: [70, 70],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
  shadowSize: [0, 0]
});

// AREA ICON (currently not used) 
const areaIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="8" fill="#FF4444" stroke="#CC0000" stroke-width="2"/>
    </svg>
  `),
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
  shadowSize: [0, 0]
});

const Map = () => {
  const [mapCenter, setMapCenter] = useState([39.7392, -104.9903]); // Default to Denver, CO
  const [mapZoom, setMapZoom] = useState(5);
  const [mapData, setMapData] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [showLegend, setShowLegend] = useState(false);

  const userName = sessionStorage.getItem("userName");
  const API = import.meta.env.VITE_API_BASE_URL_M;
  const TILE_API = import.meta.env.MAP_TILE_API;

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
          {showLegend ? 'HIDE' : 'SHOW'} LEGEND
        </button>

        {/* Legend dropdown */}
        {showLegend && (
          <div className="map-legend-dropdown">
            <h3 className="">MAP LEGEND</h3>
            <div className="map-legend-item">
              <img 
                src="/assets/location_icon.png" 
                alt="Location icon" 
                style={{ width: '20px', height: '20px' }}
              />
              <span>Your current location</span>
            </div>
            <div className="map-legend-item">
              <div 
                className="map-legend-icon" 
                style={{ backgroundColor: '#c8ff24ff', border: '3px solid #1c0040ff' }}
              ></div>
              <span>Climbing routes</span>
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
            url={`https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png`}
          />

          {/* User's current location */}
          {userLocation && (
            <Marker position={userLocation} icon={userLocationIcon}>
              <Popup>
                <div>
                  <strong>Your Location</strong>
                  <br />
                  Current position
                </div>
              </Popup>
            </Marker>
          )}

          {/* Map data from backend*/}
          {mapData.length > 0 ? (
            mapData.map((item, index) => {
              // console.log("Processing map item:", item);
              
              if (item.rating === null || item.rating === undefined) {
                console.log("Skipping area:", item.name);
                return null;
              }
              
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
              
              // Validate coordinate ranges
              if (lat === undefined || lng === undefined || 
                  lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                console.log("Skipping route with invalid coordinates:", {
                  name: item.name,
                  lat: item.lat,
                  lng: item.lng,
                  validLat: lat,
                  validLng: lng,
                  allProperties: Object.keys(item)
                });
                return null;
              }
              
              console.log(`Valid coordinates found for route ${item.name}: lat=${lat}, lng=${lng}`);
              
              return (
                <Marker
                  key={`route-${item.id || index}`}
                  position={[lat, lng]}
                  icon={routeIcon}
                >
                  <Popup>
                    <div>
                      <strong style={{ color: '#2c5aa0' }}>{item.name}</strong>
                      <br />
                      {item.rating && (
                        <span style={{ color: '#007bff', fontWeight: '600' }}>
                          Grade: {item.rating}
                        </span>
                      )}
                      <br />
                      <small style={{ color: '#666' }}>Climbing Route</small>
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
