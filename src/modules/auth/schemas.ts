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
