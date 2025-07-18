import React, { useState, useEffect } from "react";
import "../App.css";
import SelectLocationMap from "./SelectLocationMap.jsx"; // (unchanged)

const UploadToS3 = ({
  poseFilePath,
  siftFilePath,
  userName,
  autoRefFramePath,
}) => {
  // --- existing state ---
  const [treeData, setTreeData] = useState([]);
  const [selectionPath, setSelectionPath] = useState([]);
  const [routeName, setRouteName] = useState("");
  const [coordinates, setCoordinates] = useState({
    lat: 47.6062,
    lng: -122.3321,
  });
  const [processingStatus, setProcessingStatus] = useState("");
  const [uploadingS3, setUploadingS3] = useState(false);
  const [showUpload, setShowUpload] = useState(true);
  const [locationImage, setLocationImage] = useState(null);
  const [routeImage, setRouteImage] = useState(null);
  const [attemptImage, setAttemptImage] = useState(null);
  const [routeDescription, setRouteDescription] = useState("");
  const [locationImagePath, setLocationImagePath] = useState(null);
  const [routeImagePath, setRouteImagePath] = useState(null);
  const [attemptImagePath, setAttemptImagePath] = useState(null);

  const API = import.meta.env.VITE_API_BASE_URL_P;
  
  // --- load location tree from backend ---
  useEffect(() => {
    fetch(`${API}/api/location-tree`)
      .then((res) => (res.ok ? res.json() : Promise.reject("Failed to fetch tree")))
      .then((data) => setTreeData(data))
      .catch((err) => console.error(err));
  }, []);

  // --- auto‐load reference frame image if provided ---
  useEffect(() => {
    if (!autoRefFramePath) return;
    (async () => {
      try {
        const resp = await fetch(autoRefFramePath);
        const blob = await resp.blob();
        const file = new File([blob], autoRefFramePath.split("/").pop(), {
          type: blob.type,
        });
        setRouteImage(file);
        setRouteImagePath(URL.createObjectURL(blob));
      } catch (err) {
        console.error("Failed to load auto reference frame:", err);
      }
    })();
  }, [autoRefFramePath]);

  // --- flatten treeData for search suggestions ---
  const [flatList, setFlatList] = useState([]);
  useEffect(() => {
    const list = [];
    const dfs = (nodes, path = []) => {
      nodes.forEach((n) => {
        if (n.type === "location") {
          list.push({
            type: "location",
            name: n.name,
            path: [...path, n.name],
            latitude: n.latitude,
            longitude: n.longitude,
          });
          if (n.children) dfs(n.children, [...path, n.name]);
        } else if (n.type === "route") {
          list.push({
            type: "route",
            name: n.name,
            path,
            url: n.url,
            yds_rating: n.yds_rating,
          });
        }
      });
    };
    dfs(treeData);
    setFlatList(list);
  }, [treeData]);

  // --- search bar state ---
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  useEffect(() => {
    if (!searchQuery) {
      setSuggestions([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    setSuggestions(
      flatList.filter((item) => item.name.toLowerCase().includes(q)).slice(0, 10)
    );
  }, [searchQuery, flatList]);

  const handleSuggestionClick = (item) => {
    setSearchQuery("");
    setSuggestions([]);

    if (item.type === "location") {
      // drill into location
      setSelectionPath(item.path);
      if (item.latitude != null && item.longitude != null) {
        setCoordinates({ lat: item.latitude, lng: item.longitude });
      }
    } else {
      // route: set parent path, name, open URL
      setSelectionPath(item.path);
      setRouteName(item.name);
      
    }
  };

  const renderDropdowns = () => {
    let nodes = treeData;
    let parentName = null;
    let grandparentPath = [];
    for (let level = 0; level < selectionPath.length; level++) {
      const sel = selectionPath[level];
      const curr = nodes.find((n) => n.name === sel);
      if (!curr) break;
      grandparentPath = selectionPath.slice(0, level);
      parentName = sel;
      nodes = curr.children || [];
    }
    if (!nodes?.length) return null;

    const areaOptions = nodes.filter((n) => n.type !== "route");
    const routeOptions = nodes.filter((n) => n.type === "route");
    if (areaOptions.length === 0 && routeOptions.length > 0) return null;

    return (
      <div className="parent-container parent-container-row" 
      style={{ width: "100%", justifyContent: "flex-start", alignItems: "center", textAlign: "center" }}>
        
        {parentName && (
          <>
          <div style={{ display: "flex", flexDirection: "row"}}>
            {grandparentPath.length > 0 && (
              <span
                style={{ background: "rgba(120, 190, 255, 0.5)", color: "white", cursor: "pointer", padding: "8px 10px", borderRadius: 4, marginRight: 8}}
                onClick={() => setSelectionPath(grandparentPath)}
              >← Prev Area</span>
            )}
            <p style={{color: "white", margin: 0}}>{parentName}</p>
          </div>
          </>
        )}
        <select
          onChange={(e) => {
            const sel = e.target.value;
            if (!sel) return;
            const newPath = [...selectionPath, sel];
            setSelectionPath(newPath);
            const node = areaOptions.find((n) => n.name === sel);
            if (node?.latitude && node?.longitude) {
              setCoordinates({ lat: node.latitude, lng: node.longitude });
            }
          }}
          value=""
          style={{ padding: 8, width: "300px" }}
        >
          <option value="">Select an Area</option>
          {areaOptions.map((n) => (
            <option key={n.name} value={n.name}>
              {n.name}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderRoutes = () => {
    let nodes = treeData;
    for (let level = 0; level < selectionPath.length; level++) {
      const sel = selectionPath[level];
      const curr = nodes.find((n) => n.name === sel);
      if (!curr) return null;
      nodes = curr.children || [];
    }
    const routes = nodes.filter((n) => n.type === "route");
    if (!routes.length) return null;

    const parentName = selectionPath.slice(-1)[0];
    const grandparent = selectionPath.slice(0, -1);
    return (
      <div className="parent-container parent-container-row" style={{width: "100%", justifyContent: "flex-start" }}>
        {parentName && (
          <>
            {grandparent.length > 0 && (
              <span
                style={{ background: "#e9ffa7ff", color: "black", cursor: "pointer", padding: "8px 10px", borderRadius: 4, marginRight: 8}}
                onClick={() => setSelectionPath(grandparent)}
              >← Prev Area</span>
            )}
            <p style={{color: "white", margin: 0}}>{parentName}</p>
          </>
        )}
        <select
          onChange={(e) => {
            const route = routes.find((r) => r.url === e.target.value);
            if (route) {
              setRouteName(route.name);
              window.open(route.url, "_blank");
            }
          }}
          style={{ padding: 8, width: "250px"}}
        >
          <option value="">-- Select Route --</option>
          {routes.map((r) => (
            <option key={r.id} value={r.url}>
              {r.name} ({r.yds_rating})
            </option>
          ))}
        </select>
      </div>
    );
  };

  // --- handle actual S3 upload (unchanged) ---
  const handleUploadToS3 = async () => {
    const fullPath = selectionPath.join("/");
    const fd = new FormData();
    fd.append("pose_file_path", poseFilePath);
    fd.append("sift_file_path", siftFilePath);
    fd.append("user_name", userName);
    fd.append("location", fullPath);
    fd.append("route_name", routeName);
    if (coordinates.lat && coordinates.lng) fd.append("coordinates", JSON.stringify(coordinates));
    if (locationImage) fd.append("location_image", locationImage);
    if (routeImage) fd.append("route_image", routeImage);
    if (attemptImage) fd.append("attempt_image", attemptImage);
    if (routeDescription) fd.append("route_description", routeDescription);

    if (!poseFilePath || !siftFilePath) {
      setProcessingStatus("No data to upload. Please process video first.");
      return;
    }
    if (!fullPath || !routeName) {
      setProcessingStatus("Please select location and enter a route name.");
      return;
    }

    try {
      setProcessingStatus("Uploading...");
      setUploadingS3(true);
      const res = await fetch(`${API}/api/upload-json`, {
        method: "POST",
        body: fd,
      });
      const result = await res.json();
      if (res.ok) {
        setProcessingStatus("Upload Complete");
        setShowUpload(false);
      } else {
        setProcessingStatus(`Upload failed: ${result.detail}`);
      }
    } catch (err) {
      console.error(err);
      setProcessingStatus("Upload failed.");
    } finally {
      setUploadingS3(false);
    }
  };

  return (
    <>
          {/* Show route name under search bar if selected */}
      {routeName && (
        <div style={{margin: '12px 0 0 0', color: 'white', fontWeight: 600, fontSize: 20, textAlign: 'left'}}>
          Selected Route: {routeName}
        </div>
      )}
      {/* --- SEARCH BAR (fixed top left) & SAVE BUTTON (right of search bar) --- */}
      <div className="search-container" >
        <div className="search-bar" >
          <input
            type="text"
            placeholder="Search area or route…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              height: "100%", 
              padding: "8px",
              boxSizing: "border-box",
              border: "1px solid #bbb",
              borderRadius: "4px",
            }}
          />
          {suggestions.length > 0 && (
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "4px 0",
                maxHeight: 200,
                overflowY: "auto",
                background: "#fff",
                position: "absolute",
                left: 0,
                right: 0,
                zIndex: 10,
                border: "1px solid #ccc",
              }}
            >
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  onClick={() => handleSuggestionClick(s)}
                  style={{
                    padding: "6px 8px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                    color: s.type === "route" ? "#007bff" : "#000",
                    background: "#fff",
                  }}
                >
                  {s.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        {showUpload && (
          <button
            onClick={handleUploadToS3}
            disabled={uploadingS3 || !selectionPath.length || !routeName}
            style={{
              marginLeft: 10,
              height: 40,
              width: "30%",
              backgroundColor:
                uploadingS3 || !selectionPath.length || !routeName
                  ? "darkslategray"
                  : "#007bff",
              color: "#fff",
              padding: "0 18px",
              border: "none",
              borderRadius: 4,
              cursor:
                uploadingS3 || !selectionPath.length || !routeName
                  ? "not-allowed"
                  : "pointer",
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            {uploadingS3 ? "Saving..." : "Save"}
          </button>
        )}
         {/* --- STATUS --- */}
      {processingStatus && !uploadingS3 && (
        <p style={{ 
          color: "#c6ff1d", 
          fontFamily: "Courier New, monospace",
          padding: 4, 
          fontSize: "18px",
          alignSelf: "center"
        }}>{processingStatus}</p>
      )}
      </div>


      {/* --- AREA/ROUTE DROPDOWNS & ROUTE NAME INPUT (row above map) --- */}

 
        {renderDropdowns()}

        {renderRoutes()}

        <input
          type="text"
          placeholder="Route Name"
          value={routeName}
          onChange={(e) => setRouteName(e.target.value)}
          required
          style={{
            display: "none", // Hide the input
            minWidth: 180,
            padding: "8px",
            boxSizing: "border-box",
            border: "1px solid #888",
            borderRadius: 4,
            height: 35,
            fontSize: 16,

          }}
        />


      {/* --- MAP/CHILDREN (unchanged) --- */}
      
    </>
  );
};

export default UploadToS3;
