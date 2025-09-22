// src/components/input/DownloadYouTube.jsx
// ----------------------------------------------------------------------------
// Component to download YouTube videos via backend
// ----------------------------------------------------------------------------

import React, { useState } from "react";
import "../../App.css";

const DownloadYouTube = ({ onDownloadComplete, setVideoUrl }) => {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  // Backend API base URL
  const API = import.meta.env.VITE_API_BASE_URL_P;

  // Handle the download process
  const handleDownload = async () => {
    if (!url.trim()) {
      setStatus("Please enter a valid YouTube URL.");
      return;
    }
    setDownloading(true);   
    const formData = new FormData();
    formData.append("url", url);
    try {
      const res = await fetch(`${API}/api/download-youtube`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("Download complete.");
        onDownloadComplete(data.file_path); 
        setVideoUrl(`${API}${data.video_url}`);
        setDownloading(false);
        setShowDownload(false); // Hide button after download
        sessionStorage.setItem("video_uploaded", "1");
      } else {
        setStatus(`Error: ${data.error || "Download failed."}`);
        setDownloading(false);
      }
    } catch (err) {
      setStatus("Failed to download video: " + err.message);
      setDownloading(false);
    }
  };

  // Handle input changes and toggle download button visibility
  const handleInputChange = (e) => {
    const value = e.target.value;
    setUrl(value);
    if (value.trim() !== "") {
      setShowDownload(true); // Show button when input is not empty
    } else {
      setShowDownload(false);
    }
  };

  return (
    <>
      <input
        className="text-input"
        type="text"
        value={url}
        onChange={handleInputChange}
        placeholder=" Paste YouTube video URL"
        style={{
          width: "285px", 
          fontSize: "18px", 
          padding: 0, 
        }}
      />
      
      {showDownload && url.trim() !== "" && (
        <>
          <button 
            onClick={handleDownload}
            disabled={downloading}
            style={{width: "100%"}}
          >
            {downloading ? "Downloading..." : "Download Video"}  
          </button> 
          <p>{status}</p>      
        </>
      )}
    </>
  );
};

export default DownloadYouTube;
