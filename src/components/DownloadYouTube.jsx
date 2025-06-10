import React, { useState } from "react";
import "../App.css";

const DownloadYouTube = ({ onDownloadComplete, setVideoUrl }) => {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [highRes, setHighRes] = useState(false); // New state for high resolution

  const API = import.meta.env.VITE_API_BASE_URL_P;

  const handleDownload = async () => {
    if (!url.trim()) {
      setStatus("Please enter a valid YouTube URL.");
      return;
    }

    setStatus("Downloading...");
    setDownloading(true);

    const formData = new FormData();
    formData.append("url", url);
    formData.append("resolution", highRes ? 1080 : 720); // send 1080 if checked

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
      setStatus("Failed to download video.");
      setDownloading(false);
    }
  };

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
    <div 
    className="child-container child-container-column"
    > 
      <p
                style={{
                  display: "flex", 
                  alignItems: "center", 
                  gap: "5px", 
                  textWrap: "wrap", 
                }}
              >
                From
                <a
                  href="https://www.youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                > 
                  YouTube
                </a>
              </p>
      <input
      className="text-input"
        type="text"
        value={url}
        onChange={handleInputChange}
        placeholder="Paste YouTube video URL"
        style={{width: "250px", fontSize: "16px"}}
      />
      
      {showDownload && !downloading && url.trim() !== "" && (
        <>
        <button onClick={handleDownload}
        className={downloading ? "processing process-button" : "process-button"}>
          {downloading ? "Downloading..." : "Download Video"}
          
          </button>
          <div style={{margin: "0", display: "flex", alignItems: "center", gap: 8}}>
        <input
          type="checkbox"
          id="highResCheckbox"
          checked={highRes}
          onChange={e => setHighRes(e.target.checked)}
          style={{marginRight: 4}}
        />
        <label htmlFor="highResCheckbox" style={{userSelect: "none", fontSize: 15}}>
          High Resolution (1080p)
        </label>
      </div>
        </>
      )}
    </div>
  );
};

export default DownloadYouTube;
