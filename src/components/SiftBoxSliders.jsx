import React from "react";

const SiftBoxSliders = ({
  isStatic,
  siftLeft, setSiftLeft,
  siftRight, setSiftRight,
  siftTop, setSiftTop,
  siftBottom, setSiftBottom,
  siftBoxWidth, setSiftBoxWidth,
  siftBoxHeight, setSiftBoxHeight,
}) => {
  // --- Handlers for static sliders ---
  const handleStaticSlider = (setter, value, min, max) => {
    setter(Math.max(min, Math.min(max, Number(value))));
  };

  return (
    <div>
      {isStatic ? (
        <>
          <p style={{textDecoration: "underline"}}>Adjust SIFT Detection Area (Static)</p>
          <div className="child-container child-container-column" style={{gap: "5px"}}>
            {/* Top */}
            <div className="child-container child-container-column" style={{ gap: "5px" }}>
              <label>Top (distance from border, %)</label>
              <input
                type="range"
                min={0}
                max={50}
                value={siftTop}
                onChange={e => handleStaticSlider(setSiftTop, e.target.value, 0, 50)}
                style={{ width: "200px" }}
              />
              <span>{siftTop.toFixed(1)}%</span>
            </div>
            {/* Bottom */}
            <div className="child-container child-container-column" style={{ gap: "5px" }}>
              <label>Bottom (distance from border, %)</label>
              <input
                type="range"
                min={0}
                max={50}
                value={siftBottom}
                onChange={e => handleStaticSlider(setSiftBottom, e.target.value, 0, 50)}
                style={{ width: "200px" }}
              />
              <span>{siftBottom.toFixed(1)}%</span>
            </div>
            {/* Left */}
            <div className="child-container child-container-column" style={{ gap: "5px" }}>
              <label>Left (distance from border, %)</label>
              <input
                type="range"
                min={0}
                max={50}
                value={siftLeft}
                onChange={e => handleStaticSlider(setSiftLeft, e.target.value, 0, 50)}
                style={{ width: "200px" }}
              />
              <span>{siftLeft.toFixed(1)}%</span>
            </div>
            {/* Right */}
            <div className="child-container child-container-column" style={{ gap: "5px" }}>
              <label>Right (distance from border, %)</label>
              <input
                type="range"
                min={0}
                max={50}
                value={siftRight}
                onChange={e => handleStaticSlider(setSiftRight, e.target.value, 0, 50)}
                style={{ width: "200px" }}
              />
              <span>{siftRight.toFixed(1)}%</span>
            </div>
          </div>
        </>
      ) : (
        <>
          <p style={{textDecoration: "underline"}}>Adjust SIFT Detection Area (Dynamic)</p>
          <div className="child-container child-container-column" style={{gap: "5px"}}>
            {/* Box Width */}
            <div className="child-container child-container-column" style={{ gap: "5px" }}>
              <label>Box Width (% of frame)</label>
              <input
                type="range"
                min={1}
                max={100}
                value={siftBoxWidth}
                onChange={e => handleStaticSlider(setSiftBoxWidth, e.target.value, 1, 100)}
                style={{ width: "200px" }}
              />
              <span>{siftBoxWidth.toFixed(1)}%</span>
            </div>
            {/* Box Height */}
            <div className="child-container child-container-column" style={{ gap: "5px" }}>
              <label>Box Height (% of frame)</label>
              <input
                type="range"
                min={1}
                max={100}
                value={siftBoxHeight}
                onChange={e => handleStaticSlider(setSiftBoxHeight, e.target.value, 1, 100)}
                style={{ width: "200px" }}
              />
              <span>{siftBoxHeight.toFixed(1)}%</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SiftBoxSliders;