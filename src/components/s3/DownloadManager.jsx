// components/DownloadManager.jsx
import React, { useState, useEffect } from 'react';

const DownloadManager = () => {
  const [execInfo, setExecInfo] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState(null);
  
  const API = import.meta.env.VITE_API_BASE_URL_M;

  useEffect(() => {
    checkDownloadStatus();
    getExecutableInfo();
  }, []);

  const checkDownloadStatus = async () => {
    try {
      const response = await fetch(`${API}/api/download-status`);
      const data = await response.json();
      setDownloadStatus(data);
    } catch (error) {
      console.error("Error checking download status:", error);
    }
  };

  const getExecutableInfo = async () => {
    try {
      const response = await fetch(`${API}/api/executable-info`);
      const data = await response.json();
      setExecInfo(data);
    } catch (error) {
      console.error("Error getting executable info:", error);
    }
  };

  const downloadExecutable = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`${API}/api/download-executable`);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'RouteScanner.exe';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log("Download completed successfully");
    } catch (error) {
      console.error("Error downloading executable:", error);
      alert("Failed to download RouteScanner.exe");
    } finally {
      setDownloading(false);
    }
  };

  if (downloadStatus?.status !== "available") {
    return <div>Download service unavailable</div>;
  }

  return (
    <>  
      <button 
        onClick={downloadExecutable}
        disabled={downloading}
      >
        {downloading ? "Downloading..." : "Download RouteScanner.exe"}
      </button>

      {execInfo && (
        <div className="nested-container info-wrapper">
          <p><strong>File:</strong> {execInfo.filename}</p>
          <p><strong>Size:</strong> {execInfo.size_mb} MB</p>
          {execInfo.last_modified && (
            <p><strong>Last Modified:</strong> {new Date(execInfo.last_modified).toLocaleDateString()}</p>
          )}
        </div>
      )}
    </>
  );
};

export default DownloadManager;