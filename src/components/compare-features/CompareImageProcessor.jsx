import React, { useState, useRef, useCallback } from "react";
import "../../App.css";
import ImagePreview from "./ImagePreview.jsx";

const CompareImageProcessor = ({ selectedS3PathArray }) => {
  const [imageFile, setImageFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [progress, setProgress] = useState(0); // Job progress (0-100%) 
  const [siftLeft, setSiftLeft] = useState(20);
  const [siftRight, setSiftRight] = useState(20);
  const [siftUp, setSiftUp] = useState(20);
  const [siftDown, setSiftDown] = useState(20);
  const [imgDims, setImgDims] = useState({ width: 640, height: 360 });
  const [renderedImgDims, setRenderedImgDims] = useState({ width: 0, height: 0 });
  const [hover, setHover] = useState(false);
  const userName = sessionStorage.getItem("userName");
  const [currentImageSrc, setCurrentImageSrc] = useState(null);

  // Add state for pose skeleton colors
  const [lineColor, setLineColor] = useState("#64ff00"); // default: 100,255,0
  const [pointColor, setPointColor] = useState("#0064ff"); // default: 0,100,255

  // Add state for built-in image selection
  const [selectedBuiltInImage, setSelectedBuiltInImage] = useState(null);

  const API = import.meta.env.VITE_API_BASE_URL_M;
  const imgRef = useRef(null);
  const fileInputRef = React.useRef();

  const fetchCurrentImage = async () => {
  try {
    const res = await fetch(`${API}/api/current-image`);
    const data = await res.json();
    if (data.image) {
      // Display the image using a data URL
      setCurrentImageSrc(`data:image/jpeg;base64,${data.image}`);
    } else {
      setCurrentImageSrc(null);
    }
  } catch (err) {
    console.error("Failed to fetch current image:", err);
    setCurrentImageSrc(null);
  }
};

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setImageFile(null);
    setSelectedBuiltInImage(null);
    setVideoUrl("");

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
    setProgress(0);
    try {
      // Step 1: Submit job
      const res = await fetch(`${API}/api/compare-image`, {
        method: "POST",
        body: formData,
      });
      console.log("compare-image response status:", res.status);
      const text = await res.text();
      console.log("compare-image response text:", text);
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        throw new Error("Backend did not return valid JSON");
      }
      const jobId = data.job_id;
      const statusUrl = `${API}${data.status_url}`;
      console.log("Parsed jobId:", jobId, "statusUrl:", statusUrl);
      if (!jobId) throw new Error("No job_id returned from backend");
      // Step 2: Poll for status
      let pollCount = 0;
      let videoUrlFound = null;
      while (pollCount < 120) { // up to 4 minutes
        pollCount++;
        await new Promise(r => setTimeout(r, 2000));
        let statusRes;
        try {
          statusRes = await fetch(statusUrl);
        } catch (err) {
          console.error("Error polling status:", err);
          continue;
        }
        if (!statusRes.ok) {
          console.warn("Status response not ok:", statusRes.status);
          continue;
        }
        let statusData;
        try {
          const statusText = await statusRes.text();
          console.log("Status response text:", statusText);
          statusData = JSON.parse(statusText);
        } catch (e) {
          console.error("Failed to parse status JSON:", e);
          throw new Error("Backend did not return valid status JSON");
        }

        if (statusData.progress) {
          setProgress(statusData.progress);
          fetchCurrentImage(); 
        }

        if (statusData.status === "success" && statusData.video_url) {
          videoUrlFound = `${API}${statusData.video_url}?t=${Date.now()}`;
          break;
        }
        if (statusData.status === "failed") {
          throw new Error("Video processing failed");
        }
      }
      if (!videoUrlFound) throw new Error("Timed out waiting for video");
      setVideoUrl(videoUrlFound);
      console.log("Video URL set to:", videoUrlFound);
    } catch (err) {
      console.error("Error processing image:", err);
      alert("Error processing image: " + (err.message || err));
    } finally {
      setProcessing(false);
      setCurrentImageSrc(null); // Clear current image when done
    }
  };

  // Handler for built-in image selection
  const handleBuiltInImageSelect = (e) => {
    const s3Uri = e.target.value;
    if (!s3Uri) return;
    setSelectedBuiltInImage(s3Uri);
    setImageFile(null);
    setVideoUrl("");
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
      } catch {
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
          <ImagePreview
              imageFile={imageFile}
              imageUrl={imageUrl}
              videoUrl={videoUrl}
              videoReady={videoReady}
              selectedS3PathArray={selectedS3PathArray}
              userName={userName}
              processing={processing}
              imgRef={imgRef}
              currentImageSrc={currentImageSrc}
              handleImageLoad={handleImageLoad}
              handleRenderedImgResize={handleRenderedImgResize}
              setHover={setHover}
              hover={hover}
              imgDims={imgDims}
              siftLeft={siftLeft}
              siftUp={siftUp}
              siftRight={siftRight}
              siftDown={siftDown}
              setSiftLeft={setSiftLeft}
              setSiftUp={setSiftUp}
              setSiftRight={setSiftRight}
              setSiftDown={setSiftDown}
              renderedImgDims={renderedImgDims}
              lineColor={lineColor}
              pointColor={pointColor}
              setLineColor={setLineColor}
              setPointColor={setPointColor}
              progress={progress}
          />
          
          { /* Display output video */}
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
          
          {!videoUrl && !imageFile && userName === "Demo" && !processing && (
            <div className="instructions"> 
              <p>Find an image of the selected route using the dropdown or file explorer</p>
            </div>
          )}

          <div className="compare-buttons-col" style={{width: videoUrl ? "inherit" : "100%"}}>

            {userName == "Demo" && (
              <select
                className="built-in-image-select"
                id="built-in-image-select"
                value={selectedBuiltInImage || ""}
                onChange={handleBuiltInImageSelect}
              >
                <option value="">DEMO IMAGES</option>
                <option value="s3://route-keypoints/sample-images/IronManTraverse.JPG">IronManTraverse.jpg</option>
                <option value="s3://route-keypoints/sample-images/KingAir2.jpg">KingAir.jpg</option>
                <option value="s3://route-keypoints/sample-images/MazeOfDeath2.jpg">MazeOfDeath.jpg</option>
                <option value="s3://route-keypoints/sample-images/midnight lightning yosemite.jpg">MidnightLightning.jpg</option>
                <option value="s3://route-keypoints/sample-images/moonraker3.jpg">Moonraker.jpg</option>
                <option value="s3://route-keypoints/sample-images/phantommenace.jpg">PhantomMenace.jpg</option>
                <option value="s3://route-keypoints/sample-images/AScannerDarkly2.jpg">ScannerDarkly_A.jpg</option>
                <option value="s3://route-keypoints/sample-images/Slashface3.png">Slashface.png</option> 
              </select>
            )}

            <label 
              htmlFor="image-upload" 
              className="button-label"
            >Image Files</label>

            <input
              id="image-upload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
              ref={fileInputRef}
            />

            {imageFile || selectedBuiltInImage ? (
              <button
                onClick={handleProcess}
                disabled={processing || (!imageFile && !selectedBuiltInImage)}
              >{processing ? "Scanning..." : "Scan Image"}</button>
            ) : null}
          </div>
        </div> 
      )}
    </>
  );
};

export default CompareImageProcessor;
