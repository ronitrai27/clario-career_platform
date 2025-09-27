/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useUserData } from "@/context/UserDataProvider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ImageKitUploadResponse {
  url: string;
  fileId: string;
  name: string;
  size: number;
}

interface SavedVideo {
  id: number;
  url: string;
}

interface AuthParams {
  token: string;
  expire: number;
  signature: string;
}

export default function VideoUpload() {
  const supabase = createClient();
  const { mentor } = useUserData();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAuthParams = async (): Promise<AuthParams> => {
    const res = await fetch("/api/upload-auth");
    if (!res.ok) {
      throw new Error("Failed to get upload auth params");
    }
    return res.json();
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      alert("Please select a video file.");
      return;
    }

    try {
      // Fetch server-generated auth params
      const auth = await getAuthParams();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append(
        "publicKey",
        process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!
      );
      formData.append("folder", "/videos");
      formData.append("token", auth.token);
      formData.append("expire", auth.expire.toString());
      formData.append("signature", auth.signature);

      setStatus("uploading");
      setProgress(0);

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setProgress((event.loaded / event.total) * 100);
        }
      };

      const response = await new Promise<ImageKitUploadResponse>(
        (resolve, reject) => {
          xhr.open("POST", "https://upload.imagekit.io/api/v1/files/upload");
          xhr.onload = () => {
            const data = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(data);
            } else {
              reject(new Error(data.message || "Upload failed"));
            }
          };
          xhr.onerror = () => reject(new Error("Network error during upload"));
          xhr.send(formData);
        }
      );

      const videoUrl = response.url; // e.g., https://ik.imagekit.io/njct5p6w6/videos/my-video.mp4

      const { error } = await supabase
        .from("mentors")
        .update({ video_url: videoUrl })
        .eq("id", mentor?.id);

      if (error) throw error;

      console.log("Uploaded video URL saved in Supabase:", videoUrl);
      toast.success("Video uploaded successfully!");

      setStatus("success");
    } catch (err) {
      console.error("Upload error:", err);
      setStatus("error");
    }
  };

  return (
    <div>
      {/* <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleUpload}
        placeholder="Upload a video"
        // className=""
      /> */}
      <div className="grid w-full max-w-sm items-center gap-3">
        <Label htmlFor="file">Upload Video</Label>
        <Input id="file" type="file" accept="video/*" onChange={handleUpload} ref={fileInputRef} />
      </div>
      {status === "uploading" && <div>Progress: {Math.round(progress)}%</div>}
      {status === "success" && (
        <div>Upload complete! Check console for URL.</div>
      )}
      {status === "error" && <div>Error occurred. Try again.</div>}
    </div>
  );
}
