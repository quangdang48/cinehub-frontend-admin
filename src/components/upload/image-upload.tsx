"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  onRemove?: (value: string) => void;
  multiple?: boolean;
  maxSize?: number; // in MB
  acceptedFormats?: string[];
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
}

export function ImageUpload({
  onChange,
  onRemove,
  multiple = false,
  value = multiple ? [] : "",
  maxSize = 5,
  acceptedFormats = ["image/jpeg", "image/png", "image/webp", "image/jpg"],
  disabled = false,
  label,
  description,
  className,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const images = Array.isArray(value) ? value : value ? [value] : [];

  const validateFile = (file: File): string | null => {
    if (!acceptedFormats.includes(file.type)) {
      return `Định dạng file không hợp lệ. Chỉ chấp nhận: ${acceptedFormats.join(", ")}`;
    }
    if (file.size > maxSize * 1024 * 1024) {
      return `Kích thước file vượt quá ${maxSize}MB`;
    }
    return null;
  };

  const uploadFile = async (file: File): Promise<string> => {
    // Simulate upload - replace with actual API call
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTimeout(() => {
          resolve(reader.result as string);
        }, 1000);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || disabled) return;

      setError("");
      setUploading(true);

      try {
        const fileArray = Array.from(files);
        
        // Validate all files first
        for (const file of fileArray) {
          const validationError = validateFile(file);
          if (validationError) {
            setError(validationError);
            setUploading(false);
            return;
          }
        }

        // Upload files
        const uploadPromises = fileArray.map((file) => uploadFile(file));
        const uploadedUrls = await Promise.all(uploadPromises);

        if (multiple) {
          const newValue = [...images, ...uploadedUrls];
          onChange?.(newValue);
        } else {
          onChange?.(uploadedUrls[0]);
        }
      } catch (err) {
        setError("Có lỗi xảy ra khi tải ảnh lên");
        console.error(err);
      } finally {
        setUploading(false);
      }
    },
    [images, multiple, onChange, disabled]
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

  const handleRemove = (url: string) => {
    if (multiple) {
      const newValue = images.filter((img) => img !== url);
      onChange?.(newValue);
    } else {
      onChange?.("");
    }
    onRemove?.(url);
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

      {/* Upload Area */}
      {(multiple || images.length === 0) && (
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
            htmlFor={disabled ? undefined : "image-upload"}
            className={cn(
              "flex flex-col items-center justify-center gap-4 p-8 cursor-pointer",
              disabled && "cursor-not-allowed"
            )}
          >
            <div className="rounded-full bg-primary/10 p-4">
              {uploading ? (
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              ) : (
                <Upload className="h-8 w-8 text-primary" />
              )}
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium">
                {uploading
                  ? "Đang tải lên..."
                  : "Nhấp để chọn hoặc kéo thả ảnh vào đây"}
              </p>
              <p className="text-xs text-muted-foreground">
                {acceptedFormats.map((f) => f.split("/")[1].toUpperCase()).join(", ")} (tối đa {maxSize}MB)
              </p>
            </div>
            <input
              ref={inputRef}
              id="image-upload"
              type="file"
              className="hidden"
              accept={acceptedFormats.join(",")}
              multiple={multiple}
              disabled={disabled || uploading}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <Card key={index} className="relative group overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemove(url)}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
