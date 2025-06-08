import React, {useState} from "react";
import ClaheSettingsTable from "./ClaheSettingsTable";

import "../App.css";

const ModelSettings = ({
  /* Process every n-th frame */
  frameSampleRate,
  setFrameSampleRate,
  
  /* SIFT parameters */
  /* Number of features to detect */
  siftNFeatures,
  setSiftNFeatures,
  
  /* Notifies backend to process with manually
     input CLAHE parameters (tileGridSize, clipLimit) */
  enhanceContrast,
  setEnhanceContrast,
  clipLimit,
  setClipLimit,
  tileGridSize,
  setTileGridSize,

  sharpenImage,
  setSharpenImage,
  kernelEdge, 
  setKernelEdge,
  kernelCenter,
  setKernelCenter,

  /* Notify backend to use auto preprocessing
     (CLAHE, sharpen, gamma) */
  preprocess, 
  setPreprocess,

  adjustBrightness,
  setAdjustBrightness,
  gamma,
  setGamma, 

  /* New props for climber detection settings */
  detectClimbers,
  setDetectClimbers,
  multiplePeople,
  setMultiplePeople,

}) => {

  const [showClahe, setShowClahe] = useState(false);


  return (
    <>
      {/* Additional Detection Settings */}
      <h3 style={{margin: 0}}>Settings</h3>
      <div className="child-container nested-row">
        <input
          type="number"
          step="1"
          min="1"
          value={frameSampleRate}
          onChange={(e) => setFrameSampleRate(parseInt(e.target.value))}
          style={{height: "30px"}}
        />
        <label>Detect Every N Frames</label>
      </div>
      <div className="child-container nested-row">
        <input
          type="number"
          step="50"
          min="50"
          value={siftNFeatures}
          onChange={(e) => setSiftNFeatures(parseInt(e.target.value))}
          style={{height: "30px"}}
        />
        <label> Num BG Features</label>
      </div>

      {/* New: Climber detection checkboxes */}
      <div className="child-container nested-row">
        <input
          type="checkbox"
          checked={detectClimbers}
          style={{ marginRight: 10, width: 20, height: 20 }}
          onChange={e => setDetectClimbers(e.target.checked)}
        />
        <label>Climber Far From Camera</label>
      </div>
      <div className="child-container nested-row">
        <input
          type="checkbox"
          checked={multiplePeople}
          style={{ marginRight: 10, width: 20, height: 20 }}
          onChange={e => setMultiplePeople(e.target.checked)}
        />
        <label>Multiple People in Frame</label>
      </div>

      <div className="child-container nested-row">
        <input
          type="checkbox"
          style={{marginRight: 10, width: 20, height: 20}}
          checked={enhanceContrast}
          disabled={preprocess}
          onChange={(e) => setEnhanceContrast(e.target.checked)}
        />
        <label>Enhance contrast</label>
      </div>
      {enhanceContrast && (
        <>
          <div className="child-container nested-row">
            <input
              type="number"
              step="1"
              min="1"
              value={clipLimit}
              onChange={(e) => setClipLimit(parseInt(e.target.value))}
            />
            <label>Clip Limit</label>
          </div>

          <div className="child-container nested-row">
            <input
              type="number"
              step="1"
              min="1"
              value={tileGridSize}
              onChange={(e) => setTileGridSize(parseInt(e.target.value))}
            />
            <label> Grid Size</label>
          </div>
        </>
      )}


      <div className="child-container nested-row">
        <input
          type="checkbox"
          style={{marginRight: 10, width: 20, height: 20}}
          checked={sharpenImage}
          disabled={preprocess}
          onChange={(e) => setSharpenImage(e.target.checked)}
        />
        <label>Sharpen</label>
      </div>

      {sharpenImage && (
        <>
        <div className="child-container nested-row">
        <input
          type="number"
          step="0.01"
          min="-3.0"
          value={kernelEdge}
          onChange={(e) => setKernelEdge(parseFloat(e.target.value))}
        />
        <label>Edge</label>
      </div>

      <div className="child-container nested-row">
        <input
          type="number"
          step="0.01"
          min="0.0"
          value={kernelCenter}
          onChange={(e) => setKernelCenter(parseFloat(e.target.value))}
        />
        <label>Center</label>
      </div>
      </>
      )}


      <div className="child-container nested-row">
        <input
          type="checkbox"
          style={{marginRight: 10, width: 20, height: 20}}
          checked={adjustBrightness}
          disabled={preprocess}
          onChange={(e) => setAdjustBrightness(e.target.checked)}
        />
        <label>Adjust Brightness</label>
      </div>

      
      {adjustBrightness && (

        <div className="child-container nested-row">
        <input
          type="number"
          step="0.1"
          min="0.0"
          value={gamma}
          onChange={(e) => setGamma(parseFloat(e.target.value))}
        />
        <label>Gamma</label>
      </div>

      )}


     
      
        
        
        
   
    </>
  );
};

export default ModelSettings;
