import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .email({ message: "Địa chỉ email không hợp lệ" })
    .min(1, "Email là bắt buộc"),
  password: z
    .string()
    .min(1, "Mật khẩu là bắt buộc")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Tên là bắt buộc"),
  gender: z.enum(["male", "female"], "Giới tính không hợp lệ"),
  avatar: z.any()
    .optional()
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, "File không được quá 5MB")
    .refine((file) => !file || ["image/jpeg", "image/png", "image/webp"].includes(file.type), "Chỉ hỗ trợ .jpg, .png, .webp"),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Mật khẩu cũ là bắt buộc"),
  newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(1, "Xác nhận mật khẩu là bắt buộc"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});
