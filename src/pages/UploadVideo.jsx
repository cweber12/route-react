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
  const [showCropInfo, setShowCropInfo] = useState(false);
  const [showProcessInfo, setShowProcessInfo] = useState(false);
  // --- STATIC SIFT BOX STATE ---------------------------------
  const [showSiftSliders, setShowSiftSliders] = useState(false);
  const [siftLeft, setSiftLeft] = useState(10);
  const [siftRight, setSiftRight] = useState(10);
  const [siftTop, setSiftTop] = useState(10);
  const [siftBottom, setSiftBottom] = useState(10);
  // ------------------------------------------------------------
  const [frameWidth, setFrameWidth] = useState(640);
  const [frameHeight, setFrameHeight] = useState(360);
  const [isStatic, setIsStatic] = useState(true);

  // --- CLIMBER BBOX STATE ---------------------------------
  const [editMode, setEditMode] = useState('sift'); // 'sift' or 'climber'
  const [climberLeft, setClimberLeft] = useState(35);
  const [climberRight, setClimberRight] = useState(35);
  const [climberUp, setClimberUp] = useState(35); // renamed from climberTop
  const [climberDown, setClimberDown] = useState(0); // renamed from climberBottom

  const videoRef = useRef(null);
  const [renderedVideoWidth, setRenderedVideoWidth] = useState(0);
  const [renderedVideoHeight, setRenderedVideoHeight] = useState(0);

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
            <div 
              className="parent-container parent-container-column" 
              style={{ 
                width: '100%', 
                alignItems: 'flex-start', 
                justifyContent: 'center',
                color: "white"
              }}
            >
              <p style={{margin: 0, fontSize: 20}}>Upload from your device</p>
              <Upload setVideoPath={setVideoPath} setVideoUrl={setVideoUrl} />
              <p style={{margin: 0, fontSize: 20}}>
                Find a video on YouTube
                <a
                  href="https://www.youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img 
                    src="/assets/link.png" 
                    alt="YouTube Link" 
                    style={{ width: 20, height: 20, marginLeft: 10 }}
                  />
                </a>
              </p>
              <DownloadYouTube
                onDownloadComplete={(path) => {
                  setVideoPath(path);
                }}
                setVideoUrl={setVideoUrl}
              />
            </div>
          </>
        )}
        {videoPath && (
          <>
            <div 
              className="parent-container parent-container-row"
              style={{alignItems: "center"}}
            >
              <h2 className="page-header" style={{width: "100%"}}>
                SET DETECTION AREAS
                <img
                  src="/assets/info.png"
                  alt="Crop Info"
                  onClick={() => setShowCropInfo(!showCropInfo)}
                  className="info-icon"
                  style={{marginLeft: "20px"}}
                />
              </h2>
            </div>
            {showCropInfo && (
              <div style={{maxWidth: "600px"}}>
                <p style={{margin: "10px 0px", fontSize: 18, color: '#ccc'}}>
                  Use the sliders to adjust the detection areas for the video.
                </p>
                <p style={{margin: "10px 0px", fontSize: 18, color: '#ccc'}}>
                  <strong>Crop Route: </strong>
                  Adjust the sliders to define where background features are detected. The crop 
                  should only contain rock features for the route and should exclude features like 
                  trees, ground, or sky.
                </p>
                <p style={{margin: "10px 0px", fontSize: 18, color: '#ccc'}}>
                  <strong>Crop Climber: </strong> 
                  Adjust the sliders to define the area where climber is detected.
                  It should be set to contain the climbers entire body in the current position 
                  and the next 1-2 moves.
                </p>
              </div>
            )}

            <div className="parent-container parent-container-row">
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
                }}
              >
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
              <div 
                className="parent-container parent-container-column" 
                style={{ 
                  alignItems: 'flex-start', 
                  flex: 1, 
                  width: '100%'
                }}
              >
                {videoUrl && (
                  <>
                    <div 
                      style={{ 
                        padding: "50px 20px 20px 50px", 
                        background: "linear-gradient(90deg, rgb(11, 29, 40), rgba(11, 29, 40, 0.5))",
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'flex-start', 
                        width: 'auto', 
                        boxSizing: 'border-box',
                        borderRadius: 4,
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
                              top: -12,
                              left: 0,
                              width: "100%",
                              height: 8,
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
                              top: -30,
                              left: 0,
                              width: "100%",
                              height: 8,
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
                              top: 25,
                              left: 0,
                              width: renderedVideoHeight, // THIS SCALES WITH VIDEO
                              height: 8,
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
                              top: 7,
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

            <h2 className="page-header" style={{width: "100%"}}>
              SCAN VIDEO
              <img
                src="/assets/info.png"
                alt="Crop Info"
                onClick={() => setShowProcessInfo(!showProcessInfo)}
                className="info-icon"
                style={{marginLeft: "20px"}}
              />
            </h2>
            {showProcessInfo && (
              <div style={{maxWidth: "600px"}}>
                <p style={{margin: "10px 0px", fontSize: 18, color: '#ccc'}}>
                  Select the pose detection model
                </p>
                <ul style={{margin: "10px 0px", fontSize: 18, color: '#ccc'}}>
                  <li>MediaPipe Lite: Fast, but less accurate. Good for videos where the climber is close to the camera.</li>
                  <li>MediaPipe Full: Slower, but more accurate. Best for videos with climbers at various distances.</li>
                  <li>MediaPipe Heavy: Very accurate, but requires more processing power. Use for high quality videos.</li>
                </ul>
                <p style={{margin: "10px 0px", fontSize: 18, color: '#ccc'}}>
                  Click the settings button for additional adjustment options.
                </p>
                <ul style={{margin: "10px 0px", fontSize: 18, color: '#ccc'}}>
                  <li>Detection Rate: Process every N frames</li>
                  <li>Detected Features: Number of Background features detected. Increases accuracy and memory use</li>
                  <li>Enhance Contrast: Implements 
                    <a href="https://docs.opencv.org/4.x/d5/daf/tutorial_py_histogram_equalization.html">
                      Contrast Limited Histogram Equalization
                    </a>
                  </li>
                  <li>Sharpen: Applies a
                    <a href="https://medium.com/@boelsmaxence/introduction-to-image-processing-filters-179607f9824a">
                      sharpening filter
                    </a>
                    to enhance edges.</li>
                  <li>Adjust Brightness: Adjusts
                    <a href="https://learnopengl.com/Advanced-Lighting/Gamma-Correction">
                      gamma correction
                    </a>.
                  </li>
                </ul>
              </div>
            )}
            {/* ExtractPose on top of video/annotation UI */}
            <ExtractPose
              videoPath={videoPath}
              userName={userName}
              setLoading={setLoading}
              setPoseFilePath={setPoseFilePath}
              setSiftFilePath={setSiftFilePath}
              showSiftSliders={showSiftSliders}
              setShowSiftSliders={setShowSiftSliders}
              siftUp={siftTop}
              siftDown={siftBottom}
              siftLeft={siftLeft}
              siftRight={siftRight}
              climberUp={climberUp}
              climberDown={climberDown}
              climberLeft={climberLeft}
              climberRight={climberRight}
              isStatic={isStatic}
            />
          </>
        )}

        {poseFilePath && !loading && videoUrl && (
          <ViewRefFrames
            poseFilePath={poseFilePath}
            siftFilePath={siftFilePath}
            setAutoRefFramePath={setAutoRefFramePath}
          />
        )}

        {poseFilePath && siftFilePath && !loading && showS3Upload && (
          <div className="parent-container parent-container-column" >
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