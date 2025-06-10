import React from "react";

const PoseModelTable = () => {
  const models = [
    {
      name: "MediaPipe Lite",
      accuracy: "Low - Medium",
      speed: "~30+ FPS",
      bestFor: "Mobile upload, large subject that constrasts with background",
    },
    {
      name: "MediaPipe Full",
      accuracy: "Medium - High",
      speed: "~15–20 FPS",
      bestFor: "Mobile upload (slower than lite), medium - small subject that contrasts with background, large subject that blends with background",
    },
    {
      name: "MediaPipe Heavy",
      accuracy: "Very High",
      speed: "~5–10 FPS",
      bestFor: "Uploading from computer, medium - small subject that blends with background",
    },
    {
      name: "MoveNet Lightning",
      accuracy: "Good",
      speed: "~50+ FPS",
      bestFor: "Not currently supported",
    },
    {
      name: "MoveNet Thunder",
      accuracy: "Better",
      speed: "20–25 FPS",
      bestFor: "Not currently supported",
    },
  ];

  return (
    <div className="child-container child-container-column" style={{fontSize: "12px"}}>
      <table style={{ borderCollapse: "collapse", width: "100%", maxWidth: "350px" }}>
        <thead style={{ color: "#DDA853" }}>
          <tr>
            <th style={thStyle}>Model</th>
            <th style={thStyle}>Accuracy</th>
            <th style={thStyle}>Speed</th>
            <th style={thStyle}>Use</th>
          </tr>
        </thead>
        <tbody style={{ textAlign: "left" }}>
          {models.map((model, index) => (
            <tr key={index}>
              <td style={tdStyle}><strong>{model.name}</strong></td>
              <td style={tdStyle}>{model.accuracy}</td>
              <td style={tdStyle}>{model.speed}</td>
              <td style={tdStyle}>{model.bestFor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const thStyle = {
  padding: "8px 12px",
  borderBottom: "2px solid #ddd",
  textAlign: "left",
  fontWeight: "bold",
};

const tdStyle = {
  padding: "8px 12px",
  borderBottom: "1px solid #ddd",
};

export default PoseModelTable;
