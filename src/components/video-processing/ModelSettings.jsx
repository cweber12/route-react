// src/components/video-processing/ModelSettings.jsx
// Component for adjusting model and image processing settings
import "../../App.css";

const ModelSettings = ({
  // Process every n-th frame 
  frameSampleRate,
  setFrameSampleRate,
  // Number of SIFT features to detect
  siftNFeatures,
  setSiftNFeatures,
  // CLAHE parameters
  enhanceContrast,
  setEnhanceContrast,
  clipLimit,
  setClipLimit,
  tileGridSize,
  setTileGridSize,
  // Image sharpening
  sharpenImage,
  setSharpenImage,
  kernelEdge, 
  setKernelEdge,
  kernelCenter,
  setKernelCenter,
  // Brightness adjustment
  adjustBrightness,
  setAdjustBrightness,
  gamma,
  setGamma, 

}) => {

  return (
    <>
      {/* Additional Settings Tab */}
      <h3 style={{margin: 0}}>Settings</h3>

      {/* Frame Sampling Rate */}
      <div className="nested-container nested-row">
        <input
          type="number"
          step="1"
          min="1"
          value={frameSampleRate}
          onChange={(e) => setFrameSampleRate(parseInt(e.target.value))}
          style={{height: "30px"}}
        />
        <label> Detection Rate</label>
      </div>

      {/* Number of SIFT Features to Detect */}
      <div className="nested-container nested-row">
        <input
          type="number"
          step="50"
          min="50"
          value={siftNFeatures}
          onChange={(e) => setSiftNFeatures(parseInt(e.target.value))}
          style={{height: "30px"}}
        />
        <label> Detected Features</label>
      </div>

      {/* CLAHE Contrast Enhancement Checkbox */}
      <div className="nested-container nested-row">
        <input
          type="checkbox"
          style={{marginRight: 10, width: 20, height: 20}}
          checked={enhanceContrast}

          onChange={(e) => setEnhanceContrast(e.target.checked)}
        />
        <label>Enhance contrast</label>
      </div>

      {/* CLAHE Parameters */}
      {enhanceContrast && (
        <>
          <div className="nested-container nested-row">
            <input
              type="number"
              step="1"
              min="1"
              value={clipLimit}
              onChange={(e) => setClipLimit(parseInt(e.target.value))}
            />
            <label>Clip Limit</label>
          </div>

          <div className="nested-container nested-row">
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

      {/* Image Sharpening Checkbox */}
      <div className="nested-container nested-row">
        <input
          type="checkbox"
          style={{marginRight: 10, width: 20, height: 20}}
          checked={sharpenImage}
          onChange={(e) => setSharpenImage(e.target.checked)}
        />
        <label>Sharpen</label>
      </div>

      {/* Sharpening Kernel Parameters */}
      {sharpenImage && (
        <>
          <div className="nested-container nested-row">
            <input
              type="number"
              step="0.01"
              min="-3.0"
              value={kernelEdge}
              onChange={(e) => setKernelEdge(parseFloat(e.target.value))}
            />
            <label>Edge</label>
          </div>
          <div className="nested-container nested-row">
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

      {/* Brightness Adjustment Checkbox */}
      <div className="nested-container nested-row">
        <input
          type="checkbox"
          style={{marginRight: 10, width: 20, height: 20}}
          checked={adjustBrightness}
          onChange={(e) => setAdjustBrightness(e.target.checked)}
        />
        <label>Adjust Brightness</label>
      </div>

      {/* Brightness Adjustment Parameters */}
      {adjustBrightness && (
        <div className="nested-container nested-row">
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
