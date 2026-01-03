"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { API_URL } from "@/config";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { normalizeUrl } from "@/lib/utils";

interface PosterUpload {
  type: "default" | "thumbnail" | "backdrop";
  file: File | null;
  preview: string | null;
  uploaded: boolean;
  uploading: boolean;
  progress: number;
  existingUrl?: string;
  existingId?: string;
}

interface MovieFormStep2Props {
  filmId: string;
  existingPosters?: Array<{ id: string; url: string; type: string }>;
  onNext: () => void;
}

export function MovieFormStep2({ filmId, existingPosters, onNext }: MovieFormStep2Props) {
  const { data: session } = useSession();
  
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
        uploading: false,
        progress: 0,
        existingUrl: existing?.url,
        existingId: existing?.id,
      };
    });
  };
  
  const [posters, setPosters] = useState<PosterUpload[]>(initializePosters());

  const handleFileSelect = (type: PosterUpload["type"], file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước file tối đa là 5MB");
      return;
    }

    setPosters((prev) =>
      prev.map((p) => {
        if (p.type === type) {
          if (p.preview && p.existingUrl !== p.preview) {
            URL.revokeObjectURL(p.preview);
          }
          return { ...p, file, preview: URL.createObjectURL(file), uploaded: false, progress: 0 };
        }
        return p;
      })
    );
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
        p.type === type 
          ? { ...p, file: null, preview: null, uploaded: false, uploading: false, progress: 0, existingUrl: undefined, existingId: undefined } 
          : p
      )
    );
  };

  const handleUpload = async (type: PosterUpload["type"]) => {
    const poster = posters.find((p) => p.type === type);
    if (!poster?.file || !session?.accessToken) {
      return;
    }

    setPosters((prev) =>
      prev.map((p) => (p.type === type ? { ...p, uploading: true, progress: 0 } : p))
    );

    const formData = new FormData();
    formData.append("file", poster.file);

    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setPosters((prev) =>
            prev.map((p) => (p.type === type ? { ...p, progress } : p))
          );
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setPosters((prev) =>
            prev.map((p) => (p.type === type ? { ...p, uploaded: true, uploading: false } : p))
          );
          toast.success(`Upload ${getPosterLabel(type)} thành công`);
        } else {
          const response = JSON.parse(xhr.responseText);
          setPosters((prev) =>
            prev.map((p) => (p.type === type ? { ...p, uploading: false, progress: 0 } : p))
          );
          toast.error(response.message || `Lỗi khi upload ${getPosterLabel(type)}`);
        }
      });

      xhr.addEventListener("error", () => {
        setPosters((prev) =>
          prev.map((p) => (p.type === type ? { ...p, uploading: false, progress: 0 } : p))
        );
        toast.error(`Lỗi kết nối khi upload ${getPosterLabel(type)}`);
      });

      xhr.open("POST", `${API_URL}/posters?filmId=${filmId}&type=${type}`);
      xhr.setRequestHeader("Authorization", `Bearer ${session.accessToken}`);
      xhr.send(formData);
    } catch (error) {
      console.error("Upload error:", error);
      setPosters((prev) =>
        prev.map((p) => (p.type === type ? { ...p, uploading: false, progress: 0 } : p))
      );
      toast.error(`Lỗi khi upload ${getPosterLabel(type)}`);
    }
  };

  const handleUploadAll = async () => {
    const postersToUpload = posters.filter((p) => p.file && !p.uploaded);
    for (const poster of postersToUpload) {
      await handleUpload(poster.type);
    }
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
        return "Ảnh poster chính của phim (tỷ lệ 2:3, khuyến nghị 400x600px)";
      case "thumbnail":
        return "Ảnh thumbnail nhỏ cho danh sách (tỷ lệ 16:9, khuyến nghị 320x180px)";
      case "backdrop":
        return "Ảnh nền lớn cho trang chi tiết (tỷ lệ 16:9, khuyến nghị 1920x1080px)";
    }
  };

  const getAspectRatio = (type: PosterUpload["type"]) => {
    switch (type) {
      case "default":
        return "aspect-2/3";
      case "thumbnail":
      case "backdrop":
        return "aspect-video";
    }
  };

  const hasUnuploadedFiles = posters.some((p) => p.file && !p.uploaded);
  const isAnyUploading = posters.some((p) => p.uploading);
  const hasAnyPosters = posters.some((p) => p.preview);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quản lý hình ảnh phim</CardTitle>
          <CardDescription>
            Upload các hình ảnh poster, thumbnail và backdrop cho phim. Phim đã được tạo/cập nhật thành công.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {posters.map((poster) => (
              <Card key={poster.type} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{getPosterLabel(poster.type)}</CardTitle>
                    {poster.uploaded && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <CardDescription className="text-xs">
                    {getPosterDescription(poster.type)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {poster.preview ? (
                    <div className={`relative ${getAspectRatio(poster.type)} rounded-lg overflow-hidden border bg-muted`}>
                      <img
                        src={normalizeUrl(poster.preview)}
                        alt={getPosterLabel(poster.type)}
                        className="w-full h-full object-cover"
                      />
                      {!poster.uploading && (
                        <button
                          onClick={() => handleRemoveFile(poster.type)}
                          className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors shadow-lg"
                          disabled={isAnyUploading}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      {poster.uploaded && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium shadow-lg">
                          ✓ Đã upload
                        </div>
                      )}
                      {poster.uploading && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                          <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
                          <span className="text-white text-sm font-medium">{poster.progress}%</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <label className={`flex flex-col items-center justify-center ${getAspectRatio(poster.type)} border-2 border-dashed rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors`}>
                      <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                      <span className="text-sm font-medium text-muted-foreground">Chọn ảnh</span>
                      <span className="text-xs text-muted-foreground mt-1">PNG, JPG (Max 10MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(poster.type, file);
                        }}
                        disabled={isAnyUploading}
                      />
                    </label>
                  )}
                  
                  {poster.uploading && (
                    <Progress value={poster.progress} className="h-2" />
                  )}
                  
                  {poster.file && !poster.uploaded && !poster.uploading && (
                    <Button
                      type="button"
                      onClick={() => handleUpload(poster.type)}
                      className="w-full"
                      size="sm"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {poster.existingUrl ? "Thay thế ảnh" : "Upload ảnh"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {hasAnyPosters
            ? hasUnuploadedFiles
              ? "Có ảnh chưa được upload. Vui lòng upload hoặc xóa trước khi tiếp tục."
              : "Tất cả ảnh đã được upload."
            : "Bạn có thể bỏ qua bước này và thêm ảnh sau."}
        </p>
        <div className="flex gap-3">
          {hasUnuploadedFiles && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleUploadAll}
              disabled={isAnyUploading}
            >
              {isAnyUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang upload...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload tất cả
                </>
              )}
            </Button>
          )}
          <Button
            type="button"
            onClick={onNext}
            disabled={isAnyUploading || hasUnuploadedFiles}
          >
            Tiếp theo
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
