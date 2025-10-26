import React, { useState, useEffect, useRef} from "react";
import "../App.css";
import ExtractPose from "../components/video-processing/ExtractPose.jsx";
import DownloadYouTube from "../components/upload/DownloadYouTube.jsx";
import Upload from "../components/upload/Upload.jsx";
import ViewRefFrames from "../components/video-processing/ViewRefFrames.jsx";
import UploadToS3 from "../components/s3/UploadToS3.jsx";



const ScanVideo = () => {
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
      <div 
        className="page-container" 
        style={{
          marginTop: !videoPath ? '20vh' : '0px',
          paddingTop: !videoPath ? '20px' : '0px',
          
        }}
      >
        {!videoPath && (
          <>
            <div className="nested-container column">
              <p style={{margin: 0}}>Upload from your device</p>
              <Upload setVideoPath={setVideoPath} setVideoUrl={setVideoUrl} />
              <p style={{margin: 0}}>
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
            <div className="nested-container row">
              <div className="main-header">
              <h2>SET DETECTION AREAS</h2>
                
                <div
                  onClick={() => setShowCropInfo(!showCropInfo)}
                  className="info-icon"
                  role="button"
                  tabIndex={0}
                  aria-label="Crop Info"
                />
                </div>

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

            <div className="nested-container row">
              <button
                onClick={() => setEditMode('sift')}
                style={{
                  background: editMode === 'sift' ? '' : '#eee',
                  color: editMode === 'sift' ? '' : '#222',
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
                  background: editMode === 'climber' ? '' : '#eee',
                  color: editMode === 'climber' ? '' : '#222',
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
                  color: 'white',
                  height: 30
                }}
              >
                <input
                  type="checkbox"
                  checked={isStatic}
                  style={{ 
                    marginRight: 0, 
                    width: 30, 
                    height: 30,
                  }}
                  onChange={e => setIsStatic(e.target.checked)}
                />
                Static Video? 
              </label>
            </div>
            <div className="nested-container row">
              {/* Video, SVG, sliders column */}
              <div 
                className="nested-container column" 
                style={{ alignItems: 'flex-start', flex: 1, width: '100%' }}
              >
                {videoUrl && (
                  <>
                    <div className="video-processing-container">
                      <div className="video-wrapper-container">
                        {/* Content box with border for slider alignment */}
                        <div
                          className="video-overlay-container"
                          style={{
                            width: renderedVideoWidth,
                            height: renderedVideoHeight,
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
                            stroke="chartreuse"
                            strokeWidth="3"
                          />
                        </svg>
                        {/* Horizontal dual-thumb slider on top border */}
                        <div
                          style={{
                            position: "absolute",
                            top: -10,
                            left: 0,
                            width: "100%",
                            height: 16, 
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
                              top: 26,
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
                              top: 8,
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
              </div>
            </div>

            <div className="main-header">
              <h2>SCAN VIDEO</h2>
              <span
                onClick={() => setShowProcessInfo(!showProcessInfo)}
                className="info-icon"
                style={{marginLeft: "20px"}}
                role="button"
                tabIndex={0}
                aria-label="Process Info"
              />
            </div>
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

            {poseFilePath && !loading && videoUrl && (
              <ViewRefFrames
                poseFilePath={poseFilePath}
                siftFilePath={siftFilePath}
                setAutoRefFramePath={setAutoRefFramePath}
              />
            )}

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

        {poseFilePath && siftFilePath && !loading && showS3Upload && (
          <>
            <div className="main-header">
              <h2>SAVE ROUTE DATA</h2>
            </div>
            <div className="nested-container column">
              <UploadToS3
                poseFilePath={poseFilePath}
                siftFilePath={siftFilePath}
                userName={userName}
                setShowS3Upload={setShowS3Upload}
                autoRefFramePath={autoRefFramePath}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ScanVideo;