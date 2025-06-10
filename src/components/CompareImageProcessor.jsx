import React, { useState, useRef, useCallback } from "react";
import "../App.css";

const CompareImageProcessor = ({ selectedS3PathArray }) => {
  const [imageFile, setImageFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [processedImage, setProcessedImage] = useState(false);
  const [preprocessImage, setPreprocessImage] = useState(false);
  const [preprocessSteps, setPreprocessSteps] = useState("");
  const [siftLeft, setSiftLeft] = useState(20);
  const [siftRight, setSiftRight] = useState(20);
  const [siftUp, setSiftUp] = useState(20);
  const [siftDown, setSiftDown] = useState(20);
  const [imgDims, setImgDims] = useState({ width: 640, height: 360 });
  const [renderedImgDims, setRenderedImgDims] = useState({ width: 0, height: 0 });
  const [hover, setHover] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL_M;
  const imgRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setImageFile(null);
    setVideoUrl("");
    setProcessedImage(false);
    setPreprocessSteps("");

    try {
      await fetch(`${API}/api/clear-output`, { method: "POST" });
      await fetch(`${API}/api/clear-temp`, { method: "DELETE" });
    } catch (err) {
      console.error("Error clearing previous output:", err);
    }

    setTimeout(() => {
      setImageFile(file);
    }, 50);
  };

  const handleImageLoad = (e) => {
    setImgDims({
      width: e.target.naturalWidth,
      height: e.target.naturalHeight,
    });
  };

  const handleRenderedImgResize = useCallback(() => {
    if (imgRef.current) {
      setRenderedImgDims({
        width: imgRef.current.clientWidth,
        height: imgRef.current.clientHeight,
      });
    }
  }, []);

  const handleProcess = async () => {
    if (!imageFile || !selectedS3PathArray || selectedS3PathArray.length === 0) {
      alert("Please select an image and at least one route attempt.");
      return;
    }

    const formData = new FormData();
    formData.append("image", imageFile);
    selectedS3PathArray.forEach((s3Path) => {
      formData.append("s3_folders", s3Path.replace("s3://route-keypoints/", ""));
    });
    formData.append("pose_lm_in", "");
    formData.append("sift_kp_in", "");
    formData.append("preprocess", preprocessImage ? "true" : "false");
    formData.append("sift_left", siftLeft);
    formData.append("sift_right", siftRight);
    formData.append("sift_up", siftUp);
    formData.append("sift_down", siftDown);

    setProcessing(true);

    try {
      const res = await fetch(`${API}/api/compare-image`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to process image.");
      const data = await res.json();

      setVideoUrl(`${API}${data.video_url}`);
      setPreprocessSteps(data.steps || "");
      setProcessedImage(true);
    } catch (err) {
      console.error("Error processing image:", err);
      alert("Error processing image.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCompareMultiple = async () => {
    if (!imageFile || !selectedS3PathArray || selectedS3PathArray.length < 2) {
      alert("Please select an image and at least two route attempts.");
      return;
    }

    const formData = new FormData();
    formData.append("image", imageFile);
    selectedS3PathArray.forEach((s3Path) => {
      formData.append("s3_folders", s3Path.replace("s3://route-keypoints/", ""));
    });
    formData.append("compare_multiple", "true");
    formData.append("preprocess", preprocessImage ? "true" : "false");
    formData.append("sift_left", siftLeft);
    formData.append("sift_right", siftRight);
    formData.append("sift_up", siftUp);
    formData.append("sift_down", siftDown);

    setProcessing(true);

    try {
      const res = await fetch(`${API}/api/compare-image-multi-cropped`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to compare attempts.");
      const data = await res.json();

      setVideoUrl(`${API}${data.video_url}`);
      setPreprocessSteps(data.steps || "");
      setProcessedImage(true);
    } catch (err) {
      console.error("Error comparing attempts:", err);
      alert("Error comparing attempts.");
    } finally {
      setProcessing(false);
    }
  };


  // Helper for image preview URL
  const imageUrl = imageFile ? URL.createObjectURL(imageFile) : null;

  // Add a useEffect to update renderedImgDims on window resize
  React.useEffect(() => {
    window.addEventListener('resize', handleRenderedImgResize);
    return () => window.removeEventListener('resize', handleRenderedImgResize);
  }, [handleRenderedImgResize]);

  return (
   <>
      {videoUrl && (

          <video 
            className="media" 
            style={{ width: "100%", height: "auto", maxHeight: "500px", display: "block" }}
            controls 
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

      )}
  

     
      {/* SIFT sliders and image preview */}
      {imageFile && !videoUrl && (
        <div 
        style={{ 
          padding: "50px 20px 20px 50px", 
          background: "rgba(0,0,0,0.3)",
          borderRadius: "0 4px 4px 0", 
          borderTop: "1px solid #333",
          borderRight: "1px solid #333",
          borderBottom: "1px solid #333",
          }}
          >
          <div style={{ position: "relative", maxWidth: 500, margin: "0" }}>
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Selected"
              style={{ width: "100%", height: "auto", display: "block", maxWidth: 500, borderRadius: "4px" }}
              onLoad={e => { handleImageLoad(e); handleRenderedImgResize(); }}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              onResize={handleRenderedImgResize}
            />
            {/* SVG overlay for SIFT box */}
            <svg
              width={imgDims.width}
              height={imgDims.height}
              viewBox={`0 0 ${imgDims.width} ${imgDims.height}`}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 8,
              }}
            >
              {(() => {
                const x = Math.max(0, (siftLeft / 100) * imgDims.width);
                const y = Math.max(0, (siftUp / 100) * imgDims.height);
                const w = Math.max(0, imgDims.width - ((siftLeft / 100) * imgDims.width) - ((siftRight / 100) * imgDims.width));
                const h = Math.max(0, imgDims.height - ((siftUp / 100) * imgDims.height) - ((siftDown / 100) * imgDims.height));
                return (
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    fill="none"
                    stroke="#39ff14"
                    strokeWidth="3"
                    rx="6"
                    style={{ filter: hover ? "drop-shadow(0 0 6px #39ff14)" : undefined, transition: "filter 0.2s" }}
                  />
                );
              })()}
            </svg>
            {/* Horizontal dual-thumb sliders (left/right) */}
            <div
              style={{
                position: "absolute",
                top: -7,
                left: 0,
                width: "100%", // always match rendered image width
                height: 32, // increased height to make touch easier
                zIndex: 30,
                pointerEvents: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 0,
                background: "rgba(0,0,0,0.01)", // transparent but blocks pointer events
              }}
              onTouchStart={e => e.stopPropagation()}
              onPointerDown={e => e.stopPropagation()}
            >
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={siftLeft}
                onChange={e => {
                  const val = Math.min(Number(e.target.value), 95);
                  if (val > 100 - siftRight - 5) return;
                  setSiftLeft(val);
                }}
                className="slider-thumb-sift"
                style={{
                  pointerEvents: "auto",
                  position: "absolute",
                  top: -10,
                  left: 0,
                  width: "100%", // always match rendered image width
                  height: 8,
                  zIndex: 30,
                }}
              />
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={100 - siftRight}
                onChange={e => {
                  const val = Math.min(100 - Number(e.target.value), 95);
                  if (val > 100 - siftLeft - 5) return;
                  setSiftRight(val);
                }}
                className="slider-thumb-sift"
                style={{
                  pointerEvents: "auto",
                  position: "absolute",
                  top: -25,
                  left: 0,
                  width: "100%", // always match rendered image width
                  height: 8,
                  zIndex: 30,
                }}
              />
            </div>
            {/* Vertical dual-thumb slider on left border */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 32, // increased width to make touch easier
                height: renderedImgDims.height, // match rendered image height
                zIndex: 30,
                transform: "rotate(90deg)",
                transformOrigin: "top left",
                pointerEvents: "auto",
                background: "rgba(0,0,0,0.01)", // transparent but blocks pointer events
              }}
              onTouchStart={e => e.stopPropagation()}
              onPointerDown={e => e.stopPropagation()}
            >
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={siftUp}
                onChange={e => {
                  const val = Math.min(Number(e.target.value), 95);
                  if (val > 100 - siftDown - 5) return;
                  setSiftUp(val);
                }}
                className="slider-thumb-sift"
                style={{
                  pointerEvents: "auto",
                  position: "absolute",
                  top: 20,
                  left: 0,
                  width: renderedImgDims.height,
                  height: 8,
                  zIndex: 30,
                }}
              />
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={100 - siftDown}
                onChange={e => {
                  const val = Math.min(100 - Number(e.target.value), 95);
                  if (val > 100 - siftUp - 5) return;
                  setSiftDown(val);
                }}
                className="slider-thumb-sift"
                style={{
                  pointerEvents: "auto",
                  position: "absolute",
                  top: 5,
                  left: 0,
                  width: renderedImgDims.height,
                  height: 8,
                  zIndex: 30,
                }}
              />
            </div>
            
          </div>
        </div>
      )}
       {/* Buttons row, 20px below video */}
      <div
        className="parent-container parent-container-row"
        style={{justifyContent: "flex-start"  }}
      >
        <label 
          htmlFor="image-upload" 
          className="button-label"
        >
          Select an Image
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <button 
          onClick={handleProcess} 
          disabled={processing || !imageFile}
          className={processing ? "processing process-button" : "process-button"}
        >
          Process & View
        </button>

        {/* Show Compare Multiple only if multiple thumbnails are selected */}
        {selectedS3PathArray && selectedS3PathArray.length > 1 && (
          <button
            className="process-button"
            onClick={handleCompareMultiple}
            disabled={processing || !imageFile}
          >
            Compare Multiple
          </button>
        )}
      </div>


    </>
  );
};

export default CompareImageProcessor;
