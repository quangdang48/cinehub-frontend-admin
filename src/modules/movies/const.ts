import { AgeLimit, FilmStatus, FilmType, SeasonStatus } from "./types";

export const statusOptions: { value: FilmStatus; label: string }[] = [
  { value: FilmStatus.UPCOMING, label: "Sắp ra mắt" },
  { value: FilmStatus.RELEASING, label: "Đang phát hành" },
  { value: FilmStatus.ENDED, label: "Đã kết thúc" },
];

export const seasonStatusOptions: { value: SeasonStatus; label: string }[] = [
  { value: SeasonStatus.UPCOMING, label: "Sắp ra mắt" },
  { value: SeasonStatus.RELEASING, label: "Đang phát hành" },
  { value: SeasonStatus.ENDED, label: "Đã kết thúc" },
];

export const typeOptions: { value: FilmType; label: string }[] = [
  { value: FilmType.MOVIE, label: "Phim lẻ" },
  { value: FilmType.SERIES, label: "Phim bộ" },
];

export const ageLimitOptions: { value: AgeLimit; label: string }[] = [
  { value: AgeLimit.ALL, label: "Mọi lứa tuổi" },
  { value: AgeLimit.P, label: "P - Phổ thông" },
  { value: AgeLimit.K, label: "K - Dưới 13 tuổi" },
  { value: AgeLimit.T13, label: "T13 - Từ 13 tuổi" },
  { value: AgeLimit.T16, label: "T16 - Từ 16 tuổi" },
  { value: AgeLimit.T18, label: "T18 - Từ 18 tuổi" },
];