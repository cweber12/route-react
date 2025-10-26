import "../../App.css";

const ImagePreview = ({
    imageFile,
    imageUrl,
    videoUrl,
    videoReady,
    selectedS3PathArray,
    userName,
    processing,
    imgRef,
    currentImageSrc,
    handleImageLoad,
    handleRenderedImgResize,
    setHover,
    hover,
    imgDims,
    siftLeft,
    siftUp,
    siftRight,
    siftDown,
    setSiftLeft,
    setSiftUp,
    setSiftRight,
    setSiftDown,
    renderedImgDims,
    lineColor,
    pointColor,
    setLineColor,
    setPointColor,
    progress
}) => {

    return (
        <>
            {!videoUrl && imageFile && userName === "Demo" && !processing && (
                <div className="instructions">
                    <p>Move the sliders to highlight the route, then press "Scan Image"</p>
                </div>
            )}

            {selectedS3PathArray && selectedS3PathArray.length > 0 && (
            <div 
                className="parent-container parent-container-column"
                style={{
                alignItems:"center",
                justifyContent: "space-between",
                width: "100%", 
                }}
            >

                <div 
                    className="parent-container parent-container-column"
                    style={{
                    alignItems: "center", 
                    justifyContent: "center", 
                    width: "100%", 
                    maxWidth: "600px", 
                    }}
                >
                
                    {/* Display output video */}
                    {videoUrl && (
                    videoReady ? (
                        <video 
                        className="media" 
                        controls 
                        >
                        <source src={videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                        </video>
                    ) : (
                        <div 
                        style={{
                            color: 'chartreuse', 
                            padding: 0, 
                            textAlign: 'center', 
                            }}>
                        Generating video...
                        </div>
                    )
                    )}
            
                    {/* SIFT sliders and image preview */}
                    {imageFile && !videoUrl && !currentImageSrc && (
                    <div className="compare-image-preview-container">
                        <div style={{ position: "relative", maxWidth: 500, maxHeight: "600px", margin: "0" }}>
                        <img
                            ref={imgRef}
                            src={imageUrl}
                            alt="Selected"
                            style={{ width: "100%", height: "auto", display: "block", maxWidth: 500, maxHeight: "600px", borderRadius: "4px" }}
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
                                stroke="#85F71E"
                                strokeWidth="3"
                                rx="6"
                                style={{ filter: hover ? "drop-shadow(0 0 6px #85F71E)" : undefined, transition: "filter 0.2s" }}
                                />
                            );
                            })()}
                        </svg>
                        
                        <div
                            style={{
                            position: "absolute",
                            top: -12,
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
                                top: -30,
                                left: 0,
                                width: "100%", // always match rendered image width
                                height: 8,
                                zIndex: 30,
                            }}
                            />
                        </div>
                        
                        <div
                            style={{
                            position: "absolute",
                            top: 0,
                            left: -5,
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
                                top: 25,
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
            
            {imageFile && !videoUrl && !currentImageSrc && (
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', margin: '0', justifyContent: 'flex-start' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 500, color: 'white' }}>Line Color:</span>
                <input
                    type="color"
                    value={lineColor}
                    onChange={e => setLineColor(e.target.value)}
                    style={{ width: 32, height: 32, border: 'none', background: 'none', cursor: 'pointer' }}
                    title="Select pose skeleton line color"
                />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 500, color: 'white' }}>Point Color:</span>
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

            {currentImageSrc && !videoUrl && (
            <img
                src={currentImageSrc}
                alt="Current pose frame"
                style={{ maxWidth: "100%", borderRadius: 4 }}
            />
            )}

            {processing && (
                <div style={{ width: "100%", maxWidth: 600, margin: "12px 0", textAlign: "center", color: "white" }}>
                    <div style={{ marginBottom: 8, fontWeight: 600}}>Progress: {Math.round(progress)}%</div>
                    <div style={{background: "none",height: 12, borderRadius: 6, overflow: "hidden" }}>
                        <div style={{ width: `${progress}%`, height: "100%", background: "#85F71E", transition: "width 400ms ease" }} />
                    </div>
                </div>
            )}
                </div>
            </div>
        )}
        </>
    );
};

export default ImagePreview;