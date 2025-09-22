import React, { useEffect, useState } from "react";
import CompareImageProcessor from "../components/compare-features/CompareImageProcessor";
import "../App.css";
import SelectedRouteThumbnails from "../components/thumbnails/SelectedRoute";
import RecentRoutes from "../components/thumbnails/RecentRoutes";

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
  const userName = sessionStorage.getItem("userName");
  const bucketName = "route-keypoints";
  const API = import.meta.env.VITE_API_BASE_URL_M;

  // Helper to infer node type
  function inferNodeType(node) {
    return node.type || "area";
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
  }, [userName, API]);

  // Handler for selecting recent attempts from RecentRoutes
  const handleRecentRouteSelect = (attempts) => {
    setSelectedRecentAttempts(attempts);
    setShowCompareForRecent(attempts.length > 0);
    // Hide route selection UI when recent routes are selected
    if (attempts.length > 0) {
      setSelectionPath([]);
      setCheckedTimestamps([]);
      setSelectedRouteInfo(null);
      setTimestamps([]);
    }
  };

  // Render area navigator dropdown
  const renderAreaNavigator = () => {
    let nodes = treeData;
    let currentNode = null;


    for (let level = 0; level < selectionPath.length; level++) {
      const selected = selectionPath[level];

      currentNode = nodes.find((n) => n.name === selected);
      if (!currentNode) break;
      nodes = currentNode.children || [];
    }

    const currentName = currentNode ? currentNode.name : null;

    // If at a route node, only show the current route name
    if (currentNode && inferNodeType(currentNode) === "route") {
      return (
        <>
          {currentName && !selectedRouteInfo && (
            <span className="area-navigator-current">{currentName}</span>
          )}
        </>
      );
    }

    // Otherwise, render sub-areas/routes as a dropdown
    const options = (currentNode ? currentNode.children : treeData)
      ?.filter(node => node.name !== "location_tree.json")
      .map(node => {
        const nodeType = inferNodeType(node);
        return (
          <option
            key={node.name}
            value={node.name}
          >
            {nodeType === "route" ? "🧗 " : ""}
            {node.name}
          </option>
        );
      });

    return (
      <>

        <select
          className="area-navigator-dropdown"
          style={{ fontSize: 18, padding: "6px 12px"}}
          value=""
          onChange={async (e) => {
            const selectedName = e.target.value;
            const node = (currentNode ? currentNode.children : treeData).find(n => n.name === selectedName);
            if (!node) return;
            const nodeType = inferNodeType(node);
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
          <option value="" disabled>
            {selectionPath.length === 0 ? "All Areas" : `${currentName}`}
          </option>       
          {options}
        </select>
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
        <div className="page-header">
          <h1>SAVED ROUTES</h1>          
        </div>
        {selectionPath.length === 0 && userName === "Demo" && (
          <div className="instructions">
            <p>Use the dropdown to select an area, or enter a route name in the search bar.</p>
          </div>
        )}
        <div className="area-navigator-col">

            {treeData.length > 0 && (
              <>
              
                {renderAreaNavigator()}

                {/* Search Bar under Saved Climbs, with Previous Area button to the right */}
                <div 
                  className="search-container" 
                  style={{ width: selectedRouteInfo ? "100%" : undefined, maxWidth: "400px" }}
                >
                  <div
                    className="search-bar"
                    style={{ flex: 1 }}
                  >
                    <input
                      className="search-input"
                      type="text"
                      placeholder="Enter area or route name"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      style={{fontSize: 18}}
                    />
                    {showSuggestions && searchResults.length > 0 && (
                      <ul className="search-suggestions">
                        {searchResults.map((result, idx) => (
                          <li
                            key={result.name + '_' + idx}
                            className={`search-suggestion-item ${result.type}`}
                            onMouseDown={() => handleSuggestionClick(result)}
                          >
                            {result.name}
                            <span className="search-suggestion-type">{result.type}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  
                  </div>
                  
                </div>
              </>
            )}
                
            </div>
                {selectionPath.length > 0 && (
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
                    &#129128; {selectionPath.length === 1 ? "All Areas" : selectionPath[selectionPath.length - 2]}
                  </button>
                )}
            

            {showCompareForRecent && selectedRecentAttempts.length > 0 && (
              <>
              <div className="page-header">
                <h2>VIEW</h2>
              </div>
              <CompareImageProcessor selectedS3PathArray={selectedRecentAttempts} />
              </>
            )}

            {!selectedRouteInfo && (
              <>
                <RecentRoutes
                  onSelectAttempts={(attempts) => handleRecentRouteSelect(attempts)}
                  selectedAttempts={selectedRecentAttempts}
                  showCompare={showCompareForRecent}
                />
              </>
            )}




          {/* Show TimestampThumbnails for selected route */}
          {selectedRouteInfo && (timestamps.length > 0 || timestamps.length === 0) && (
            <>
            <div className="page-header">
              <h2>
                {selectedRouteInfo.name.toUpperCase()}
              </h2>
            </div>
              {checkedTimestamps.length > 0 && (
                <CompareImageProcessor selectedS3PathArray={checkedTimestamps} />
              )}
              <div style={{width: "100%"}}>
                <SelectedRouteThumbnails
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
              </div>
            </>
          )}
          
        </div>

    </>
  );
};

export default ViewRouteData;
