import React, { useState, useEffect } from "react";
import "../App.css";
import ModelSettings from "./ModelSettings";
import PoseModelTable from "./PoseModelTable.jsx";

const ExtractPose = ({
  videoPath,
  userName,
  loading,
  poseFilePath,
  setPoseFilePath,
  setSiftFilePath,
  showSiftSliders,           
  setShowSiftSliders,
  siftUp,
  setSiftUp,
  siftDown,
  setSiftDown,
  siftLeft,
  setSiftLeft,
  siftRight,
  setSiftRight,
  climberUp, 
  setClimberUp,
  climberDown,
  setClimberDown,
  climberLeft,
  setClimberLeft,
  climberRight,
  setClimberRight,
  isStatic,
  detectClimbers,
  setDetectClimbers,
  multiplePeople,
  setMultiplePeople,
}) => {
  const [processingStatus, setProcessingStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [preprocess, setPreprocess] = useState(false);
  const [sharpenImage, setSharpenImage] = useState(false);
  const [kernelEdge, setKernelEdge] = useState(0.5);
  const [kernelCenter, setKernelCenter] = useState(0.5);
  const [adjustBrightness, setAdjustBrightness] = useState(false);
  const [gamma, setGamma] = useState(1.0);
  const [processing, setProcessing] = useState(false);
  const [showModelInfo, setShowModelInfo] = useState(false);
  const [enhanceContrast, setEnhanceContrast] = useState(false);
  const [showParams, setShowParams] = useState(false);
  const [poseModel, setPoseModel] = useState("full");
  const [frameSampleRate, setFrameSampleRate] = useState(15);
  const [siftNFeatures, setSiftNFeatures] = useState(600);
  const [clipLimit, setClipLimit] = useState(3);
  const [tileGridSize, setTileGridSize] = useState(10); 
  const [minPresenceConfidence, setMinPresenceConfidence] = useState(0.9); 


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
      detect_climbers: detectClimbers,
      preprocess: preprocess,
      frame_sample_rate: frameSampleRate,
      sift_config: { nfeatures: siftNFeatures },
      clip_limit: clipLimit,
      tile_grid_size: tileGridSize,
      min_pose_presence_confidence: minPresenceConfidence,
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
      multiple_people: multiplePeople,
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

  async function handleCancel() {
    await fetch("/api/cancel-processing", { method: "POST" });
    alert("Processing cancel requested.");
  }

  return (
<>
    <div className="parent-container parent-container-column" style={{alignItems: "center"}}>
      <div className="parent-container parent-container-row" style={{justifyContent: "center" }}>
      <select
        id="poseModel"
        value={poseModel}
        onChange={(e) => setPoseModel(e.target.value)}
        style={{ height: "40px", width: "280px", borderRadius: "4px", fontSize: "16px"}}
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
          style={{borderRadius: "4px"}}
          disabled={!videoPath || loading || processing}
        >
        
          {showParams ? "Hide" : "Update"} Parameters
     
      </button>
      </div>
      <div className="parent-container parent-container-row" style={{justifyContent: "center" }}>

      <button
          onClick={handleProcessVideo}
          className={processing ? "processing" : ""}
          style={{borderRadius: "4px"}}
          disabled={!videoPath || loading || processing}
        >
          {processing ? "Loading..." : "Run"}
          
        </button>
        {processing && (
        <button
          style={{borderRadius: "4px"}}
          onClick={handleCancel}>Cancel
        </button>
      )}
      </div>
      </div>

      {showParams && (
        <div className="child-container child-container-column" 
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)", 
          color: "white", 
          borderRadius: "10px", 
          padding: "10px 20px", 
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
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
          detectClimbers={detectClimbers}
          setDetectClimbers={setDetectClimbers}
          multiplePeople={multiplePeople}
          setMultiplePeople={setMultiplePeople}
        />
        </div>
      )}

    </>
  );
};

export default ExtractPose;
