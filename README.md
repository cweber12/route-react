

# RouteMap Frontend

## Description

This is the frontend for the RouteMap application, built with React and Vite. It allows users to upload climbing route videos, process them for pose and feature detection, and view saved route data and images. The app integrates with an S3 bucket for storing images and route data, and communicates with a FastAPI backend for processing and data management.

---

## Setup

Before running the frontend, make sure you:

1. **Install dependencies:**

```bash
npm install
```

2. **Configure environment variables:**

- Copy `.env.example` to `.env` (if provided) and update API base URLs and any required keys.
- Example variables:

```env
VITE_API_BASE_URL_M=http://localhost:8000
VITE_API_BASE_URL_P=http://localhost:8000
```

3. **Start the backend server:**

- The frontend expects the FastAPI backend to be running on the URLs specified above.

4. **Build static assets (optional for production):**

```bash
npm run build
```

You are now ready to run the frontend!

## Uploading and Processing a Video

On the UploadVideo page, users can:

- Upload a climbing video from their device or download one from YouTube.
- Adjust detection areas for the route and climber using interactive sliders overlaid on the video.
- Select pose detection models and processing options (contrast, brightness, sharpening, etc.).
- Process the video to extract pose and feature data, which is then sent to the backend for analysis.
- Preview reference frames and save processed route data to S3.

**Workflow:**

1. Upload or select a video.
2. Adjust crop areas for route and climber.
3. Choose model and processing settings.
4. Click "Scan Video" to process.
5. Preview results and save to S3.

## Viewing Saved Routes

On the ViewRouteData page, users can:

- Browse saved routes and areas using a dropdown navigator and search bar.
- Select a route to view available timestamped images and data.
- Select images to compare route features and pose data.
- Use search suggestions to quickly find routes or areas.

**Workflow:**

1. Use the dropdown or search bar to select an area or route.
2. View and select timestamped images to pull pose and SIFT data stored in S3.
3. Find an image of the selected route
4. Select "Scan Image" to match stored SIFT features with detected features in the image.
5. Output video is generated to visualize the selected attempt

## Deploy to S3

This command uploads the contents of your local `dist` folder (the production build) to your S3 bucket (`routemap-react-app`). It will synchronize all files and remove any files from the bucket that no longer exist locally. Run this after building your frontend to update the live site.

```bash
aws s3 sync .\dist\ s3://routemap-react-app/ --delete
```
