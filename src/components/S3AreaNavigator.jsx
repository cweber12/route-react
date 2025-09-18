import React from "react";

/**
 * Stateless area/route navigator.
 * Props:
 * - nodesTree: full S3 tree array (locations & routes); each node.path includes the user prefix
 * - selectionPath: array of selected names (relative, no user prefix)
 * - handleSelectPath: callback(prefix: string) -> void; prefix is a relative S3 path (no user prefix)
 */
export default function S3AreaNavigator({
  nodesTree = [],
  selectionPath = [],
  handleSelectPath,
}) {
  const locationIcon = "/assets/map_pin.png";
  const climberIcon  = "/assets/route_icon.jpg";

  // Top‐level entries: location or route
  let nodes = nodesTree.filter((n) => n.type === "location" || n.type === "route");
  let parentName = null;
  let grandparentPath = [];

  // Drill down to current selection level
  for (let i = 0; i < selectionPath.length; i++) {
    const seg = selectionPath[i];
    const found = nodes.find((n) => n.name === seg);
    if (!found) break;
    grandparentPath = selectionPath.slice(0, i);
    parentName = seg;
    // children are unfiltered from full tree, so find the matching node in original nodesTree by path
    const original = nodesTree.find((x) => x.name === seg && x.children);
    nodes = (original?.children || []).filter((c) => c.type === "location" || c.type === "route");
    if (found.type === "route") break;
  }

  if (!nodes || nodes.length === 0) return null;

  // Are we at a timestamp folder level? then stop listing
  const allTimestamps = nodes.every((n) => n.type === "timestamp");

  return (
    <div style={{ margin: "16px 0" }}>
      <div style={{ marginBottom: 8 }}>
        {selectionPath.length > 0 && (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              const parentPrefix = grandparentPath.join("/");
              handleSelectPath(parentPrefix);
            }}
            style={{ color: "#c6ff1d", textDecoration: "none", marginRight: 12 }}
          >
            ← Back
          </a>
        )}
        <strong>{parentName || "All Locations"}</strong>
      </div>

      {!allTimestamps && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {nodes.map((n) => {
            const parts = n.path.split("/");
            const rel = parts.slice(1).join("/");
            return (
              <li key={n.path} style={{ margin: "6px 0" }}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelectPath(rel);
                  }}
                  style={{
                    textDecoration: "none",
                    fontWeight: "550",
                    display: "flex",
                    alignItems: "center",
                    color: n.type === "route" ? "#f57c00" : "#c6ff1d",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={n.type === "route" ? climberIcon : locationIcon}
                    alt={n.type}
                    style={{ width: 20, height: 20, marginRight: 8 }}
                  />
                  <span>
                    {n.name}
                    {n.yds_rating ? ` (${n.yds_rating})` : ""}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}

    </div>
  );
}

