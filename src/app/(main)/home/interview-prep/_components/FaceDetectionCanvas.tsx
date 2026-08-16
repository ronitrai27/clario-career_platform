"use client";
import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "@vladmandic/face-api";
import { LuShieldAlert, LuTriangleAlert, LuUserCheck, LuUserX } from "react-icons/lu";
import { toast } from "sonner";

interface FaceDetectionCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isCameraOn: boolean;
  isCallActive?: boolean;
  onAutoEnd?: () => void;
  onFaceCountChange?: (count: number) => void;
}

export const FaceDetectionCanvas: React.FC<FaceDetectionCanvasProps> = ({
  videoRef,
  isCameraOn,
  isCallActive = true,
  onAutoEnd,
  onFaceCountChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [faceCount, setFaceCount] = useState<number>(0);
  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(true);
  const [modelError, setModelError] = useState<string | null>(null);

  // Track violations: 0 = clean, 1 = warning issued, 2 = terminated
  const [violationCount, setViolationCount] = useState<number>(0);
  const firstViolationTimeRef = useRef<number | null>(null);
  const isTerminatingRef = useRef<boolean>(false);

  // Load TinyFaceDetector model once on mount
  useEffect(() => {
    let isMounted = true;
    const loadModels = async () => {
      try {
        setIsLoadingModel(true);
        const MODEL_URL =
          "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        if (isMounted) {
          setIsLoadingModel(false);
        }
      } catch (err: any) {
        console.error("Failed to load face detection model:", err);
        if (isMounted) {
          setModelError("Failed to initialize AI face detection model");
          setIsLoadingModel(false);
        }
      }
    };

    loadModels();
    return () => {
      isMounted = false;
    };
  }, []);

  // Multi-Face Violation Enforcement Logic
  useEffect(() => {
    if (!isCallActive || faceCount <= 1 || isTerminatingRef.current) return;

    const now = Date.now();

    if (violationCount === 0) {
      // First detection of 2nd person -> Issue Warning 1 immediately
      setViolationCount(1);
      firstViolationTimeRef.current = now;
      toast.error("⚠️ PROCTORING WARNING (1/2): Multiple Faces Detected!", {
        description: (
          <span className="text-black font-semibold text-xs md:text-sm block mt-1" style={{ color: "#000000" }}>
            Please ensure you are alone during the interview session. A second violation will automatically terminate the interview.
          </span>
        ),
        duration: 6000,
      });
    } else if (violationCount === 1) {
      // If 2nd violation occurs (either 2nd person returned OR stayed > 3s after 1st warning)
      const timeSinceFirstViolation = firstViolationTimeRef.current
        ? now - firstViolationTimeRef.current
        : 0;

      if (timeSinceFirstViolation > 3000) {
        isTerminatingRef.current = true;
        setViolationCount(2);
        toast.error("🚨 SECURITY VIOLATION (2/2): Multiple Faces Detected Again!", {
          description: (
            <span className="text-black font-semibold text-xs md:text-sm block mt-1" style={{ color: "#000000" }}>
              Interview session is being automatically ended due to proctoring security rules.
            </span>
          ),
          duration: 6000,
        });

        if (onAutoEnd) {
          onAutoEnd();
        }
      }
    }
  }, [faceCount, violationCount, isCallActive, onAutoEnd]);

  // Fast Detection Loop (every 200ms for instant multi-face detection)
  useEffect(() => {
    if (!isCameraOn || isLoadingModel || modelError) return;

    let intervalId: NodeJS.Timeout;
    let isDetecting = false;

    const detect = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (
        video &&
        canvas &&
        video.readyState >= 2 &&
        !video.paused &&
        !video.ended
      ) {
        if (!isDetecting) {
          isDetecting = true;
          try {
            const displaySize = {
              width: video.clientWidth || video.videoWidth || 640,
              height: video.clientHeight || video.videoHeight || 480,
            };

            if (
              canvas.width !== displaySize.width ||
              canvas.height !== displaySize.height
            ) {
              faceapi.matchDimensions(canvas, displaySize);
            }

            const options = new faceapi.TinyFaceDetectorOptions({
              inputSize: 224, // Optimized resolution for fast & precise multi-face detection
              scoreThreshold: 0.35, // Sensitive threshold for instant detection of 2nd person
            });

            const detections = await faceapi.detectAllFaces(video, options);
            const count = detections.length;

            setFaceCount(count);
            if (onFaceCountChange) {
              onFaceCountChange(count);
            }

            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);

              const resizedDetections = faceapi.resizeResults(
                detections,
                displaySize
              );

              // Highlight total canvas frame in vibrant red when multiple faces detected
              if (count > 1) {
                ctx.strokeStyle = "#ef4444";
                ctx.lineWidth = 10;
                ctx.strokeRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = "rgba(239, 68, 68, 0.12)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
              }

              resizedDetections.forEach((det, idx) => {
                const { x, y, width, height } = det.box;

                const isMultiple = count > 1;
                const strokeColor = isMultiple ? "#ef4444" : "#22c55e";

                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = 4;
                ctx.strokeRect(x, y, width, height);

                ctx.fillStyle = strokeColor;
                const labelText = isMultiple
                  ? idx === 0
                    ? "Candidate"
                    : `Unauthorized Person #${idx}`
                  : "Candidate Verified";
                ctx.font = "bold 13px sans-serif";
                const textWidth = ctx.measureText(labelText).width;

                ctx.fillRect(x, Math.max(0, y - 24), textWidth + 14, 24);

                ctx.fillStyle = "#ffffff";
                ctx.fillText(labelText, x + 7, Math.max(16, y - 7));
              });
            }
          } catch (e) {
            console.error("Face detection loop error:", e);
          } finally {
            isDetecting = false;
          }
        }
      }
    };

    intervalId = setInterval(detect, 200);

    return () => {
      if (intervalId) clearInterval(intervalId);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [isCameraOn, isLoadingModel, modelError, videoRef, onFaceCountChange]);

  if (!isCameraOn) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Real-Time Security Badge Status Overlay */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
        {faceCount > 1 && (
          <div className="bg-red-600/95 backdrop-blur text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-xl animate-bounce border border-red-400">
            <LuShieldAlert className="w-4 h-4 text-white" />
            <span>
              Multiple Faces Detected ({faceCount}) - Security Warning {violationCount > 0 ? `(${violationCount}/2)` : ""}
            </span>
          </div>
        )}

        {faceCount === 1 && (
          <div className="bg-emerald-600/90 backdrop-blur text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-md">
            <LuUserCheck className="w-4 h-4" />
            <span>
              Candidate Verified (1 Face) {violationCount === 1 ? " (1 Warning Recorded)" : ""}
            </span>
          </div>
        )}

        {violationCount === 1 && faceCount <= 1 && (
          <div className="bg-amber-600/90 backdrop-blur text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-md">
            <LuTriangleAlert className="w-4 h-4 text-amber-200" />
            <span>Warning 1/2 Active - Next violation ends interview</span>
          </div>
        )}

        {faceCount === 0 && !isLoadingModel && (
          <div className="bg-amber-500/90 backdrop-blur text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-md">
            <LuUserX className="w-4 h-4" />
            <span>No Candidate Detected in Camera</span>
          </div>
        )}

        {isLoadingModel && (
          <div className="bg-gray-900/80 backdrop-blur text-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span>Initializing Face AI Guard...</span>
          </div>
        )}
      </div>

      {/* Prominent Bottom Full-Width Red Security Alert Bar */}
      {faceCount > 1 && (
        <div className="absolute bottom-0 inset-x-0 z-20 bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white font-bold py-2.5 px-4 text-xs md:text-sm text-center flex items-center justify-center gap-2 shadow-2xl animate-pulse border-t-2 border-red-400">
          <LuShieldAlert className="w-5 h-5 text-white shrink-0 animate-bounce" />
          <span>
            🚨 SECURITY ALERT: MULTIPLE FACES DETECTED ({faceCount} FACES) — UNAUTHORIZED PERSON IN STREAM!
          </span>
        </div>
      )}
    </>
  );
};

