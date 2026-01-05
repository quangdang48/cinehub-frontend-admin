"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import {
  Plus,
  Trash2,
  Loader2,
  ArrowRight,
  Save,
  Edit2,
  Film,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  createSeason,
  createEpisode,
  getSeasons,
  updateSeason as updateSeasonApi,
  deleteSeason as deleteSeasonApi,
  updateEpisode as updateEpisodeApi,
  deleteEpisode as deleteEpisodeApi,
} from "../actions";
import { seasonStatusOptions } from "../const";
import type { Season, SeasonStatus, Episode } from "../types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SeasonForm {
  number: number;
  releaseDate?: string;
  endDate?: string;
  status: SeasonStatus;
  episodeCount: number;
  episodes: EpisodeForm[];
  isExpanded: boolean;
  isSaved: boolean;
  isEditing: boolean;
  hasChanges: boolean;
}

interface EpisodeForm {
  number: number;
  releaseDate?: string;
  isSaved: boolean;
  isEditing: boolean;
  hasChanges: boolean;
}

interface DeleteConfirmation {
  type: "season" | "episode";
  seasonIndex: number;
  episodeIndex?: number;
  seasonNumber: number;
  episodeNumber?: number;
  episodeCount?: number;
  subsequentCount?: number;
}

interface MovieFormStep3Props {
  filmId: string;
  existingSeasons?: Season[];
  onNext: () => void;
}

