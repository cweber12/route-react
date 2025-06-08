import React from "react";

const ClaheSettingsTable = () => {
  const tableData = [
    {
      clipLimit: "1.0",
      gridSize: "4x4",
      useCase: "Very bright climbing gym footage with strong lighting. Prevents over-enhancement.",
    },
    {
      clipLimit: "2.0",
      gridSize: "8x8",
      useCase: "Outdoor climbing on overcast days with moderate shadows. Balances enhancement and noise.",
    },
    {
      clipLimit: "3.0",
      gridSize: "8x8",
      useCase: "Shady crag footage where climber blends into the background. Increases local contrast to make poses stand out.",
    },
    {
      clipLimit: "4.0",
      gridSize: "16x16",
      useCase: "Backlit or low-contrast video (e.g. climber silhouetted on a wall). Helps recover features in shadowed areas.",
    },
    {
      clipLimit: "5.0+",
      gridSize: "16x16",
      useCase: "Very dark bouldering videos or low-light indoor scenes. May introduce noise but can improve visibility of holds.",
    },
  ];

  return (
    <div className="child-container child-container-column">
      <h3>CLAHE Settings Guide</h3>
      <p>
        Use these presets to help MediaPipe or SIFT detect more features in varied lighting.
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ccc" }}>
        <thead style={{ backgroundColor: "#f2f2f2" }}>
          <tr>
            <th style={styles.th}>Clip Limit</th>
            <th style={styles.th}>Grid Size</th>
            <th style={styles.th}>When to Use</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, idx) => (
            <tr key={idx} style={idx % 2 ? styles.altRow : {}}>
              <td style={styles.td}>{row.clipLimit}</td>
              <td style={styles.td}>{row.gridSize}</td>
              <td style={styles.td}>{row.useCase}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  th: {
    padding: "12px",
    textAlign: "left",
    borderBottom: "1px solid #ccc",
    fontWeight: "bold",
    backgroundColor: "rgba(35, 49, 66, 1)"
  },
  td: {
    padding: "10px",
    textAlign: "left",
    borderBottom: "1px solid #eee",
    fontSize: "0.95rem",

  },
  altRow: {
    backgroundColor: "rgba(35, 49, 66, 0.7)",

  },
};

export default ClaheSettingsTable;