import React, { useState, useEffect } from "react";
import "../App.css";

const Upload = ({ setVideoPath, setVideoUrl}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  
  const API = import.meta.env.VITE_API_BASE_URL_P;

  useEffect(() => {
    if (selectedFile) {
      handleUpload(); // Run only after selectedFile is updated
    }
  }, [selectedFile]);

  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const localUrl = URL.createObjectURL(file);
      setVideoUrl(localUrl); // Only for preview before upload
      // Do NOT setVideoPath(localUrl) here
    }
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", selectedFile);
    setUploading(true);

    try {
      const response = await fetch(`${API}/api/upload-temp-video`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setVideoPath(`${API}${result.video_url}`); // Backend-accessible path
        setVideoUrl(`${API}${result.video_url}`);  // For playback after upload
        sessionStorage.setItem("video_uploaded", "1");
        setUploadStatus("Video uploaded successfully!");
        setUploading(false); 
      } else {
        setUploadStatus("Upload failed. Please try again.");
        setUploading(false);
      }
    } catch (error) {
      setUploadStatus("Error uploading video.");
      setUploading(false);
    }
  };

  return (
      <div className="child-container child-container-column"> 
        <p>Upload a video from your device</p>       
        <label 
          htmlFor="video-upload" 
          className="button-label" 
        >
        Files
        </label>
        <input 
          id="video-upload"
          type="file" 
          accept="video/*"
          style={{ display: "none" }} 
          onChange={handleFileChange}
        />
      </div>
  );
};

export default Upload;
