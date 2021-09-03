import React from "react";

const captureVideoFrame = async (video, format, quality) => {
  try {
    if (typeof video === "string") {
      video = document.getElementById(video);
    }

    format = format || "jpeg";
    quality = quality || 0.92;

    if (!video || (format !== "png" && format !== "jpeg")) {
      return false;
    }

    let canvas = document.createElement("CANVAS");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    canvas.getContext("2d").drawImage(video, 0, 0);

    let dataUri = canvas.toDataURL("image/" + format, quality);
    let data = dataUri.split(",")[1];
    let mimeType = dataUri.split(";")[0].slice(5);

    let bytes = window.atob(data);
    let buf = new ArrayBuffer(bytes.length);
    let arr = new Uint8Array(buf);

    for (let i = 0; i < bytes.length; i++) {
      arr[i] = bytes.charCodeAt(i);
    }

    let blob = new Blob([arr], { type: mimeType });
    return { blob: blob, dataUri: dataUri, format: format };
  } catch (e) {
    console.log("error while taking screenshort.", e);
  }
};

const LoadingVideoLabel = () => {
  return (
    <div className="video-overlay">
      <div className="loader-wrapper">
        <div className="loader-5 center mb-4">
          <span></span>
        </div>
        <span className="mt-3">Loading live view</span>
      </div>
    </div>
  );
};

const cameraLayout = [
  {
    x: 0,
    y: 0,
    w: 4,
    h: 10,
    minH: 10,
    minW: 4,
  },
  {
    x: 4,
    y: 0,
    w: 4,
    h: 10,
    minH: 10,
    minW: 4,
  },
  {
    x: 8,
    y: 0,
    w: 4,
    h: 10,
    minH: 10,
    minW: 4,
  },
  {
    x: 0,
    y: 10,
    w: 4,
    h: 10,
    minH: 10,
    minW: 4,
  },
  {
    x: 4,
    y: 10,
    w: 4,
    h: 10,
    minH: 10,
    minW: 4,
  },
  {
    x: 8,
    y: 10,
    w: 4,
    h: 10,
    minH: 10,
    minW: 4,
  },
  {
    x: 0,
    y: 12,
    w: 4,
    h: 10,
    minH: 10,
    minW: 4,
  },
  {
    x: 4,
    y: 12,
    w: 4,
    h: 10,
    minH: 10,
    minW: 4,
  },
  {
    x: 8,
    y: 12,
    w: 4,
    h: 10,
    minH: 10,
    minW: 4,
  },
  {
    x: 0,
    y: 16,
    w: 4,
    h: 10,
    minH: 10,
    minW: 4,
  },
  {
    x: 4,
    y: 16,
    w: 4,
    h: 10,
    minH: 10,
    minW: 4,
  },
  {
    x: 8,
    y: 16,
    w: 4,
    h: 10,
    minH: 10,
    minW: 4,
  },
];

export { cameraLayout, captureVideoFrame, LoadingVideoLabel };
