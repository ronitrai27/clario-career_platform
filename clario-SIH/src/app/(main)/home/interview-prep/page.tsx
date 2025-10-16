"use client";
import { useEffect, useRef, useState } from "react";

const InterviewDefault = () => {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const [stream, setStream] = useState<MediaStream | null>(null);

//   const startCamera = async () => {
//     try {
//       const mediaStream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: "user" }, // "user" = front camera
//         audio: false,
//       });
//       if (videoRef.current) {
//         videoRef.current.srcObject = mediaStream;
//       }
//       setStream(mediaStream);
//     } catch (err) {
//       console.error("Camera access error:", err);
//     }
//   };

//   const stopCamera = () => {
//     if (stream) {
//       stream.getTracks().forEach((track) => track.stop());
//       setStream(null);
//     }
//     if (videoRef.current) {
//       videoRef.current.srcObject = null;
//     }
//   };

//   // optional: cleanup on unmount
//   useEffect(() => {
//     return () => stopCamera();
//   }, []);

  return (
    <div className="bg-gray-50 h-full w-full">
     
    </div>
  );
};

export default InterviewDefault;
