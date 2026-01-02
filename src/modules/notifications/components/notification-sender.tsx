"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sendNotification } from "../actions";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";

const notificationSchema = z.object({
  userId: z.string().optional(),
  title: z.string().min(1, "Vui lòng nhập tiêu đề"),
  message: z.string().min(1, "Vui lòng nhập nội dung"),
  type: z.enum(["info", "success", "warning", "error"]),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

export function NotificationSender() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema as any),
    defaultValues: {
      userId: "",
      title: "",
      message: "",
      type: "info",
    },
    mode: "onSubmit", // Hoặc "onChange" tùy nhu cầu validation
  });

  function onSubmit(data: NotificationFormValues) {
    startTransition(async () => {
      const result = await sendNotification(data);

      if (result.success) {
        toast.success(result.message);
        form.reset();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Gửi thông báo</CardTitle>
        <CardDescription>
          Gửi thông báo realtime tới hệ thống.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* USER ID FIELD (Optional) */}
          {/* <Controller
            name="userId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>User ID (Tùy chọn)</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="Nhập ID người dùng..."
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription>Để trống để gửi cho tất cả users.</FieldDescription>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          /> */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* TITLE FIELD */}
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Tiêu đề</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Tiêu đề thông báo"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* TYPE FIELD (Select) */}
            <Controller
              name="type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Loại thông báo</FieldLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Chọn loại thông báo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Thông tin (Info)</SelectItem>
                      <SelectItem value="success">Thành công (Success)</SelectItem>
                      <SelectItem value="warning">Cảnh báo (Warning)</SelectItem>
                      <SelectItem value="error">Lỗi (Error)</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>

          {/* MESSAGE FIELD (Textarea) */}
          <Controller
            name="message"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Nội dung</FieldLabel>
                <Textarea
                  {...field}
                  id={field.name}
                  placeholder="Nội dung chi tiết của thông báo..."
                  className="min-h-25"
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription>
                  Nội dung chính sẽ hiển thị tới người dùng.
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Gửi thông báo
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}