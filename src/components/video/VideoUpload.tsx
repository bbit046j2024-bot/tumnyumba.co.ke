"use client";

import { useState, useRef } from "react";
import { Video, UploadCloud, X, Loader2, CheckCircle2, Play, AlertCircle } from "lucide-react";

interface VideoUploadProps {
  videoUrl: string | null;
  videoPublicId: string | null;
  onChange: (data: { url: string; publicId: string } | null) => void;
  disabled?: boolean;
}

export default function VideoUpload({
  videoUrl,
  videoPublicId,
  onChange,
  disabled = false,
}: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate video type
    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file (MP4, WebM, MOV).");
      return;
    }

    // Limit to 100MB
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Video size must be less than 100MB.");
      return;
    }

    setError("");
    setUploading(true);
    setProgress(5);

    try {
      // 1. Fetch authentication parameters from our backend
      const authRes = await fetch("/api/imagekit/auth");
      if (!authRes.ok) {
        throw new Error("Could not authenticate with ImageKit. Please try again.");
      }
      const authData = await authRes.json();
      const { token, expire, signature, publicKey } = authData;

      // 2. Prepare upload to ImageKit
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", `walkthrough_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`);
      formData.append("publicKey", publicKey);
      formData.append("signature", signature);
      formData.append("expire", expire.toString());
      formData.append("token", token);
      formData.append("folder", "/campuskey/properties/videos");
      formData.append("useUniqueFileName", "true");

      // 3. Upload using XMLHttpRequest to get real upload progress
      await new Promise<{ url: string; fileId: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "https://upload.imagekit.io/api/v1/files/upload");

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setProgress(Math.min(95, percent));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText);
              setProgress(100);
              resolve({
                url: res.url,
                fileId: res.fileId,
              });
            } catch (err) {
              reject(new Error("Invalid response from video server."));
            }
          } else {
            try {
              const errRes = JSON.parse(xhr.responseText);
              reject(new Error(errRes.message || "Failed to upload video."));
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        };

        xhr.onerror = () => reject(new Error("Network connection error during video upload."));
        xhr.send(formData);
      }).then((result) => {
        // Delete previous video if existed
        if (videoPublicId) {
          fetch("/api/imagekit/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileId: videoPublicId }),
          }).catch(console.error);
        }

        onChange({
          url: result.url,
          publicId: result.fileId,
        });
      });
    } catch (err: any) {
      console.error("[VideoUpload] Error:", err);
      setError(err?.message || "Failed to upload video. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    if (disabled || uploading) return;
    if (!confirm("Are you sure you want to remove this video walkthrough?")) return;

    if (videoPublicId) {
      fetch("/api/imagekit/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: videoPublicId }),
      }).catch(console.error);
    }

    onChange(null);
    setProgress(0);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <Video className="w-4 h-4 text-primary-600" /> Property Video Walkthrough (Optional)
          </label>
          <p className="text-[11px] text-gray-500">
            Upload an MP4 or WebM video showing the interior, room layout, and compound (max 100MB).
          </p>
        </div>
        {videoUrl && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Video attached
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {videoUrl ? (
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-black aspect-video max-w-xl group shadow-sm">
          <video
            src={videoUrl}
            controls
            preload="metadata"
            className="w-full h-full object-contain"
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled || uploading}
            title="Remove video"
            className="absolute top-3 right-3 bg-red-600/90 hover:bg-red-700 text-white p-2 rounded-xl backdrop-blur-sm transition-all shadow-md flex items-center gap-1 text-xs font-semibold"
          >
            <X className="w-4 h-4" /> Remove Video
          </button>
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
            className="hidden"
            onChange={handleFileSelect}
            disabled={disabled || uploading}
          />

          <div
            onClick={() => !uploading && !disabled && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              uploading
                ? "border-primary-300 bg-primary-50/40 cursor-wait"
                : "border-gray-300 hover:border-primary-500 hover:bg-primary-50/20 bg-gray-50/60"
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-2">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                <div className="w-full max-w-xs space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-primary-800">
                    <span>Uploading walkthrough video...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-200 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-gray-500">Processing via ImageKit CDN...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-xs text-primary-600">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Click to upload property video walkthrough
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    MP4, WebM, or MOV up to 100MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
