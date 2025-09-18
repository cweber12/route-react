import React, { useState, useEffect } from "react";
import "../App.css";
import ModelSettings from "./ModelSettings";

const ExtractPose = ({
  videoPath,
  userName,
  loading,
  setPoseFilePath,
  setSiftFilePath,
  showSiftSliders,           
  setShowSiftSliders,
  siftUp,
  siftDown,
  siftLeft,
  siftRight,
  climberUp, 
  climberDown,
  climberLeft,
  climberRight,
  isStatic,


}) => {
  const [processingStatus, setProcessingStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [preprocess, setPreprocess] = useState(false);
  const [sharpenImage, setSharpenImage] = useState(false);
  const [kernelEdge, setKernelEdge] = useState(-1);
  const [kernelCenter, setKernelCenter] = useState(5);
  const [adjustBrightness, setAdjustBrightness] = useState(false);
  const [gamma, setGamma] = useState(1.0);
  const [processing, setProcessing] = useState(false);
  const [enhanceContrast, setEnhanceContrast] = useState(false);
  const [showParams, setShowParams] = useState(false);
  const [poseModel, setPoseModel] = useState("full");
  const [frameSampleRate, setFrameSampleRate] = useState(20);
  const [siftNFeatures, setSiftNFeatures] = useState(2000);
  const [clipLimit, setClipLimit] = useState(3);
  const [tileGridSize, setTileGridSize] = useState(10);  

  // Route Coordinates
  const [coordinates, setCoordinates] = useState({ lat: "", lng: "" });

  const API = import.meta.env.VITE_API_BASE_URL_P;

  const poseOptions = [
    // { value: "movenet", label: "MoveNet Lightning" },
    // { value: "movenet_thunder", label: "MoveNet Thunder" },
    { value: "lite", label: "MediaPipe Lite" },
    { value: "full", label: "MediaPipe Full" },
    { value: "heavy", label: "MediaPipe Heavy" },
  ];

  useEffect(() => {
    if (processing) {
      const interval = setInterval(() => {
        fetch(`${API}/api/processing-progress`)
          .then(res => {
            if (!res.ok) {
              throw new Error("Failed to fetch progress");
            }
            return res.json();
          })
          .then(data => {
            setProgress(data.percentage); // update your loading bar
          })
          .catch(err => console.error("Progress fetch error:", err));
      }, 5000); // poll every 5 second

      return () => clearInterval(interval); // clean up
    } else {
      return;
    }
  }, []);

  const handleProcessVideo = async () => {
    if (!videoPath || !userName) {
      setProcessingStatus("Missing required data.");
      return;
    }

    setProcessing(true);
    setPoseFilePath(null);
    setSiftFilePath(null);
    setProcessingStatus("Processing video ...");

    // Debug: Log payload before sending
    const payload = {
      video_path: videoPath,
      pose_model: poseModel,
      enhance_contrast: enhanceContrast,
      preprocess: preprocess,
      frame_sample_rate: frameSampleRate,
      sift_config: { nfeatures: siftNFeatures },
      clip_limit: clipLimit,
      tile_grid_size: tileGridSize,
      sharpen: sharpenImage,
      kernel_edge: kernelEdge,
      kernel_center: kernelCenter,
      adjust_brightness: adjustBrightness, 
      gamma: gamma,
      sift_up: siftUp,
      sift_down: siftDown,
      sift_left: siftLeft,
      sift_right: siftRight,
      static_frame: isStatic,
      climber_top: climberUp,
      climber_bottom: climberDown,
      climber_left: climberLeft,
      climber_right: climberRight,
    };
    console.log('Process video payload:', payload);

    try {
      const res = await fetch(`${API}/api/process-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        setPoseFilePath(result.pose_file_path);
        setSiftFilePath(result.sift_file_path);
        setProcessingStatus("Processing completed.");
      } else {
        setProcessingStatus(`Error: ${result.detail}`);
      }
    } catch (err) {
      console.error(err);
      setProcessingStatus("Processing failed.");
    } finally {
      setProcessing(false);
      setShowParams(false);
    }
  };

  const handleCoordinateInput = (e) => {
    const value = e.target.value;
    const [lat, lng] = value.split(",").map((v) => v.trim());
    setCoordinates({ lat, lng });
  };

  // Fix handleCancel: make it an async function and use correct syntax
  const handleCancel = async () => {
    try {
      await fetch("/api/cancel-processing", { method: "POST" });
      setProcessingStatus("Processing cancelled.");
    } catch (err) {
      setProcessingStatus("Cancel failed.");
    } finally {
      setProcessing(false);
    }
  }

  return (
<>
    <div 
      className="parent-container parent-container-column" 
      >
        <div className="compare-buttons-row">
      <select
        id="poseModel"
        value={poseModel}
        onChange={(e) => setPoseModel(e.target.value)}
        style={{ 
          height: "45px", 
          width: "295px", 
          borderRadius: "4px", 
          fontSize: "20px", 
          fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif",
        
        }}
        disabled={!videoPath || loading || processing}
      >
        {poseOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        onClick={() => {
          setShowParams(!showParams);
          setShowSiftSliders(!showSiftSliders); // <-- add this
        }}
      >
        Toggle Settings
      </button>

      <button
          onClick={handleProcessVideo}
          className={processing ? "processing process-button" : "process-button"}
          style={{borderRadius: "4px", padding: 0}}
          disabled={!videoPath || loading || processing}
        >
          {processing ? "Scanning..." : "Scan Video"}
          
        </button>
      </div>
      {showParams && (
        <div className="child-container child-container-column" 
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)", 
          color: "white", 
          borderRadius: "0 0 4px 4px", 
          padding: "10px 20px", 
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
          width: "280px",
          }}
          >
        <ModelSettings
          frameSampleRate={frameSampleRate}
          setFrameSampleRate={setFrameSampleRate}
          siftNFeatures={siftNFeatures}
          setSiftNFeatures={setSiftNFeatures}
          preprocess={preprocess}
          setPreprocess={setPreprocess}
          enhanceContrast={enhanceContrast}
          setEnhanceContrast={setEnhanceContrast}
          clipLimit={clipLimit}
          setClipLimit={setClipLimit}
          tileGridSize={tileGridSize}
          setTileGridSize={setTileGridSize}
          kernelEdge={kernelEdge}
          setKernelEdge={setKernelEdge}
          kernelCenter={kernelCenter}
          setKernelCenter={setKernelCenter}
          sharpenImage={sharpenImage}
          setSharpenImage={setSharpenImage}
          adjustBrightness={adjustBrightness}
          setAdjustBrightness={setAdjustBrightness}
          gamma={gamma}
          setGamma={setGamma}
         
          
        />
        </div>
      )}
        {processing && (
        <button
          style={{borderRadius: "4px", background: "#f16a6f"}}
          onClick={handleCancel}>CANCEL
        </button>
      )}
     
      
  

      </div>


    </>
  );
};

export default ExtractPose;
