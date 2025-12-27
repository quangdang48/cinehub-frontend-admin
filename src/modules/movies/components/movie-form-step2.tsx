"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { API_URL } from "@/config";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface PosterUpload {
  type: "default" | "thumbnail" | "backdrop";
  file: File | null;
  preview: string | null;
  uploaded: boolean;
  existingUrl?: string;  existingId?: string;}

interface MovieFormStep2Props {
  filmId: string;
  existingPosters?: Array<{ id: string; url: string; type: string }>;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function MovieFormStep2({ filmId, existingPosters, onNext, onBack, isLoading }: MovieFormStep2Props) {
  const { data: session } = useSession();
  const [uploading, setUploading] = useState(false);
  
  // Initialize posters with existing data
  const initializePosters = (): PosterUpload[] => {
    const types: Array<"default" | "thumbnail" | "backdrop"> = ["default", "thumbnail", "backdrop"];
    return types.map((type) => {
      const existing = existingPosters?.find((p) => p.type === type);
      return {
        type,
        file: null,
        preview: existing?.url || null,
        uploaded: !!existing,
        existingUrl: existing?.url,        existingId: existing?.id,      };
    });
  };
  
  const [posters, setPosters] = useState<PosterUpload[]>(initializePosters());

  const handleFileSelect = (type: PosterUpload["type"], file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPosters((prev) =>
        prev.map((p) =>
          p.type === type
            ? { ...p, file, preview: reader.result as string, uploaded: false }
            : p
        )
      );
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = async (type: PosterUpload["type"]) => {
    const poster = posters.find((p) => p.type === type);
    
    // If there's an existing poster, delete it from server
    if (poster?.existingId) {
      try {
        const response = await fetch(`${API_URL}/posters/${poster.existingId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete poster");
        }
        
        toast.success("Đã xóa ảnh");
      } catch (error) {
        console.error("Delete poster error:", error);
        toast.error("Lỗi khi xóa ảnh");
        return;
      }
    }
    
    setPosters((prev) =>
      prev.map((p) =>
        p.type === type ? { ...p, file: null, preview: null, uploaded: false, existingUrl: undefined, existingId: undefined } : p
      )
    );
  };

  const handleUpload = async (type: PosterUpload["type"]) => {
    const poster = posters.find((p) => p.type === type);
    if (!poster?.file || !session?.accessToken) {
      toast.error("No file selected or not authenticated");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", poster.file);

    try {
      const response = await fetch(
        `${API_URL}/posters?filmId=${filmId}&type=${type}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      setPosters((prev) =>
        prev.map((p) => (p.type === type ? { ...p, uploaded: true } : p))
      );
      toast.success(`Upload ${getPosterLabel(type)} thành công`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : `Lỗi khi upload ${getPosterLabel(type)}`
      );
    } finally {
      setUploading(false);
    }
  };

  const handleUploadAll = async () => {
    setUploading(true);
    for (const poster of posters) {
      if (poster.file && !poster.uploaded) {
        await handleUpload(poster.type);
      }
    }
    setUploading(false);
  };

  const getPosterLabel = (type: PosterUpload["type"]) => {
    switch (type) {
      case "default":
        return "Poster chính";
      case "thumbnail":
        return "Thumbnail";
      case "backdrop":
        return "Backdrop";
    }
  };

  const getPosterDescription = (type: PosterUpload["type"]) => {
    switch (type) {
      case "default":
        return "Ảnh poster chính của phim (tỷ lệ 2:3)";
      case "thumbnail":
        return "Ảnh thumbnail nhỏ (tỷ lệ 16:9)";
      case "backdrop":
        return "Ảnh nền lớn (tỷ lệ 16:9)";
    }
  };

  const hasUnuploadedFiles = posters.some((p) => p.file && !p.uploaded);
  const canSkip = !posters.some((p) => p.file);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posters.map((poster) => (
          <Card key={poster.type}>
            <CardHeader>
              <CardTitle>{getPosterLabel(poster.type)}</CardTitle>
              <CardDescription>{getPosterDescription(poster.type)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {poster.preview ? (
                <div className="relative aspect-2/3 rounded-lg overflow-hidden border">
                  <img
                    src={poster.preview}
                    alt={getPosterLabel(poster.type)}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemoveFile(poster.type)}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {poster.uploaded && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded">
                      Đã upload
                    </div>
                  )}
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-2/3 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Chọn ảnh</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(poster.type, file);
                    }}
                    disabled={uploading}
                  />
                </label>
              )}
              {poster.file && !poster.uploaded && (
                <Button
                  type="button"
                  onClick={() => handleUpload(poster.type)}
                  disabled={uploading}
                  className="w-full"
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {poster.existingUrl ? "Thay thế" : "Upload"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={uploading}>
          Quay lại
        </Button>
        <div className="flex gap-2">
          {hasUnuploadedFiles && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleUploadAll}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Đang upload..." : "Upload tất cả"}
            </Button>
          )}
          <Button
            type="button"
            onClick={onNext}
            disabled={uploading || hasUnuploadedFiles}
          >
            {canSkip ? "Bỏ qua" : "Tiếp theo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
