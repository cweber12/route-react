import React, { useEffect, useState } from "react";
import CompareImageProcessor from "../components/CompareImageProcessor";
import "../App.css";
import TimestampThumbnails from "../components/TimestampThumbnails";
import RecentRoutes from "../components/RecentRoutes";

const ViewRouteData = () => {
  const [treeData, setTreeData] = useState([]);
  const [selectionPath, setSelectionPath] = useState([]);
  const [timestamps, setTimestamps] = useState([]);
  const [checkedTimestamps, setCheckedTimestamps] = useState([]);
  const [selectedRouteInfo, setSelectedRouteInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedRecentAttempts, setSelectedRecentAttempts] = useState([]); // For recent routes selection
  const [showCompareForRecent, setShowCompareForRecent] = useState(false);
  const [areaRoutes, setAreaRoutes] = useState([]); // Add this state

  const userName = sessionStorage.getItem("userName");
  const bucketName = "route-keypoints";
  const API = import.meta.env.VITE_API_BASE_URL_M;

  // Helper to infer node type
  function inferNodeType(node) {
    return node.type || "area";
  }

  // Add this inside your ViewRouteData component
  function flattenNodesWithCoordinates(nodes) {
    let result = [];
    for (const node of nodes) {
      if (
        node.latitude !== null &&
        node.longitude !== null &&
        node.latitude !== undefined &&
        node.longitude !== undefined
      ) {
        result.push(node);
      }
      if (node.children && node.children.length > 0) {
        result = result.concat(flattenNodesWithCoordinates(node.children));
      }
    }
    return result;
  }

  // Helper to flatten tree into [{name, path, type}]
  function flattenTreeForSearch(nodes, parentPath = []) {
    let result = [];
    for (const node of nodes) {
      const nodePath = [...parentPath, node.name];
      result.push({
        name: node.name,
        path: nodePath,
        type: inferNodeType(node),
      });
      if (node.children && node.children.length > 0) {
        result = result.concat(flattenTreeForSearch(node.children, nodePath));
      }
    }
    return result;
  }

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const res = await fetch(
          `${API}/api/s3-location-tree?bucket=${bucketName}&user=${userName}`
        );
        const data = await res.json();
        setTreeData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching tree from S3:", err);
        setTreeData([]);
      }
    };

    if (userName) {
      fetchTree();
    }
  }, [userName]);

  // Handler for selecting recent attempts from RecentRoutes
  const handleRecentRouteSelect = (attempts) => {
    setSelectedRecentAttempts(attempts);
    setShowCompareForRecent(true);
    // Hide route selection UI
    setSelectionPath([]);
    setCheckedTimestamps([]);
    setSelectedRouteInfo(null);
    setTimestamps([]);
  };

  // Handler for clearing recent route selection (e.g., after compare or reset)
  const handleClearRecentCompare = () => {
    setSelectedRecentAttempts([]);
    setShowCompareForRecent(false);
  };

  // Handler for selecting a route from area navigator or search
  const handleSelectPath = async (s3Path) => {
    setShowCompareForRecent(false);
    setSelectedRecentAttempts([]);
    const pathParts = s3Path.replace(/\/$/, "").split("/").filter(Boolean);
    setSelectionPath(pathParts);
    let node = null;
    let children = [...treeData];
    for (const part of pathParts) {
      node = children.find((n) => n.name === part);
      if (!node) break;
      children = node.children || [];
    }
    if (node && inferNodeType(node) === "route") {
      const cleanPath = node.path || [userName, ...pathParts.map(s => s.trim())].join("/");
      setCheckedTimestamps([]);
      setSelectedRouteInfo({
        name: node.name,
        basePath: cleanPath,
      });
      const ts = await fetchTimestampsForRoute(cleanPath);
      setTimestamps(ts);
      setAreaRoutes([]); // Clear area routes when a route is selected
    } else {
      // If an area is selected, fetch all routes under this area from the backend
      try {
        const areaPath = pathParts.slice(1).join("/"); // remove userName from path
        const res = await fetch(`${API}/api/routes-under-area?user=${userName}&area_path=${encodeURIComponent(areaPath)}`);
        if (res.ok) {
          const routes = await res.json();
          setAreaRoutes(routes); // Set area routes for display
        } else {
          setAreaRoutes([]);
        }
      } catch (err) {
        console.error("Error fetching routes under area:", err);
        setAreaRoutes([]);
      }
      setCheckedTimestamps([]);
      setSelectedRouteInfo(null);
      setTimestamps([]);
    }
  };

  const renderAreaNavigator = () => {
    let nodes = treeData;
    let currentNode = null;
    let parentNode = null;

    for (let level = 0; level < selectionPath.length; level++) {
      const selected = selectionPath[level];
      parentNode = currentNode;
      currentNode = nodes.find((n) => n.name === selected);
      if (!currentNode) break;
      nodes = currentNode.children || [];
    }

    const parentName = parentNode ? parentNode.name.toUpperCase() : "ALL AREAS";
    const currentName = currentNode ? currentNode.name : null;

    // If at a route node, only show the current route name
    if (currentNode && inferNodeType(currentNode) === "route") {
      return (
        <>
          {currentName && (
            <span className="area-navigator-current">{currentName}</span>
          )}
        </>
      );
    }

    // Otherwise, render sub-areas/routes
    return (
      <>
        {selectionPath.length === 0 && (
          <h3
          style={{
            margin: "-20px -20px 10px -20px", 
            padding: "10px 20px", 
            color: "rgb(228, 255, 146)",
            backgroundColor: "linear-gradient (180deg, rgba(48, 6, 6, 0.6), rgba(0,0,0,0)",
            textDecoration: "underline",
            fontWeight: "520",
          
          }}
          
          >ALL AREAS</h3>
        )}
        
        {currentName && (
          <h3
          style={{
            margin: "-20px -20px 10px -20px", 
            padding: "10px 20px", 
            color: "rgb(228, 255, 146)",
            backgroundColor: "linear-gradient (180deg, rgba(48, 6, 6, 0.6), rgba(0,0,0,0)",
            textDecoration: "underline",
            fontWeight: "520",
          
          }}
          
          >{currentName.toUpperCase()}</h3>
        )}

        {(currentNode ? currentNode.children : treeData)?.map((node) => {
          const nodeType = inferNodeType(node);
          return (
            <>
              <span
             
                className={`area-navigator-item${nodeType === "route" ? " area-navigator-route" : ""}`}
                onClick={async () => {
                  const newPath = [...selectionPath, node.name];
                  const cleanPath = [userName, ...newPath].join("/");
                  setSelectionPath(newPath);

                  if (nodeType === "route") {
                    setCheckedTimestamps([]);
                    setSelectedRouteInfo({
                      name: node.name,
                      basePath: cleanPath,
                    });
                    const ts = await fetchTimestampsForRoute(cleanPath);
                    setTimestamps(ts);
                  } else {
                    setCheckedTimestamps([]);
                    setSelectedRouteInfo(null);
                    setTimestamps([]);
                  }
                }}
              >
              {nodeType === "route" && (
                <img 
                  src="public\assets\route_icon.jpg"
                  alt="Route Icon"
                  className="area-navigator-route-icon"
                />
              )}
                {node.name}
              </span>
            </>
          );
        })}
      </>
    );
  };

  async function fetchTimestampsForRoute(basePath) {
    const res = await fetch(
      `${API}/api/list-timestamps?bucket=${bucketName}&prefix=${encodeURIComponent(basePath)}`
    );
    if (!res.ok) return [];
    return await res.json();
  }

  // Search handler
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }
    const allNodes = flattenTreeForSearch(treeData);
    const q = searchQuery.toLowerCase();
    const matches = allNodes.filter(
      n => n.name.toLowerCase().includes(q)
    );
    setSearchResults(matches.slice(0, 10)); // limit to 10 suggestions
    setShowSuggestions(true);
  }, [searchQuery, treeData]);

  // When a suggestion is clicked
  const handleSuggestionClick = async (node) => {
    setSearchQuery("");
    setShowSuggestions(false);
    setShowCompareForRecent(false);
    setSelectedRecentAttempts([]);
    setSelectionPath(node.path);
    let currentNode = null;
    let children = [...treeData];
    for (const part of node.path) {
      currentNode = children.find((n) => n.name === part);
      if (!currentNode) break;
      children = currentNode.children || [];
    }
    if (currentNode && inferNodeType(currentNode) === "route") {
      const cleanPath = currentNode.path || [userName, ...node.path.map(s => s.trim())].join("/");
      setCheckedTimestamps([]);
      setSelectedRouteInfo({
        name: currentNode.name,
        basePath: cleanPath,
      });
      const ts = await fetchTimestampsForRoute(cleanPath);
      setTimestamps(ts);
    } else {
      setCheckedTimestamps([]);
      setSelectedRouteInfo(null);
      setTimestamps([]);
    }
  };

  return (
    <>
      <div 
      className="page-container" 
      >

          {/* Search Bar and Previous Area Button */}
          <div className="search-container">
            {/* Search Bar */}
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search area or route..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="search-input"
                onFocus={() => searchQuery && setShowSuggestions(true)}
                disabled={showCompareForRecent}
              />
              {showSuggestions && searchResults.length > 0 && !showCompareForRecent && (
                <ul className="search-suggestions">
                  {searchResults.map((node, idx) => (
                    <li
                      key={idx}
                      className={`search-suggestion-item ${node.type}`}
                      onMouseDown={() => handleSuggestionClick(node)}
                    >
                      {node.name} <span className="search-suggestion-type">({node.type})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Previous Area Button or Placeholder */}
            {selectionPath.length > 0 && !showCompareForRecent ? (
              <button
                className="prev-area-button"
                onClick={() => {
                  if (selectionPath.length === 1) {
                    setSelectionPath([]);
                    setCheckedTimestamps([]);
                    setSelectedRouteInfo(null);
                    setTimestamps([]);
                  } else {
                    setSelectionPath(selectionPath.slice(0, -1));
                    setCheckedTimestamps([]);
                    setSelectedRouteInfo(null);
                    setTimestamps([]);
                  }
                }}
              >
                ← {selectionPath.length === 1 ? "All Areas" : selectionPath[selectionPath.length - 2]}
              </button>
            ) : (
              <div style={{ width: "100%" }} />
            )}
          </div>

          {/* Main Content Logic */}
          {/* Show CompareImageProcessor for recent routes if selected */}
          {showCompareForRecent && selectedRecentAttempts.length > 0 ? (
            <CompareImageProcessor selectedS3PathArray={selectedRecentAttempts} />
          ) : selectedRouteInfo && timestamps.length > 0 ? (
            // Show TimestampThumbnails for selected route
            <>
              <h2 
              style={{
                margin: 0, 
                padding: "10px 20px ", 
                color: "rgb(243, 255, 207)",
                width: "100%",
                boxSizing: "border-box",
                borderRadius: "4px 4px 0 0 ", 
                backgroundColor: "rgba(0, 0, 0, 0.4)",

              
              }}
                >
                {selectedRouteInfo.name.toUpperCase()}
              </h2>
            
              <CompareImageProcessor selectedS3PathArray={checkedTimestamps} />
      
              <TimestampThumbnails
                basePath={selectedRouteInfo.basePath}
                timestamps={timestamps}
                bucketName="route-keypoints"
                checkedTimestamps={checkedTimestamps}
                onToggle={(folderUri) => {
                  setCheckedTimestamps(prev =>
                    prev.includes(folderUri)
                      ? prev.filter(p => p !== folderUri)
                      : [...prev, folderUri]
                  );
                }}
              />
              
            </>
          ) : areaRoutes.length > 0 ? (
            // Show all route thumbnails under the selected area
            <div className="area-routes-list">
              <h3 style={{color: "rgb(228, 255, 146)", margin: "10px 0"}}>Routes in this Area:</h3>
              <div style={{display: "flex", flexWrap: "wrap", gap: 16}}>
                {areaRoutes.map((route, idx) => (
                  <div key={route.name + (route.route_id || '') + '_' + idx} style={{minWidth: 220, maxWidth: 240}}>
                    <h4 style={{color: "#e4ff92", margin: "0 0 8px 0"}}>{route.name}</h4>
                    <TimestampThumbnails
                      basePath={[userName, ...(selectionPath), route.name].join("/")}
                      timestamps={route.timestamps || []}
                      bucketName="route-keypoints"
                      checkedTimestamps={checkedTimestamps}
                      onToggle={folderUri => {
                        setCheckedTimestamps(prev =>
                          prev.includes(folderUri)
                            ? prev.filter(p => p !== folderUri)
                            : [...prev, folderUri]
                        );
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Show Area Navigator/Map and RecentRoutes on initial load
            <>

                <div className="area-navigator-overlay">
                  {treeData.length > 0 && renderAreaNavigator()}
                </div>
    
              <RecentRoutes
                onSelectAttempts={(attempts) => handleRecentRouteSelect(attempts)}
                selectedAttempts={selectedRecentAttempts}
                showCompare={showCompareForRecent}
              />
         
            </>
          )}
          
        </div>

    </>
  );
};

export default ViewRouteData;
