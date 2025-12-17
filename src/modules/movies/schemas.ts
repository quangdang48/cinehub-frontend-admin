import { z } from "zod";
import { AgeLimit, FilmStatus, FilmType } from "./types";

export const castSchema = z.object({
  character: z.string().min(1, "Tên nhân vật là bắt buộc"),
  actorId: z.string().min(1, "Vui lòng chọn diễn viên"),
});

export const movieSchema = z.object({
  title: z
    .string()
    .min(1, "Tiêu đề là bắt buộc")
    .max(255, "Tiêu đề không được quá 255 ký tự"),
  originalTitle: z
    .string()
    .min(1, "Tiêu đề gốc là bắt buộc")
    .max(255, "Tiêu đề gốc không được quá 255 ký tự"),
  englishTitle: z
    .string()
    .min(1, "Tiêu đề tiếng Anh là bắt buộc")
    .max(255, "Tiêu đề tiếng Anh không được quá 255 ký tự"),
  description: z
    .string()
    .min(10, "Mô tả phải có ít nhất 10 ký tự")
    .max(5000, "Mô tả không được quá 5000 ký tự")
    .optional()
    .or(z.literal("")),
  ageLimit: z.enum(AgeLimit),
  country: z
    .string()
    .min(1, "Quốc gia là bắt buộc")
    .max(100, "Quốc gia không được quá 100 ký tự"),
  releaseDate: z.string().min(1, "Ngày phát hành là bắt buộc"),
  status: z.enum(FilmStatus),
  type: z.enum(FilmType),
  directors: z.array(z.string()).optional().default([]),
  casts: z.array(castSchema).optional().default([]),
  genres: z.array(z.string()).optional().default([]),
});