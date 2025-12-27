"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, Video, CheckCircle2, AlertCircle } from "lucide-react";
import { API_URL } from "@/config";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { FilmType, Season } from "../types";
import { getSeasons } from "../actions";

interface MovieFormStep4Props {
  filmId: string;
  filmType: FilmType;
  onComplete: () => void;
  onBack: () => void;
}

export function MovieFormStep4({ filmId, filmType, onComplete, onBack }: MovieFormStep4Props) {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">(
    "idle"
  );
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | undefined>();
  const [selectedEpisode, setSelectedEpisode] = useState<number | undefined>();

  useEffect(() => {
    if (filmType === FilmType.SERIES) {
      loadSeasons();
    }
  }, [filmId, filmType]);

  const loadSeasons = async () => {
    const data = await getSeasons(filmId);
    setSeasons(data);
  };

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setUploadStatus("idle");
    setUploadProgress(0);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadStatus("idle");
    setUploadProgress(0);
  };

  const handleUpload = async () => {
    if (!file || !session?.accessToken) return;

    setUploading(true);
    setUploadStatus("uploading");
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    let url = `${API_URL}/films/${filmId}/video`;
    const params = new URLSearchParams();
    if (filmType === FilmType.SERIES && selectedSeason && selectedEpisode) {
      params.append("season", selectedSeason.toString());
      params.append("episode", selectedEpisode.toString());
    }
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadStatus("success");
          toast.success("Upload video thành công");
        } else {
          setUploadStatus("error");
          const response = JSON.parse(xhr.responseText);
          toast.error(response.message || "Lỗi khi upload video");
        }
        setUploading(false);
      });

      xhr.addEventListener("error", () => {
        setUploadStatus("error");
        toast.error("Lỗi kết nối khi upload video");
        setUploading(false);
      });

      xhr.addEventListener("abort", () => {
        setUploadStatus("idle");
        toast.info("Upload đã bị hủy");
        setUploading(false);
      });

      xhr.open("POST", url);
      xhr.setRequestHeader("Authorization", `Bearer ${session.accessToken}`);
      xhr.send(formData);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      toast.error(error instanceof Error ? error.message : "Lỗi khi upload video");
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const canUpload =
    file && !uploading && (filmType === FilmType.MOVIE || (selectedSeason && selectedEpisode));
  const canComplete = uploadStatus === "success" || !file;

  const selectedSeasonData = seasons.find(s => s.number === selectedSeason);
  const availableEpisodes = selectedSeasonData?.episodes || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Video</CardTitle>
          <CardDescription>
            {filmType === FilmType.MOVIE
              ? "Upload video cho phim"
              : "Upload video cho tập phim (phải chọn mùa và số tập)"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {filmType === FilmType.SERIES && (
            <div className="space-y-4">
              {seasons.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Chưa có mùa phim nào. Vui lòng quay lại bước trước để tạo mùa và tập phim.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="season">
                      Chọn mùa <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={selectedSeason?.toString()}
                      onValueChange={(value) => {
                        setSelectedSeason(Number(value));
                        setSelectedEpisode(undefined);
                      }}
                      disabled={uploading}
                    >
                      <SelectTrigger id="season">
                        <SelectValue placeholder="Chọn mùa" />
                      </SelectTrigger>
                      <SelectContent>
                        {seasons.map((season) => (
                          <SelectItem key={season.number} value={season.number.toString()}>
                            Mùa {season.number} ({season.episodes.length} tập)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="episode">
                      Chọn tập <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={selectedEpisode?.toString()}
                      onValueChange={(value) => setSelectedEpisode(Number(value))}
                      disabled={uploading || !selectedSeason}
                    >
                      <SelectTrigger id="episode">
                        <SelectValue placeholder="Chọn tập" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableEpisodes.map((episode) => (
                          <SelectItem key={episode.number} value={episode.number.toString()}>
                            Tập {episode.number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          )}

          {!file ? (
            <label className="flex flex-col items-center justify-center min-h-75 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
              <Video className="h-16 w-16 text-muted-foreground mb-4" />
              <span className="text-sm text-muted-foreground mb-2">
                Chọn file video để upload
              </span>
              <span className="text-xs text-muted-foreground">
                Hỗ trợ: MP4, MKV, AVI, MOV
              </span>
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) handleFileSelect(selectedFile);
                }}
                disabled={uploading}
              />
            </label>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3 flex-1">
                  <Video className="h-10 w-10 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                {uploadStatus === "success" ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                ) : uploadStatus === "error" ? (
                  <AlertCircle className="h-6 w-6 text-destructive shrink-0" />
                ) : (
                  <button
                    onClick={handleRemoveFile}
                    className="p-1 hover:bg-destructive hover:text-destructive-foreground rounded-full transition-colors"
                    disabled={uploading}
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {uploadStatus === "uploading" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Đang upload...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {uploadStatus === "success" && (
                <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">Upload thành công!</span>
                </div>
              )}

              {uploadStatus === "error" && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Upload thất bại. Vui lòng thử lại.</span>
                </div>
              )}

              {uploadStatus !== "success" && (
                <Button
                  type="button"
                  onClick={handleUpload}
                  disabled={!canUpload}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Đang upload..." : "Upload Video"}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={uploading}>
          Quay lại
        </Button>
        <Button type="button" onClick={onComplete} disabled={!canComplete || uploading}>
          {file ? "Hoàn thành" : "Bỏ qua"}
        </Button>
      </div>
    </div>
  );
}
