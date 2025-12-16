"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Video as VideoIcon, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface VideoUploadProps {
  value?: string;
  onChange?: (value: string) => void;
  onRemove?: () => void;
  maxSize?: number; // in MB
  acceptedFormats?: string[];
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
  onUploadProgress?: (progress: number) => void;
}

interface UploadStatus {
  status: "idle" | "uploading" | "processing" | "success" | "error";
  progress: number;
  message?: string;
}

export function VideoUpload({
  value,
  onChange,
  onRemove,
  maxSize = 500, // 500MB default
  acceptedFormats = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
  disabled = false,
  label,
  description,
  className,
  onUploadProgress,
}: VideoUploadProps) {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: "idle",
    progress: 0,
  });
  const [dragActive, setDragActive] = useState(false);
  const [videoInfo, setVideoInfo] = useState<{
    name: string;
    size: string;
    duration?: string;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const validateFile = (file: File): string | null => {
    if (!acceptedFormats.includes(file.type)) {
      return `Định dạng video không hợp lệ. Chỉ chấp nhận: ${acceptedFormats
        .map((f) => f.split("/")[1].toUpperCase())
        .join(", ")}`;
    }
    if (file.size > maxSize * 1024 * 1024) {
      return `Kích thước video vượt quá ${maxSize}MB`;
    }
    return null;
  };

  const uploadFile = async (file: File): Promise<string> => {
    // Simulate chunked upload with progress
    return new Promise((resolve, reject) => {
      const totalChunks = 20;
      let currentChunk = 0;

      const interval = setInterval(() => {
        currentChunk++;
        const progress = (currentChunk / totalChunks) * 100;
        
        setUploadStatus({
          status: "uploading",
          progress,
          message: `Đang tải lên: ${Math.round(progress)}%`,
        });
        onUploadProgress?.(progress);

        if (currentChunk >= totalChunks) {
          clearInterval(interval);
          
          // Simulate processing
          setUploadStatus({
            status: "processing",
            progress: 100,
            message: "Đang xử lý video...",
          });

          setTimeout(() => {
            // Create a temporary URL for preview
            const videoUrl = URL.createObjectURL(file);
            resolve(videoUrl);
          }, 2000);
        }
      }, 200);
    });
  };

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || disabled) return;

      const file = files[0];
      
      // Validate
      const validationError = validateFile(file);
      if (validationError) {
        setUploadStatus({
          status: "error",
          progress: 0,
          message: validationError,
        });
        return;
      }

      try {
        // Get video info
        const duration = await getVideoDuration(file);
        setVideoInfo({
          name: file.name,
          size: formatFileSize(file.size),
          duration: formatDuration(duration),
        });

        // Upload
        setUploadStatus({
          status: "uploading",
          progress: 0,
          message: "Đang tải lên...",
        });

        const uploadedUrl = await uploadFile(file);

        setUploadStatus({
          status: "success",
          progress: 100,
          message: "Tải lên thành công!",
        });

        onChange?.(uploadedUrl);
      } catch (err) {
        setUploadStatus({
          status: "error",
          progress: 0,
          message: "Có lỗi xảy ra khi tải video lên",
        });
        console.error(err);
      }
    },
    [onChange, disabled]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (!disabled) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles, disabled]
  );

  const handleRemove = () => {
    setUploadStatus({ status: "idle", progress: 0 });
    setVideoInfo(null);
    onChange?.("");
    onRemove?.();
  };

  const renderUploadArea = () => {
    if (value) {
      return (
        <Card className="overflow-hidden">
          <div className="aspect-video bg-black relative">
            <video src={value} controls className="w-full h-full">
              Your browser does not support the video tag.
            </video>
          </div>
          
          <div className="p-4 space-y-3">
            {videoInfo && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate flex-1">
                    {videoInfo.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemove}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{videoInfo.size}</span>
                  {videoInfo.duration && <span>{videoInfo.duration}</span>}
                </div>
              </div>
            )}

            {uploadStatus.status === "success" && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>{uploadStatus.message}</span>
              </div>
            )}
          </div>
        </Card>
      );
    }

    return (
      <Card
        className={cn(
          "border-2 border-dashed transition-colors",
          dragActive && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <label
          htmlFor={disabled ? undefined : "video-upload"}
          className={cn(
            "flex flex-col items-center justify-center gap-4 p-12 cursor-pointer",
            disabled && "cursor-not-allowed"
          )}
        >
          <div className="rounded-full bg-primary/10 p-6">
            {uploadStatus.status === "uploading" || uploadStatus.status === "processing" ? (
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            ) : (
              <VideoIcon className="h-10 w-10 text-primary" />
            )}
          </div>
          
          <div className="text-center space-y-2 w-full max-w-md">
            {uploadStatus.status === "idle" && (
              <>
                <p className="text-base font-medium">
                  Nhấp để chọn hoặc kéo thả video vào đây
                </p>
                <p className="text-sm text-muted-foreground">
                  {acceptedFormats
                    .map((f) => f.split("/")[1].toUpperCase())
                    .join(", ")}{" "}
                  (tối đa {maxSize}MB)
                </p>
              </>
            )}

            {(uploadStatus.status === "uploading" || uploadStatus.status === "processing") && (
              <div className="space-y-3 w-full">
                <p className="text-sm font-medium">{uploadStatus.message}</p>
                <Progress value={uploadStatus.progress} className="w-full" />
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            id="video-upload"
            type="file"
            className="hidden"
            accept={acceptedFormats.join(",")}
            disabled={disabled || uploadStatus.status !== "idle"}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </Card>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {label && (
        <div className="space-y-1">
          <Label>{label}</Label>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {renderUploadArea()}

      {uploadStatus.status === "error" && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          <AlertCircle className="h-4 w-4 shrink-0"/>
          <span>{uploadStatus.message}</span>
        </div>
      )}
    </div>
  );
}
