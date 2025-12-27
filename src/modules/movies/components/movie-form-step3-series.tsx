"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { createSeason, createEpisode, getSeasons } from "../actions";
import { seasonStatusOptions } from "../const";
import type { Season, SeasonStatus, Episode } from "../types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface SeasonForm {
  number: number;
  releaseDate?: string;
  endDate?: string;
  status: SeasonStatus;
  episodeCount: number;
  episodes: EpisodeForm[];
  isExpanded: boolean;
  isSaved: boolean;
}

interface EpisodeForm {
  number: number;
  releaseDate?: string;
  isSaved: boolean;
}

interface MovieFormStep3Props {
  filmId: string;
  onNext: () => void;
  onBack: () => void;
}

export function MovieFormStep3Series({ filmId, onNext, onBack }: MovieFormStep3Props) {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [seasons, setSeasons] = useState<SeasonForm[]>([]);
  const [existingSeasons, setExistingSeasons] = useState<Season[]>([]);

  useEffect(() => {
    if (seasons.length === 0 && initialLoading) {
      loadExistingSeasons();
    }
  }, [filmId, initialLoading]);

  const loadExistingSeasons = async () => {
    setInitialLoading(true);
    try {
      const data = await getSeasons(filmId);
      setExistingSeasons(data);
      
      // Convert existing seasons to form data
      if (data.length > 0) {
        const seasonForms: SeasonForm[] = data.map((season) => ({
          number: season.number,
          releaseDate: season.releaseDate?.split("T")[0],
          endDate: season.endDate?.split("T")[0],
          status: season.status,
          episodeCount: season.episodes.length,
          episodes: season.episodes.map((ep) => ({
            number: ep.number,
            releaseDate: ep.releaseDate?.split("T")[0],
            isSaved: true,
          })),
          isExpanded: false,
          isSaved: true,
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
    const nextSeasonNumber = seasons.length > 0 
      ? Math.max(...seasons.map(s => s.number)) + 1 
      : 1;
    
    setSeasons([
      ...seasons,
      {
        number: nextSeasonNumber,
        status: "UPCOMING" as SeasonStatus,
        episodeCount: 0,
        episodes: [],
        isExpanded: true,
        isSaved: false,
      },
    ]);
  };

  const removeSeason = (index: number) => {
    setSeasons(seasons.filter((_, i) => i !== index));
  };

  const updateSeason = (index: number, updates: Partial<SeasonForm>) => {
    setSeasons(
      seasons.map((season, i) => (i === index ? { ...season, ...updates } : season))
    );
  };

  const toggleSeasonExpanded = (index: number) => {
    updateSeason(index, { isExpanded: !seasons[index].isExpanded });
  };

  const generateEpisodes = (index: number) => {
    const season = seasons[index];
    const episodes: EpisodeForm[] = [];
    
    for (let i = 1; i <= season.episodeCount; i++) {
      episodes.push({
        number: i,
        isSaved: false,
      });
    }
    
    updateSeason(index, { episodes });
  };

  const updateEpisode = (seasonIndex: number, episodeIndex: number, releaseDate: string) => {
    const updatedSeasons = [...seasons];
    updatedSeasons[seasonIndex].episodes[episodeIndex].releaseDate = releaseDate;
    setSeasons(updatedSeasons);
  };

  const saveSeason = async (index: number) => {
    const season = seasons[index];
    if (season.isSaved) return;

    setLoading(true);
    try {
      // Create season
      const seasonResult = await createSeason(filmId, {
        releaseDate: season.releaseDate,
        endDate: season.endDate,
        status: season.status,
      });

      if (!seasonResult.success) {
        toast.error(seasonResult.error || "Lỗi khi tạo mùa phim");
        setLoading(false);
        return;
      }

      // Create episodes for this season
      for (const episode of season.episodes) {
        if (!episode.isSaved) {
          const episodeResult = await createEpisode(
            filmId,
            season.number,
            { releaseDate: episode.releaseDate }
          );

          if (!episodeResult.success) {
            toast.error(`Lỗi khi tạo tập ${episode.number}`);
            continue;
          }
        }
      }

      updateSeason(index, { 
        isSaved: true,
        episodes: season.episodes.map(ep => ({ ...ep, isSaved: true }))
      });
      toast.success(`Đã lưu mùa ${season.number}`);
    } catch (error) {
      console.error("Error saving season:", error);
      toast.error("Đã xảy ra lỗi không mong muốn");
    } finally {
      setLoading(false);
    }
  };

  const saveAllSeasons = async () => {
    setLoading(true);
    for (let i = 0; i < seasons.length; i++) {
      if (!seasons[i].isSaved) {
        await saveSeason(i);
      }
    }
    setLoading(false);
  };

  const hasUnsavedChanges = seasons.some(s => !s.isSaved || s.episodes.some(ep => !ep.isSaved));

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Đang tải thông tin mùa phim...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cấu hình mùa và tập phim</CardTitle>
          <CardDescription>
            Thêm các mùa phim và số lượng tập cho mỗi mùa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {seasons.map((season, seasonIndex) => (
            <Card key={seasonIndex} className={season.isSaved ? "border-green-200" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleSeasonExpanded(seasonIndex)}
                    >
                      {season.isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    <div>
                      <CardTitle className="text-lg">
                        Mùa {season.number}
                      </CardTitle>
                      {season.episodes.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {season.episodes.length} tập
                        </p>
                      )}
                    </div>
                    {season.isSaved && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Đã lưu
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!season.isSaved && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => saveSeason(seasonIndex)}
                        disabled={loading || season.episodes.length === 0}
                      >
                        Lưu mùa
                      </Button>
                    )}
                    {!season.isSaved && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSeason(seasonIndex)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              {season.isExpanded && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`season-${seasonIndex}-status`}>Trạng thái</Label>
                      <Select
                        value={season.status}
                        onValueChange={(value) =>
                          updateSeason(seasonIndex, { status: value as SeasonStatus })
                        }
                        disabled={season.isSaved || loading}
                      >
                        <SelectTrigger id={`season-${seasonIndex}-status`}>
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
                      <Label htmlFor={`season-${seasonIndex}-releaseDate`}>
                        Ngày phát hành
                      </Label>
                      <Input
                        id={`season-${seasonIndex}-releaseDate`}
                        type="date"
                        value={season.releaseDate || ""}
                        onChange={(e) =>
                          updateSeason(seasonIndex, { releaseDate: e.target.value })
                        }
                        disabled={season.isSaved || loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`season-${seasonIndex}-endDate`}>Ngày kết thúc</Label>
                      <Input
                        id={`season-${seasonIndex}-endDate`}
                        type="date"
                        value={season.endDate || ""}
                        onChange={(e) =>
                          updateSeason(seasonIndex, { endDate: e.target.value })
                        }
                        disabled={season.isSaved || loading}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-end gap-2">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`season-${seasonIndex}-episodeCount`}>
                          Số lượng tập
                        </Label>
                        <Input
                          id={`season-${seasonIndex}-episodeCount`}
                          type="number"
                          min="1"
                          value={season.episodeCount || ""}
                          onChange={(e) =>
                            updateSeason(seasonIndex, {
                              episodeCount: Number(e.target.value),
                            })
                          }
                          placeholder="Nhập số lượng tập"
                          disabled={season.isSaved || loading}
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => generateEpisodes(seasonIndex)}
                        disabled={season.isSaved || loading || !season.episodeCount}
                      >
                        Tạo tập
                      </Button>
                    </div>

                    {season.episodes.length > 0 && (
                      <div className="space-y-2">
                        <Label>Danh sách tập</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2 border rounded-lg">
                          {season.episodes.map((episode, episodeIndex) => (
                            <div
                              key={episodeIndex}
                              className="flex items-center gap-2 p-2 border rounded"
                            >
                              <span className="font-medium min-w-15">
                                Tập {episode.number}
                              </span>
                              <Input
                                type="date"
                                value={episode.releaseDate || ""}
                                onChange={(e) =>
                                  updateEpisode(
                                    seasonIndex,
                                    episodeIndex,
                                    e.target.value
                                  )
                                }
                                placeholder="Ngày phát hành"
                                disabled={season.isSaved || loading}
                                className="flex-1"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}

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
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
          Quay lại
        </Button>
        <div className="flex gap-2">
          {hasUnsavedChanges && (
            <Button
              type="button"
              variant="secondary"
              onClick={saveAllSeasons}
              disabled={loading}
            >
              {loading ? "Đang lưu..." : "Lưu tất cả"}
            </Button>
          )}
          <Button
            type="button"
            onClick={onNext}
            disabled={loading || hasUnsavedChanges}
          >
            {seasons.length === 0 ? "Bỏ qua" : "Tiếp theo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
