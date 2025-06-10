import React, { useState, useEffect, useRef, useCallback } from "react";
import "../App.css";
import ExtractPose from "../components/ExtractPose";
import DownloadYouTube from "../components/DownloadYouTube";
import Upload from "../components/Upload";
import ViewRefFrames from "../components/ViewRefFrames";
import UploadToS3 from "../components/UploadToS3.jsx";



const UploadVideo = () => {
  const [videoPath, setVideoPath] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [poseFilePath, setPoseFilePath] = useState(null);
  const [siftFilePath, setSiftFilePath] = useState(null);
  const [showS3Upload, setShowS3Upload] = useState(true);
  const [videoUrl, setVideoUrl] = useState(null);
  const [autoRefFramePath, setAutoRefFramePath] = useState(null);

  // --- STATIC SIFT BOX STATE (do not change this logic) ---
  const [showSiftSliders, setShowSiftSliders] = useState(false);
  const [siftLeft, setSiftLeft] = useState(20);
  const [siftRight, setSiftRight] = useState(20);
  const [siftTop, setSiftTop] = useState(20);
  const [siftBottom, setSiftBottom] = useState(20);

  const [frameWidth, setFrameWidth] = useState(640);
  const [frameHeight, setFrameHeight] = useState(360);

  // ADD THESE MISSING STATE VARIABLES:
  const [isStatic, setIsStatic] = useState(true);
  const [detectClimbers, setDetectClimbers] = useState(false);
  const [multiplePeople, setMultiplePeople] = useState(false);

  // --- Toggle and climber bbox state ---
  const [editMode, setEditMode] = useState('sift'); // 'sift' or 'climber'
  const [climberLeft, setClimberLeft] = useState(20);
  const [climberRight, setClimberRight] = useState(20);
  const [climberUp, setClimberUp] = useState(20); // renamed from climberTop
  const [climberDown, setClimberDown] = useState(20); // renamed from climberBottom

  const videoRef = useRef(null);
  const [renderedVideoWidth, setRenderedVideoWidth] = useState(0);
  const [renderedVideoHeight, setRenderedVideoHeight] = useState(0);

  const API = import.meta.env.VITE_API_BASE_URL_P;


  useEffect(() => {
    function updateRenderedVideoDims() {
      if (videoRef.current) {
        setRenderedVideoWidth(videoRef.current.clientWidth);
        setRenderedVideoHeight(videoRef.current.clientHeight);
      }
    }
    window.addEventListener('resize', updateRenderedVideoDims);
    // Also update immediately in case of layout changes
    updateRenderedVideoDims();
    return () => window.removeEventListener('resize', updateRenderedVideoDims);
  }, [videoUrl]);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("userName");
    if (storedUser) setUserName(storedUser);
  }, []);

  return (
    <>

    
    <div className="page-container">
        
      {!videoPath && (
        <>
        <h1 className="upload-title">Upload a Video</h1>
      <div 
      className="parent-container parent-container-row"
      style={{
        padding: "20px", 
        background: "rgba(0, 0, 0, 0.5)", 
        borderRadius: "0 0 4px 4px",
        color: "#ccc", 
      
      }}
      
      >
        <Upload setVideoPath={setVideoPath} setVideoUrl={setVideoUrl} />
        <DownloadYouTube
          onDownloadComplete={(path) => {
            setVideoPath(path);
          }}
          setVideoUrl={setVideoUrl}
        />
      </div>
      </>
      )}
      { videoPath && (
        <>
        <h1 className="upload-title">SCAN ROUTE PROGRESSION</h1>
                
        <div 
            className="parent-container parent-container-row" 
            style={{ 
              width: '100%', 
              alignItems: 'center',
              justifyCOntent: "flex-start", 
              marginTop: -10, 
              background:  "rgba(80, 8, 18, 0.2)",
              padding: "10px", 
              borderRadius: "4px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",

              
              
              }}>

                <button
                  onClick={() => setEditMode('sift')}
                  style={{
                    background: editMode === 'sift' ? '#e4ff92' : '#eee',
                    color: editMode === 'sift' ? '#222' : '#222',
                    border: 'none',
                    borderRadius: 4,
                    width: 'auto',
                    padding: '6px 10px',
                    fontWeight: 500,
                    cursor: 'pointer',
                   
                    transition: 'all 0.15s',
                  }}
                >
                  Crop Route
                </button>
                <button
                  onClick={() => setEditMode('climber')}
                  style={{
                    background: editMode === 'climber' ? '#2f88c7' : '#eee',
                    color: editMode === 'climber' ? '#222' : '#222',
                    border: 'none',
                    borderRadius: 4,
                    padding: '6px 10px',
                    width: 'auto',
                    fontWeight: 500,
                    cursor: 'pointer',
                    
                    transition: 'all 0.15s',
                  }}
                >
                  Crop Climber
                </button>
             
                <label 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 10, 
                  fontSize: 20, 
                  color: '#ccc',
                  height: 30
                  }}>
                  <input
                    type="checkbox"
                    checked={isStatic}
                    style={{ 
                      marginRight: 0, 
                      width: 30, 
                      height: 30 
                    }}
                    onChange={e => setIsStatic(e.target.checked)}
                  />
                  Static Video
                </label>
              </div>
        <div className="parent-container parent-container-row" style={{ width: "100%", alignItems: "flex-start", justifyContent: "center", gap: 20 }}>
          {/* Video, SVG, sliders column */}
          <div className="parent-container parent-container-column" style={{ alignItems: 'center', flex: 1, width: '100%' }}>
            
            {videoUrl && (
              <>
              
              <div 
              style={{ 
                padding: "50px 20px 20px 50px", 
                background: 'rgba(0,0,0,0.3)', 
                borderRadius: 4, display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'flex-start', 
                width: 'auto', 
                boxSizing: 'border-box', 
                border: '1px solid rgba(0, 0, 0, 0.9)',
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",

                }}
                >
                <div style={{ position: "relative", width: "100%", maxWidth: 800, margin: "0" }}>
              
                {/* Content box with border for slider alignment */}
                <div
                  style={{
                    width: renderedVideoWidth,
                    height: renderedVideoHeight,
                    background: "transparent",
                    boxSizing: "border-box",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    zIndex: 8,
                  }}
                />
                <video
                  ref={videoRef}
                  className="media"
                  src={videoUrl}
                  controls
                  style={{
                    maxWidth: "600px",
                  
                    width: "100%",
                    height: "auto",
                    display: "block",
                    borderRadius: "4px",
                    padding: 0,
                    margin: 0,
                    background: "none",
                    alignSelf: "center",
                    position: "relative",
                    zIndex: 10,
                  }}
                  onLoadedMetadata={e => {
                    setFrameWidth(e.target.videoWidth);
                    setFrameHeight(e.target.videoHeight);
                  }}
                  onLoadedData={() => {
                    if (videoRef.current) {
                      setRenderedVideoWidth(videoRef.current.clientWidth);
                      setRenderedVideoHeight(videoRef.current.clientHeight);
                    }
                  }}
                />
                {/* SVG overlay, perfectly aligned over the video */}
                <svg
                  width="100%"
                  height="100%"
                  viewBox={`0 0 ${renderedVideoWidth} ${renderedVideoHeight}`}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    pointerEvents: "none",
                    zIndex: 900,
                    borderRadius: "2px",
                    boxShadow: "0 2px 4px rgba(#e4ff92, 0.5)",
                  }}
                >
                  <rect
                    x={((editMode === 'sift' ? siftLeft : climberLeft) / 100) * renderedVideoWidth}
                    y={((editMode === 'sift' ? siftTop : climberUp) / 100) * renderedVideoHeight}
                    width={renderedVideoWidth - (((editMode === 'sift' ? siftLeft : climberLeft) / 100) * renderedVideoWidth) - (((editMode === 'sift' ? siftRight : climberRight) / 100) * renderedVideoWidth)}
                    height={renderedVideoHeight - (((editMode === 'sift' ? siftTop : climberUp) / 100) * renderedVideoHeight) - (((editMode === 'sift' ? siftBottom : climberDown) / 100) * renderedVideoHeight)}
                    fill="none"
                    stroke={editMode === 'sift' ? "#e4ff92" : "#007bff"}
                    strokeWidth="3"
                  />
                </svg>
                {/* Horizontal dual-thumb slider on top border */}
                <div
                  style={{
                    position: "absolute",
                    top: -7,
                    left: 0,
                    width: "100%",
                    height: 16, // increased height for offset
                    zIndex: 30,
                    pointerEvents: "none",
                  }}
                >
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={editMode === 'sift' ? siftLeft : climberLeft}
                    onChange={e => {
                      const val = Math.min(Number(e.target.value), 95);
                      if (editMode === 'sift') {
                        if (val > 100 - siftRight - 5) {
                          setSiftLeft(val);
                          setSiftRight(Math.max(0, 100 - val - 5));
                        } else {
                          setSiftLeft(val);
                        }
                      } else {
                        if (val > 100 - climberRight - 5) {
                          setClimberLeft(val);
                          setClimberRight(Math.max(0, 100 - val - 5));
                        } else {
                          setClimberLeft(val);
                        }
                      }
                    }}
                    className={editMode === 'sift' ? 'slider-thumb-sift' : 'slider-thumb-climber'}
                    style={{
                      pointerEvents: "auto",
                      position: "absolute",
                      top: -10,
                      left: 0,
                      width: "100%",
                      height: 8,
                      zIndex: 30,
                    }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={100 - (editMode === 'sift' ? siftRight : climberRight)}
                    onChange={e => {
                      const val = Math.min(100 - Number(e.target.value), 95);
                      if (editMode === 'sift') {
                        if (val > 100 - siftLeft - 5) {
                          setSiftRight(val);
                          setSiftLeft(Math.max(0, 100 - val - 5));
                        } else {
                          setSiftRight(val);
                        }
                      } else {
                        if (val > 100 - climberLeft - 5) {
                          setClimberRight(val);
                          setClimberLeft(Math.max(0, 100 - val - 5));
                        } else {
                          setClimberRight(val);
                        }
                      }
                    }}
                    className={editMode === 'sift' ? 'slider-thumb-sift' : 'slider-thumb-climber'}
                    style={{
                      pointerEvents: "auto",
                      position: "absolute",
                      top: -25,
                      left: 0,
                      width: "100%",
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
                    width: 16, // offset for slider thumb
                    height: renderedVideoHeight,
                    zIndex: 30,
                    transform: "rotate(90deg)",
                    transformOrigin: "top left",
                    pointerEvents: "none",
                  }}
                >
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={editMode === 'sift' ? siftTop : climberUp}
                    onChange={e => {
                      const val = Math.min(Number(e.target.value), 95);
                      if (editMode === 'sift') {
                        if (val > 100 - siftBottom - 5) {
                          setSiftTop(val);
                          setSiftBottom(Math.max(0, 100 - val - 5));
                        } else {
                          setSiftTop(val);
                        }
                      } else {
                        if (val > 100 - climberDown - 5) {
                          setClimberUp(val);
                          setClimberDown(Math.max(0, 100 - val - 5));
                        } else {
                          setClimberUp(val);
                        }
                      }
                    }}
                    className={editMode === 'sift' ? 'slider-thumb-sift' : 'slider-thumb-climber'}
                    style={{
                      pointerEvents: "auto",
                      position: "absolute",
                      top: 20,
                      left: 0,
                      width: renderedVideoHeight, // THIS SCALES WITH VIDEO
                      height: 8,
                      zIndex: 30,
                    }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={100 - (editMode === 'sift' ? siftBottom : climberDown)}
                    onChange={e => {
                      const val = Math.min(100 - Number(e.target.value), 95);
                      if (editMode === 'sift') {
                        if (val > 100 - siftTop - 5) {
                          setSiftBottom(val);
                          setSiftTop(Math.max(0, 100 - val - 5));
                        } else {
                          setSiftBottom(val);
                        }
                      } else {
                        if (val > 100 - climberUp - 5) {
                          setClimberDown(val);
                          setClimberUp(Math.max(0, 100 - val - 5));
                        } else {
                          setClimberDown(val);
                        }
                      }
                    }}
                    className={editMode === 'sift' ? 'slider-thumb-sift' : 'slider-thumb-climber'}
                    style={{
                      pointerEvents: "auto",
                      position: "absolute",
                      top: 5,
                      left: 0,
                      width: renderedVideoHeight, // THIS SCALES WITH VIDEO
                      height: 8,
                      zIndex: 30,
                    }}
                  />
                </div>
              </div>
              </div>
             </> 
            )}
            {/* Controls below video: SIFT/Climber toggle and checkboxes */}
            
            </div>
          </div>

      
      {/* ExtractPose on top of video/annotation UI */}
           
              <ExtractPose
                videoPath={videoPath}
                userName={userName}
                setLoading={setLoading}
                poseFilePath={poseFilePath}
                setPoseFilePath={setPoseFilePath}
                setSiftFilePath={setSiftFilePath}
                showSiftSliders={showSiftSliders}
                setShowSiftSliders={setShowSiftSliders}
                siftUp={siftTop}
                setSiftUp={setSiftTop}
                siftDown={siftBottom}
                setSiftDown={setSiftBottom}
                siftLeft={siftLeft}
                setSiftLeft={setSiftLeft}
                siftRight={siftRight}
                setSiftRight={setSiftRight}
                climberUp={climberUp}
                setClimberUp={setClimberUp}
                climberDown={climberDown}
                setClimberDown={setClimberDown}
                climberLeft={climberLeft}
                setClimberLeft={setClimberLeft}
                climberRight={climberRight}
                setClimberRight={setClimberRight}
                isStatic={isStatic}
                detectClimbers={detectClimbers}
                multiplePeople={multiplePeople}
                style={{ width: '100%' }}
              />
       
         </>
      )}
      {/* Detection and S3 upload below */}
      {poseFilePath && !loading && videoUrl && (
        <ViewRefFrames
          poseFilePath={poseFilePath}
          siftFilePath={siftFilePath}
          setAutoRefFramePath={setAutoRefFramePath}
        />
      )}
      {poseFilePath && siftFilePath && !loading && showS3Upload && (
        <div className="parent-container parent-container-column" style={{ width: '100%', alignItems: 'flex-start', padding: '20px 0' }}>
          <UploadToS3
            poseFilePath={poseFilePath}
            siftFilePath={siftFilePath}
            userName={userName}
            setShowS3Upload={setShowS3Upload}
            autoRefFramePath={autoRefFramePath}
          />
        </div>
      )}
    </div>
    </>
  );
};

export default UploadVideo;