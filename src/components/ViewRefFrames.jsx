import React, { useEffect, useState } from "react";

import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'

const ViewRefFrames = ({ poseFilePath, siftFilePath, setAutoRefFramePath }) => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [noFrames, setNoFrames] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [omitFrames, setOmitFrames] = useState([]);
  const [omitting, setOmitting] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL_P;
  
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch(`${API}/api/reference-images`);
        const data = await res.json();
        if (data.autoSelectedFrame) {
          setAutoRefFramePath(`${API}${data.autoSelectedFrame}`);
        }
        
        if (data.images) {
          const sorted = data.images.sort((a, b) => {
            const getFrameNumber = (filename) => {
              const match = filename.match(/frame_(\d+)\.jpg$/);
              return match ? parseInt(match[1], 10) : 0;
            };
            return getFrameNumber(a) - getFrameNumber(b);
          });
        
          setImages(sorted);
        
          // If an auto-selected frame was returned, use it as the starting frame
          if (data.autoSelectedFrame) {
            const index = sorted.findIndex((img) => `/static/reference_frames/${img.split("/").pop()}` === data.autoSelectedFrame);
            if (index !== -1) {
              setCurrentIndex(index);
            }
          }
        } else {
          console.error("No images found:", data.error);
          setNoFrames(true);
        }
        
      } catch (err) {
        console.error("Failed to fetch reference images:", err);
        setFetchError(true);
      }
    };

    fetchImages();
  }, []);

  const currentFrameNum = images[currentIndex]?.match(/frame_(\d+)\.jpg$/)?.[1] ?? "?";

  const toggleOmit = () => {
    const frame = parseInt(currentFrameNum);
    setOmitFrames((prev) =>
      prev.includes(frame) ? prev.filter((f) => f !== frame) : [...prev, frame]
    );
  };

  const submitOmittedFrames = async () => {
    try {
      setOmitting(true)
      const res = await fetch(`${API}/api/omit-frames`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          omit_frames: omitFrames, 
          pose_file_path: poseFilePath,
          sift_file_path: siftFilePath, 
        }),
      });
      const result = await res.json();
      alert(result.message || "Frames submitted successfully");
      setOmitting(false)
    } catch (err) {
      console.error("Error submitting omitted frames:", err);
      alert("Failed to submit omitted frames");
      setOmitting(false)
    }
  };

  if (!images.length) return <p>Loading reference frames...</p>;
  if (noFrames) return <p>No data recorded, try adjusting the parameters.</p>;
  if (fetchError) return <p>Reference frames not available ** process scheduling error **</p>;

  return (
    <div 
    className="parent-container parent-container-column" 
    style={{alignItems: "center", gap: 0}}
    >
         
      <Zoom>
        <img
          className="media"
          src={`${API}${images[currentIndex]}`}
          alt={`Frame ${currentFrameNum}`}
        />

      </Zoom>

        
      <div className="child-container child-container-row" 
      style={{
        gap: "20px", 
        alignItems: "center", 
        justifyContent: "center",
        backgroundColor: "rgba(48, 6, 6, 0.3)",
        borderRadius: "0 0 4px 4px",
        padding: "10px",
        alignSelf: "center",
        width: "100%",
        margin: 0, 
        }}>
   
        <img 
        src="assets/left.png"
        alt="Previous Frame"
        className="switch-icon"
        style={{
          width: "30px", 
          height: "30px", 
          background:  "#e4ff92",
          borderRadius: "25%",
        
        }}
        onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
        />
        <p style={{color: "white"}}>{currentFrameNum}</p>
        <img
        src="assets/right.png"
        alt="Next Frame"
        className="switch-icon"
        style={{
          width: "30px", 
          height: "30px", 
          background:  "#e4ff92",
          borderRadius: "25%",
        
        }} 
        onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
        />
        <input
          type="checkbox"
          style={{width: "20px", height: "20px"}}
          checked={omitFrames.includes(parseInt(currentFrameNum))}
          onChange={toggleOmit}
        />
        {omitFrames.includes(parseInt(currentFrameNum)) ? (
          <p style={{ color: "lightgray" }}>Omitted</p>
        ) : (
          <p style={{color: "white"}}>Omit</p>
        )}
      </div>

      

      {omitFrames.length > 0 && (
        <>       
        <span style={{display: "flex", alignItems: "flex-start", justifyContent: "flex-start", gap: "10px"}}>
        <button 
        onClick={submitOmittedFrames}
        disabled={omitting}
        > Omit Frames  </button>
   
          <p>: {omitFrames.join(", ")}</p>
        </span>
        </>
        
      )}
    </div>


  );
};

export default ViewRefFrames;