export function MovieFormStep3Series({
  filmId,
  existingSeasons,
  onNext,
}: MovieFormStep3Props) {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [seasons, setSeasons] = useState<SeasonForm[]>([]);
  const [savingSeasonIndex, setSavingSeasonIndex] = useState<number | null>(
    null
  );
  const [expandedSeason, setExpandedSeason] = useState<string | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmation | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadExistingSeasons();
  }, [filmId]);

  const loadExistingSeasons = async () => {
    setInitialLoading(true);
    try {
      const data = await getSeasons(filmId);

      // Convert existing seasons to form data
      if (data.length > 0) {
        const seasonForms: SeasonForm[] = data.map((season) => ({
          number: season.number,
          releaseDate: season.releaseDate?.split("T")[0],
          endDate: season.endDate?.split("T")[0],
          status: season.status,
          episodeCount: season.episodes.length, // Just for display, equals current episode count
          episodes: season.episodes.map((ep) => ({
            number: ep.number,
            releaseDate: ep.releaseDate?.split("T")[0],
            isSaved: true,
            isEditing: false,
            hasChanges: false,
          })),
          isExpanded: false,
          isSaved: true,
          isEditing: false,
          hasChanges: false,
        }));
        setSeasons(seasonForms);
      }
    } catch (error) {
      console.error("Error loading seasons:", error);
      toast.error("Lỗi khi tải thông tin mùa phim");
    } finally {
      setInitialLoading(false);
    }
  };

  const addSeason = () => {
    const nextSeasonNumber =
      seasons.length > 0 ? Math.max(...seasons.map((s) => s.number)) + 1 : 1;

    const newSeasonForm: SeasonForm = {
      number: nextSeasonNumber,
      status: "UPCOMING" as SeasonStatus,
      episodeCount: 0,
      episodes: [],
      isExpanded: true,
      isSaved: false,
      isEditing: false,
      hasChanges: false,
    };

    setSeasons([...seasons, newSeasonForm]);
    setExpandedSeason(`season-${seasons.length}`);
  };

  // Confirm delete season
  const confirmDeleteSeason = (seasonIndex: number) => {
    const season = seasons[seasonIndex];
    const subsequentCount = seasons.length - 1 - seasonIndex;
    setDeleteConfirm({
      type: "season",
      seasonIndex,
      seasonNumber: season.number,
      episodeCount: season.episodes.length,
      subsequentCount,
    });
  };

  // Confirm delete episode
  const confirmDeleteEpisode = (seasonIndex: number, episodeIndex: number) => {
    const season = seasons[seasonIndex];
    const episode = season.episodes[episodeIndex];
    const subsequentCount = season.episodes.length - 1 - episodeIndex;
    setDeleteConfirm({
      type: "episode",
      seasonIndex,
      episodeIndex,
      seasonNumber: season.number,
      episodeNumber: episode.number,
      subsequentCount,
    });
  };

  // Execute season delete
  const executeDeleteSeason = async () => {
    if (!deleteConfirm || deleteConfirm.type !== "season") return;

    const { seasonIndex } = deleteConfirm;
    const season = seasons[seasonIndex];

    // If not saved yet, just remove from local state
    if (!season.isSaved) {
      setSeasons(seasons.slice(0, seasonIndex));
      setDeleteConfirm(null);
      return;
    }

    // Call API to delete saved season
    setDeleting(true);
    try {
      const result = await deleteSeasonApi(filmId, season.number);
      if (result.success) {
        setSeasons(seasons.slice(0, seasonIndex));
        toast.success(
          `Đã xóa mùa ${season.number} và ${
            deleteConfirm.subsequentCount
              ? `${deleteConfirm.subsequentCount} mùa phía sau`
              : "tất cả các tập"
          }`
        );
      } else {
        toast.error(result.error || "Lỗi khi xóa mùa phim");
      }
    } catch (error) {
      console.error("Error deleting season:", error);
      toast.error("Đã xảy ra lỗi khi xóa mùa phim");
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  // Execute episode delete
  const executeDeleteEpisode = async () => {
    if (!deleteConfirm || deleteConfirm.type !== "episode") return;

    const { seasonIndex, episodeIndex } = deleteConfirm;
    const season = seasons[seasonIndex];
    const episode = season.episodes[episodeIndex!];

    // If not saved yet, just remove from local state
    if (!episode.isSaved) {
      const updatedSeasons = [...seasons];
      const keptEpisodes = season.episodes.slice(0, episodeIndex);
      updatedSeasons[seasonIndex] = {
        ...updatedSeasons[seasonIndex],
        episodes: keptEpisodes,
        episodeCount: keptEpisodes.length,
      };
      setSeasons(updatedSeasons);
      setDeleteConfirm(null);
      return;
    }

    // Call API to delete saved episode
    setDeleting(true);
    try {
      const result = await deleteEpisodeApi(
        filmId,
        season.number,
        episode.number
      );
      if (result.success) {
        const updatedSeasons = [...seasons];
        const keptEpisodes = season.episodes.slice(0, episodeIndex);
        updatedSeasons[seasonIndex] = {
          ...updatedSeasons[seasonIndex],
          episodes: keptEpisodes,
          episodeCount: keptEpisodes.length,
        };
        setSeasons(updatedSeasons);
        toast.success(
          `Đã xóa tập ${episode.number}${
            deleteConfirm.subsequentCount
              ? ` và ${deleteConfirm.subsequentCount} tập phía sau`
              : ""
          } của mùa ${season.number}`
        );
      } else {
        toast.error(result.error || "Lỗi khi xóa tập phim");
      }
    } catch (error) {
      console.error("Error deleting episode:", error);
      toast.error("Đã xảy ra lỗi khi xóa tập phim");
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const updateSeasonLocal = (
    index: number,
    updates: Partial<SeasonForm>,
    markDirty = true
  ) => {
    setSeasons((prevSeasons) =>
      prevSeasons.map((season, i) =>
        i === index
          ? {
              ...season,
              ...updates,
              hasChanges:
                updates.hasChanges !== undefined
                  ? updates.hasChanges
                  : markDirty && season.isSaved
                  ? true
                  : season.hasChanges,
            }
          : season
      )
    );
  };

  const generateEpisodes = (index: number) => {
    const season = seasons[index];
    const targetCount = season.episodeCount;
    const currentCount = season.episodes.length;

    if (targetCount <= 0) {
      toast.error("Vui lòng nhập số lượng tập hợp lệ");
      return;
    }

    if (targetCount <= currentCount) {
      toast.error("Số lượng tập phải lớn hơn số tập hiện có");
      return;
    }

    // Add new episodes
    const episodes: EpisodeForm[] = [...season.episodes];
    const newEpisodeCount = targetCount - currentCount;

    for (let i = currentCount + 1; i <= targetCount; i++) {
      episodes.push({
        number: i,
        isSaved: false,
        isEditing: false,
        hasChanges: false,
      });
    }

    // Update episodes and episodeCount without marking season as dirty
    updateSeasonLocal(index, { episodes, episodeCount: targetCount }, false);
    toast.success(
      `Đã tạo ${newEpisodeCount} tập mới cho mùa ${season.number}`
    );
  };

  const updateEpisodeLocal = (
    seasonIndex: number,
    episodeIndex: number,
    updates: Partial<EpisodeForm>
  ) => {
    setSeasons((prevSeasons) => {
      const updatedSeasons = [...prevSeasons];
      const episode = updatedSeasons[seasonIndex].episodes[episodeIndex];
      updatedSeasons[seasonIndex] = {
        ...updatedSeasons[seasonIndex],
        episodes: updatedSeasons[seasonIndex].episodes.map((ep, idx) =>
          idx === episodeIndex
            ? {
                ...episode,
                ...updates,
                hasChanges:
                  updates.hasChanges !== undefined
                    ? updates.hasChanges
                    : episode.isSaved
                    ? true
                    : false,
              }
            : ep
        ),
      };
      return updatedSeasons;
    });
  };

  // Save/Update season
  const saveSeason = async (index: number) => {
    // Get latest season state
    const season = seasons[index];
    if (!season) return;

    setSavingSeasonIndex(index);
    setLoading(true);

    try {
      if (season.isSaved) {
        // Update existing season info only
        if (season.hasChanges) {
          const updateResult = await updateSeasonApi(filmId, season.number, {
            releaseDate: season.releaseDate,
            endDate: season.endDate,
            status: season.status,
          });

          if (!updateResult.success) {
            toast.error(updateResult.error || "Lỗi khi cập nhật mùa phim");
            setLoading(false);
            setSavingSeasonIndex(null);
            return;
          }
        }

        // Handle episodes separately: update changed ones, create new ones
        let createdCount = 0;
        let updatedCount = 0;
        for (const episode of season.episodes) {
          if (!episode.isSaved) {
            const result = await createEpisode(filmId, season.number, {
              releaseDate: episode.releaseDate,
            });
            if (result.success) createdCount++;
          } else if (episode.hasChanges) {
            const result = await updateEpisodeApi(
              filmId,
              season.number,
              episode.number,
              { releaseDate: episode.releaseDate }
            );
            if (result.success) updatedCount++;
          }
        }

        updateSeasonLocal(
          index,
          {
            hasChanges: false,
            isEditing: false,
            episodes: season.episodes.map((ep) => ({
              ...ep,
              isSaved: true,
              hasChanges: false,
              isEditing: false,
            })),
          },
          false
        );

        // Build appropriate message
        const messages: string[] = [];
        if (season.hasChanges) messages.push(`Đã cập nhật thông tin mùa ${season.number}`);
        if (createdCount > 0) messages.push(`Đã thêm ${createdCount} tập mới`);
        if (updatedCount > 0) messages.push(`Đã cập nhật ${updatedCount} tập`);
        toast.success(messages.join(". ") || `Mùa ${season.number} đã được lưu`);
      } else {
        // Create new season
        const seasonResult = await createSeason(filmId, {
          releaseDate: season.releaseDate,
          endDate: season.endDate,
          status: season.status,
        });

        if (!seasonResult.success) {
          toast.error(seasonResult.error || "Lỗi khi tạo mùa phim");
          setLoading(false);
          setSavingSeasonIndex(null);
          return;
        }

        // Create episodes for this season
        let successCount = 0;
        for (const episode of season.episodes) {
          const episodeResult = await createEpisode(filmId, season.number, {
            releaseDate: episode.releaseDate,
          });
          if (episodeResult.success) successCount++;
        }

        updateSeasonLocal(
          index,
          {
            isSaved: true,
            hasChanges: false,
            episodes: season.episodes.map((ep) => ({
              ...ep,
              isSaved: true,
              hasChanges: false,
            })),
          },
          false
        );
        toast.success(`Đã tạo mùa ${season.number} với ${successCount} tập`);
      }
    } catch (error) {
      console.error("Error saving season:", error);
      toast.error("Đã xảy ra lỗi không mong muốn");
    } finally {
      setLoading(false);
      setSavingSeasonIndex(null);
    }
  };

  // Save single episode update
  const saveEpisode = async (seasonIndex: number, episodeIndex: number) => {
    const season = seasons[seasonIndex];
    const episode = season.episodes[episodeIndex];

    if (!season.isSaved) {
      toast.error("Vui lòng lưu mùa phim trước khi lưu tập phim");
      return;
    }

    if (!episode.hasChanges && episode.isSaved) return;

    setLoading(true);
    try {
      if (episode.isSaved && episode.hasChanges) {
        // Update existing episode
        const result = await updateEpisodeApi(
          filmId,
          season.number,
          episode.number,
          { releaseDate: episode.releaseDate }
        );

        if (result.success) {
          updateEpisodeLocal(seasonIndex, episodeIndex, {
            hasChanges: false,
            isEditing: false,
          });
          toast.success(`Đã cập nhật tập ${episode.number}`);
        } else {
          toast.error(result.error || "Lỗi khi cập nhật tập phim");
        }
      } else if (!episode.isSaved) {
        // Create new episode
        const result = await createEpisode(filmId, season.number, {
          releaseDate: episode.releaseDate,
        });

        if (result.success) {
          updateEpisodeLocal(seasonIndex, episodeIndex, {
            isSaved: true,
            hasChanges: false,
            isEditing: false,
          });
          toast.success(`Đã thêm tập ${episode.number} vào mùa ${season.number}`);
        } else {
          toast.error(result.error || "Lỗi khi thêm tập phim");
        }
      }
    } catch (error) {
      console.error("Error saving episode:", error);
      toast.error("Đã xảy ra lỗi khi lưu tập phim");
    } finally {
      setLoading(false);
    }
  };

  const saveAllSeasons = async () => {
    setLoading(true);

    try {
      // Process each season sequentially
      // Since updateSeasonLocal uses functional update, each save will work with the latest state
      for (let i = 0; i < seasons.length; i++) {
        const currentSeason = seasons[i];

        const needsSave =
          !currentSeason.isSaved ||
          currentSeason.hasChanges ||
          currentSeason.episodes.some((e) => !e.isSaved || e.hasChanges);

        if (needsSave) {
          await saveSeason(i);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const hasUnsavedChanges = seasons.some(
    (s) =>
      !s.isSaved ||
      s.hasChanges ||
      s.episodes.some((e) => !e.isSaved || e.hasChanges)
  );
  const totalEpisodes = seasons.reduce(
    (acc, s) => acc + s.episodes.length,
    0
  );

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">
            Đang tải thông tin mùa phim...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => !deleting && setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Xác nhận xóa
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm?.type === "season" ? (
                <>
                  Bạn có chắc chắn muốn xóa{" "}
                  <strong>Mùa {deleteConfirm.seasonNumber}</strong>?
                  <div className="mt-2 space-y-1 text-destructive font-medium">
                    {deleteConfirm.subsequentCount! > 0 && (
                      <p>
                        ⚠️ Hành động này sẽ xóa Mùa {deleteConfirm.seasonNumber}{" "}
                        và {deleteConfirm.subsequentCount} mùa phía sau.
                      </p>
                    )}
                    <p>
                      ⚠️ Tất cả các tập và dữ liệu video đã tải lên của các mùa
                      này sẽ bị xóa vĩnh viễn.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  Bạn có chắc chắn muốn xóa{" "}
                  <strong>
                    Tập {deleteConfirm?.episodeNumber} của Mùa{" "}
                    {deleteConfirm?.seasonNumber}
                  </strong>
                  ?
                  <div className="mt-2 space-y-1 text-destructive font-medium">
                    {deleteConfirm?.subsequentCount! > 0 && (
                      <p>
                        ⚠️ Hành động này sẽ xóa Tập {deleteConfirm?.episodeNumber}{" "}
                        và {deleteConfirm?.subsequentCount} tập phía sau của mùa
                        này.
                      </p>
                    )}
                    <p>
                      ⚠️ Video đã tải lên cho các tập này cũng sẽ bị xóa và
                      không thể khôi phục.
                    </p>
                  </div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={
                deleteConfirm?.type === "season"
                  ? executeDeleteSeason
                  : executeDeleteEpisode
              }
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Film className="h-5 w-5" />
                Quản lý mùa và tập phim
              </CardTitle>
              <CardDescription>
                Thêm, sửa, xóa các mùa phim và cấu hình số tập cho mỗi mùa
              </CardDescription>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {seasons.length}
                </p>
                <p className="text-muted-foreground">Mùa</p>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {totalEpisodes}
                </p>
                <p className="text-muted-foreground">Tập</p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Seasons List */}
      {seasons.length > 0 && (
        <Accordion
          type="single"
          collapsible
          value={expandedSeason}
          onValueChange={setExpandedSeason}
          className="space-y-4"
        >
          {seasons.map((season, seasonIndex) => (
            <AccordionItem
              key={`${seasonIndex}-${season.episodes.length}`}
              value={`season-${seasonIndex}`}
              className="border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center justify-between w-full mr-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        season.isSaved && !season.hasChanges
                          ? "bg-green-100 text-green-700"
                          : season.hasChanges
                            ? "bg-amber-100 text-amber-700"
                            : "bg-primary/10 text-primary"
                      }`}
                    >
                      {season.number}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Mùa {season.number}</p>
                      <p className="text-sm text-muted-foreground">
                        {season.episodes.length} tập
                        {season.releaseDate && ` • ${season.releaseDate}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {season.isSaved && !season.hasChanges ? (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700 border-green-200"
                      >
                        Đã lưu
                      </Badge>
                    ) : season.hasChanges ? (
                      <Badge
                        variant="outline"
                        className="text-amber-600 border-amber-300 bg-amber-50"
                      >
                        Có thay đổi
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-blue-600 border-blue-300 bg-blue-50"
                      >
                        Mới
                      </Badge>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 data-[state=open]:h-auto">
                <div className="space-y-6 pt-2">
                  {/* Season Info */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Trạng thái</Label>
                      <Select
                        value={season.status}
                        onValueChange={(value) =>
                          updateSeasonLocal(seasonIndex, {
                            status: value as SeasonStatus,
                          })
                        }
                        disabled={loading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          {seasonStatusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Ngày phát hành</Label>
                      <Input
                        type="date"
                        value={season.releaseDate || ""}
                        onChange={(e) =>
                          updateSeasonLocal(seasonIndex, {
                            releaseDate: e.target.value,
                          })
                        }
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Ngày kết thúc</Label>
                      <Input
                        type="date"
                        value={season.endDate || ""}
                        onChange={(e) =>
                          updateSeasonLocal(seasonIndex, {
                            endDate: e.target.value,
                          })
                        }
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Số lượng tập</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min={season.episodes.length}
                          value={season.episodeCount || ""}
                          onChange={(e) =>
                            updateSeasonLocal(
                              seasonIndex,
                              {
                                episodeCount: Number(e.target.value),
                              },
                              false
                            )
                          }
                          placeholder="Nhập số tập muốn tạo thêm"
                          disabled={loading}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          onClick={() => generateEpisodes(seasonIndex)}
                          disabled={
                            loading ||
                            !season.episodeCount ||
                            season.episodeCount <= season.episodes.length
                          }
                          title="Tạo danh sách tập"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Episodes Table */}
                  {season.episodes.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-base">
                          Danh sách tập ({season.episodes.length})
                        </Label>
                      </div>
                      <div className="border rounded-lg overflow-hidden">
                        <div className="max-h-72 overflow-y-auto">
                          <Table>
                            <TableHeader className="sticky top-0 bg-background">
                              <TableRow>
                                <TableHead className="w-20">Tập</TableHead>
                                <TableHead>Ngày phát hành</TableHead>
                                <TableHead className="w-24 text-center">
                                  Trạng thái
                                </TableHead>
                                <TableHead className="w-32 text-center">
                                  Hành động
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {season.episodes.map((episode, episodeIndex) => (
                                <TableRow key={episodeIndex}>
                                  <TableCell className="font-medium">
                                    Tập {episode.number}
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="date"
                                      value={episode.releaseDate || ""}
                                      onChange={(e) =>
                                        updateEpisodeLocal(
                                          seasonIndex,
                                          episodeIndex,
                                          {
                                            releaseDate: e.target.value,
                                          }
                                        )
                                      }
                                      disabled={loading}
                                      className="w-auto"
                                    />
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {episode.isSaved && !episode.hasChanges ? (
                                      <Badge
                                        variant="secondary"
                                        className="bg-green-100 text-green-700"
                                      >
                                        Đã lưu
                                      </Badge>
                                    ) : episode.hasChanges ? (
                                      <Badge
                                        variant="outline"
                                        className="text-amber-600"
                                      >
                                        Đã sửa
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="outline"
                                        className="text-blue-600"
                                      >
                                        Mới
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      {(episode.hasChanges ||
                                        !episode.isSaved) && (
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                            saveEpisode(
                                              seasonIndex,
                                              episodeIndex
                                            )
                                          }
                                          disabled={loading || !season.isSaved}
                                          title={
                                            !season.isSaved
                                              ? "Vui lòng lưu mùa trước"
                                              : "Lưu tập"
                                          }
                                        >
                                          <Save className="h-4 w-4" />
                                        </Button>
                                      )}
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          confirmDeleteEpisode(
                                            seasonIndex,
                                            episodeIndex
                                          )
                                        }
                                        disabled={loading}
                                        className="text-destructive hover:text-destructive"
                                        title="Xóa tập"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Season Actions */}
                  <div className="flex justify-between gap-2 pt-2 border-t">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => confirmDeleteSeason(seasonIndex)}
                      disabled={loading}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa mùa
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => saveSeason(seasonIndex)}
                      disabled={
                        loading ||
                        (season.isSaved &&
                          !season.hasChanges &&
                          !season.episodes.some(
                            (e) => !e.isSaved || e.hasChanges
                          ))
                      }
                    >
                      {savingSeasonIndex === seasonIndex ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {season.isSaved ? "Cập nhật mùa" : "Tạo mùa"}{" "}
                          {season.number}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Empty State */}
      {seasons.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Film className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">Chưa có mùa nào</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Thêm mùa đầu tiên cho phim bộ của bạn
            </p>
            <Button onClick={addSeason}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm mùa đầu tiên
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Season Button */}
      {seasons.length > 0 && (
        <Button
          type="button"
          variant="outline"
          onClick={addSeason}
          disabled={loading}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm mùa mới
        </Button>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          {hasUnsavedChanges
            ? "Có thay đổi chưa được lưu. Vui lòng lưu trước khi tiếp tục."
            : seasons.length > 0
              ? "Tất cả mùa đã được lưu."
              : "Bạn có thể bỏ qua bước này và thêm mùa sau."}
        </p>
        <div className="flex gap-3">
          {hasUnsavedChanges && (
            <Button
              type="button"
              variant="secondary"
              onClick={saveAllSeasons}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu tất cả
                </>
              )}
            </Button>
          )}
          <Button
            type="button"
            onClick={onNext}
            disabled={loading || hasUnsavedChanges}
          >
            Tiếp theo
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
