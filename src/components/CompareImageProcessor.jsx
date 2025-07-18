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
  const userName = sessionStorage.getItem("userName");

  // Add state for pose skeleton colors
  const [lineColor, setLineColor] = useState("#64ff00"); // default: 100,255,0
  const [pointColor, setPointColor] = useState("#0064ff"); // default: 0,100,255

  // Add state for built-in image selection
  const [selectedBuiltInImage, setSelectedBuiltInImage] = useState(null);

  const API = import.meta.env.VITE_API_BASE_URL_M;
  const imgRef = useRef(null);
  const fileInputRef = React.useRef();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setImageFile(null);
    setSelectedBuiltInImage(null);
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
      // Defensive: ensure file is not null and is a File object
      if (file && file instanceof File) {
        setImageFile(file);
        setSelectedBuiltInImage(null); // Ensure built-in image is cleared only if a real file is set
      } else {
        setImageFile(null);
      }
      // Always reset the file input after processing
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
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

  // Helper to convert #RRGGBB to 'r,g,b'
  function hexToRgbString(hex) {
    if (!hex) return "0,0,0";
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    return [
      (num >> 16) & 255,
      (num >> 8) & 255,
      num & 255
    ].join(',');
  }

  // Ensure color state resets on new image
  React.useEffect(() => {
    setLineColor("#64ff00");
    setPointColor("#0064ff");
  }, [imageFile]);

  const handleProcess = async () => {
    if ((!imageFile && !selectedBuiltInImage) || !selectedS3PathArray || selectedS3PathArray.length === 0) {
      alert("Please select an image and at least one route attempt.");
      return;
    }
    const formData = new FormData();
    if (selectedBuiltInImage) {
      formData.append("built_in_image", selectedBuiltInImage); // Pass S3 URI
      formData.append("image", new Blob()); // Send empty file for compatibility
    } else {
      formData.append("built_in_image", "");
      formData.append("image", imageFile);
    }
    console.log("imageFile passed to backend:", imageFile);
    formData.append("pose_lm_in", "");
    formData.append("sift_kp_in", "");
    formData.append("preprocess", preprocessImage ? "true" : "false");
    formData.append("sift_left", siftLeft);
    formData.append("sift_right", siftRight);
    formData.append("sift_up", siftUp);
    formData.append("sift_down", siftDown);
    formData.append("line_color", hexToRgbString(lineColor));
    formData.append("point_color", hexToRgbString(pointColor));
    selectedS3PathArray.forEach((s3Path) => {
      formData.append("s3_folders", s3Path.replace("s3://route-keypoints/", ""));
    });
    setProcessing(true);
    try {
      const res = await fetch(`${API}/api/compare-image`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to process image.");
      const data = await res.json();
      setVideoUrl(`${API}${data.video_url}?t=${Date.now()}`);
      setPreprocessSteps(data.steps || "");
      setProcessedImage(true);
    } catch (err) {
      console.error("Error processing image:", err);
      alert("Error processing image.");
    } finally {
      setProcessing(false);
    }
  };

  // Handler for built-in image selection
  const handleBuiltInImageSelect = (e) => {
    const s3Uri = e.target.value;
    if (!s3Uri) return;
    setSelectedBuiltInImage(s3Uri);
    setImageFile(null);
    setVideoUrl("");
    setProcessedImage(false);
    setPreprocessSteps("");
    // Always reset the file input when switching to built-in image
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
    setTimeout(() => {
      setImageFile({
        name: s3Uri.split('/').pop(),
        s3Uri,
        type: 'image/jpeg',
        isS3: true
      });
    }, 0);
  };

  // Helper for image preview URL
  const imageUrl = imageFile
    ? imageFile.s3Uri
      ? `https://route-keypoints.s3.amazonaws.com/sample-images/${imageFile.name}`
      : URL.createObjectURL(imageFile)
    : null;

  // Polling state for video availability
  const [videoReady, setVideoReady] = useState(false);
  const pollIntervalRef = useRef(null);

  // Helper to poll for video availability
  const pollForVideo = useCallback((url) => {
    setVideoReady(false);
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(url, { method: 'HEAD' });
        if (res.ok) {
          setVideoReady(true);
          clearInterval(pollIntervalRef.current);
        }
      } catch (e) {
        // ignore, keep polling
      }
    }, 2000); // poll every 2 seconds
  }, []);

  // When videoUrl changes, start polling
  React.useEffect(() => {
    if (videoUrl) {
      pollForVideo(videoUrl);
    } else {
      setVideoReady(false);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [videoUrl, pollForVideo]);

  return (
   <>
      {videoUrl && (
        videoReady ? (
          <video 
            className="media" 
            style={{ width: "100%", height: "auto", maxHeight: "500px"}}
            controls 
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div 
            style={{
              color: '#c6ff1d', 
              fontSize: 20, 
              padding: 0, 
              textAlign: 'center', 
              fontFamily: 'Courier New, monospace',
              }}>
            Processing video, please wait...
          </div>
        )
      )}
     
      {/* SIFT sliders and image preview */}
      {imageFile && !videoUrl && (
        <div className="compare-image-preview-container">
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
       {/* Color selectors for pose skeleton */}
       {imageFile && !videoUrl && (
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', margin: '0', justifyContent: 'flex-start' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 500, color: '#c6ff1d' }}>Line Color:</span>
            <input
              type="color"
              value={lineColor}
              onChange={e => setLineColor(e.target.value)}
              style={{ width: 32, height: 32, border: 'none', background: 'none', cursor: 'pointer' }}
              title="Select pose skeleton line color"
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 500, color: '#c6ff1d' }}>Point Color:</span>
            <input
              type="color"
              value={pointColor}
              onChange={e => setPointColor(e.target.value)}
              style={{ width: 32, height: 32, border: 'none', background: 'none', cursor: 'pointer' }}
              title="Select pose skeleton point color"
            />
          </label>
        </div>
      )}
       {/* Buttons row, 20px below video */}
      {selectedS3PathArray && selectedS3PathArray.length > 0 && (
        <div
          className="parent-container parent-container-row"
          style={{justifyContent: "flex-start", alignItems: "flex-start"}}
        >
          <div className="child-container child-container-column" style={{ gap: "20px", alignItems: "flex-start" }}>
          {/* Existing Image Files button */}
          <label 
            htmlFor="image-upload" 
            className="button-label"
          >
            Image Files
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          {userName == "Demo" && (
          <select
            id="built-in-image-select"
            value={selectedBuiltInImage || ""}
            onChange={handleBuiltInImageSelect}
            style={{padding: "6px 12px", borderRadius: 4, fontSize: 16 }}
          >
            <option value="">Select a sample image...</option>
            <option value="s3://route-keypoints/sample-images/KingAir.jpg">KingAir.jpg</option>
            <option value="s3://route-keypoints/sample-images/Bloodline.jpg">Bloodline.jpg</option>
            <option value="s3://route-keypoints/sample-images/AScannerDarkly.jpg">AScannerDarkly.jpg</option>
          </select>
          )}
          </div>
          <button 
            onClick={handleProcess} 
            disabled={processing || (!imageFile && !selectedBuiltInImage)}
            className={processing ? "processing process-button" : "process-button"}
          >
            Scan Image
          </button>
        </div>
      )}
    </>
  );
};

export default CompareImageProcessor;
