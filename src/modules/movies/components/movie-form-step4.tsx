"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Upload, Video, Trash2, Loader2, CheckCircle, AlertCircle, Film, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/config";
import { getSeasons, checkVideoStatus, deleteVideo } from "../actions";
import { FilmType, VideoStatus } from "../types";
import type { Season } from "../types";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { VideoPlayer } from "@/components/shared/video-player/video-player";

interface MovieFormStep4Props {
  filmId: string;
  filmType: FilmType;
  onComplete: () => void;
}

export function MovieFormStep4({
  filmId,
  filmType,
  onComplete,
}: MovieFormStep4Props) {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | undefined>();
  const [selectedEpisode, setSelectedEpisode] = useState<number | undefined>();
  const [loadingSeasons, setLoadingSeasons] = useState(false);
  
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<VideoStatus | null>(null);
  const [checkingVideo, setCheckingVideo] = useState(false);
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load seasons structure or check movie video on mount
  useEffect(() => {
    if (filmType === FilmType.SERIES) {
      loadSeasons();
    } else {
      checkCurrentVideo();
    }
  }, [filmId, filmType]);

  // Check video when selection changes (Series)
  useEffect(() => {
    if (filmType === FilmType.SERIES) {
      if (selectedSeason && selectedEpisode) {
        checkCurrentVideo();
      } else {
        setVideoUrl(null);
      }
    }
  }, [selectedSeason, selectedEpisode]);

  const loadSeasons = async () => {
    setLoadingSeasons(true);
    try {
      const data = await getSeasons(filmId);
      setSeasons(data);
    } catch (error) {
      console.error("Error loading seasons:", error);
      toast.error("Lỗi khi tải danh sách mùa");
    } finally {
      setLoadingSeasons(false);
    }
  };

  const checkCurrentVideo = async () => {
    setCheckingVideo(true);
    setVideoUrl(null);
    setVideoStatus(null);
    try {
      const result = await checkVideoStatus(filmId, selectedSeason, selectedEpisode);
      if (result.hasVideo) {
        setVideoStatus(result.status || null);
        if (result.status === VideoStatus.READY) {
          let url = `/api/stream?filmId=${filmId}`;
          if (selectedSeason) url += `&season=${selectedSeason}`;
          if (selectedEpisode) url += `&episode=${selectedEpisode}`;
          setVideoUrl(url);
        }
      }
    } catch (error) {
      console.error("Error checking video:", error);
    } finally {
      setCheckingVideo(false);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    const validTypes = [
      "video/mp4",
      "video/x-matroska",
      "video/avi",
      "video/quicktime",
      "video/webm",
    ];
    if (
      !validTypes.some((type) => selectedFile.type.includes(type.split("/")[1]))
    ) {
      toast.error(
        "Định dạng không hỗ trợ. Vui lòng chọn file MP4, MKV, AVI, MOV hoặc WebM"
      );
      return;
    }

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

    // Validate selection for series
    if (filmType === FilmType.SERIES && (!selectedSeason || !selectedEpisode)) {
      toast.error("Vui lòng chọn mùa và tập trước khi upload");
      return;
    }

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
          toast.success("Upload video thành công! Video đang được xử lý.");

          // Refresh video status
          setTimeout(() => {
            checkCurrentVideo();
          }, 2000);

          // Clear file after successful upload
          setTimeout(() => {
            setFile(null);
            setUploadStatus("idle");
          }, 3000);
        } else {
          setUploadStatus("error");
          try {
            const response = JSON.parse(xhr.responseText);
            toast.error(response.message || "Lỗi khi upload video");
          } catch {
            toast.error("Lỗi khi upload video");
          }
        }
        setUploading(false);
      });

      xhr.addEventListener("error", () => {
        setUploadStatus("error");
        toast.error("Lỗi kết nối khi upload video");
        setUploading(false);
      });

      xhr.open("POST", url);
      xhr.setRequestHeader("Authorization", `Bearer ${session.accessToken}`);
      xhr.send(formData);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      toast.error("Lỗi khi upload video");
      setUploading(false);
    }
  };

  const handleDeleteVideo = async () => {
    setDeleting(true);
    try {
      const result = await deleteVideo(filmId, selectedSeason, selectedEpisode);

      if (result.success) {
        toast.success("Đã xóa video");
        setVideoUrl(null);
        setVideoStatus(null);
      } else {
        toast.error(result.error || "Lỗi khi xóa video");
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("Đã xảy ra lỗi khi xóa video");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const selectedSeasonData = seasons.find((s) => s.number === selectedSeason);
  const availableEpisodes = selectedSeasonData?.episodes || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Quản lý Video
          </CardTitle>
          <CardDescription>
            {filmType === FilmType.MOVIE
              ? "Xem và quản lý video cho phim lẻ"
              : "Chọn mùa và tập để xem hoặc upload video"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Series Selection */}
          {filmType === FilmType.SERIES && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Chọn Mùa</Label>
                <Select
                  value={selectedSeason?.toString()}
                  onValueChange={(val) => {
                    setSelectedSeason(Number(val));
                    setSelectedEpisode(undefined);
                  }}
                  disabled={loadingSeasons}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn mùa phim" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map((season) => (
                      <SelectItem
                        key={season.id}
                        value={season.number.toString()}
                      >
                        Mùa {season.number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Chọn Tập</Label>
                <Select
                  value={selectedEpisode?.toString()}
                  onValueChange={(val) => setSelectedEpisode(Number(val))}
                  disabled={!selectedSeason}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tập phim" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEpisodes.map((episode) => (
                      <SelectItem
                        key={episode.id}
                        value={episode.number.toString()}
                      >
                        Tập {episode.number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Separator />

          {/* Content Area */}
          {checkingVideo ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-muted-foreground">Đang kiểm tra video...</p>
            </div>
          ) : videoStatus === VideoStatus.READY && videoUrl ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Video đã sẵn sàng</span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa Video
                </Button>
              </div>
              
              <VideoPlayer src={videoUrl} />
            </div>
          ) : videoStatus === VideoStatus.PROCESSING ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      Video đang được xử lý
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Vui lòng chờ trong giây lát. Quá trình này có thể mất vài phút. Bạn có thể thoát trong lúc chờ.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={checkCurrentVideo}
                  disabled={checkingVideo}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${checkingVideo ? 'animate-spin' : ''}`} />
                  Làm mới
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {(filmType === FilmType.MOVIE || (selectedSeason && selectedEpisode)) ? (
                <>
                  <div className="flex items-center gap-2 text-amber-600 mb-4">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Chưa có video. Vui lòng upload.</span>
                  </div>

                  {/* File Upload Area */}
                  {!file ? (
                    <label className="flex flex-col items-center justify-center min-h-48 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                      <Upload className="h-14 w-14 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium mb-1">
                        Kéo thả hoặc click để chọn video
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Hỗ trợ MP4, MKV, AVI, MOV, WebM
                      </p>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileSelect(e.target.files[0]);
                          }
                        }}
                        disabled={uploading}
                      />
                    </label>
                  ) : (
                    <div className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Video className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium truncate max-w-50 md:max-w-75">
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        {!uploading && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRemoveFile}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        )}
                      </div>

                      {uploadStatus !== "idle" && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>
                              {uploadStatus === "uploading"
                                ? "Đang upload..."
                                : uploadStatus === "success"
                                ? "Hoàn tất"
                                : "Lỗi"}
                            </span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                uploadStatus === "success"
                                  ? "bg-green-500"
                                  : uploadStatus === "error"
                                  ? "bg-destructive"
                                  : "bg-primary"
                              }`}
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={handleRemoveFile}
                          disabled={uploading}
                        >
                          Hủy
                        </Button>
                        <Button
                          onClick={handleUpload}
                          disabled={uploading || uploadStatus === "success"}
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Đang upload...
                            </>
                          ) : uploadStatus === "success" ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Đã upload
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Bắt đầu Upload
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Film className="h-12 w-12 mb-4 opacity-20" />
                  <p>Vui lòng chọn Mùa và Tập để quản lý video</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-end items-center pt-4 border-t">
        <Button
          type="button"
          onClick={onComplete}
          disabled={uploading}
          size="lg"
        >
          Hoàn tất
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa video</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa video này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVideo}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa Video"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
