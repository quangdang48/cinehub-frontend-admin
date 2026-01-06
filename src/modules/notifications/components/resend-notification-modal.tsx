"use client";

import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Send, Loader2, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Notification } from "../types";
import {
  broadcastToAllUsers,
  sendNotificationToUser,
  sendNotificationToUsers,
} from "../actions";

interface ResendNotificationModalProps {
  notification: Notification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const resendSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tiêu đề"),
  message: z.string().min(1, "Vui lòng nhập nội dung"),
  type: z.enum(["info", "success", "warning", "error"]),
});

type ResendFormValues = z.infer<typeof resendSchema>;

export function ResendNotificationModal({
  notification,
  open,
  onOpenChange,
  onSuccess,
}: ResendNotificationModalProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ResendFormValues>({
    resolver: zodResolver(resendSchema),
    defaultValues: {
      title: notification?.title || "",
      message: notification?.message || "",
      type: notification?.type || "info",
    },
  });

  // Reset form when notification changes
  if (notification && form.getValues("title") !== notification.title) {
    form.reset({
      title: notification.title,
      message: notification.message,
      type: notification.type,
    });
  }

  const handleSubmit = (data: ResendFormValues) => {
    if (!notification) return;

    startTransition(async () => {
      let result;

      switch (notification.targetType) {
        case "broadcast":
          result = await broadcastToAllUsers(data);
          break;

        case "single":
          const targetUserId =
            notification.targetUsers?.[0]?.id ||
            notification.targetUser?.id ||
            notification.targetUserId;
          if (!targetUserId) {
            toast.error("Không tìm thấy thông tin người nhận");
            return;
          }
          result = await sendNotificationToUser(targetUserId, data);
          break;

        case "group":
          const userIds = notification.targetUsers?.map((u) => u.id) || [];
          if (userIds.length === 0) {
            toast.error("Không tìm thấy danh sách người nhận");
            return;
          }
          result = await sendNotificationToUsers(userIds, data);
          break;

        default:
          result = await broadcastToAllUsers(data);
      }

      if (result.success) {
        toast.success(result.message || "Gửi lại thông báo thành công");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.message || "Gửi lại thông báo thất bại");
      }
    });
  };

  if (!notification) return null;

  const getTargetLabel = () => {
    switch (notification.targetType) {
      case "broadcast":
        return "Tất cả người dùng";
      case "single":
        const singleUser = notification.targetUsers?.[0] || notification.targetUser;
        return singleUser?.name || singleUser?.email || "1 người dùng";
      case "group":
        const count = notification.targetUsers?.length || 0;
        return `${count} người dùng`;
      default:
        return "Tất cả người dùng";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Gửi lại thông báo
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Target Info */}
          <div className="rounded-md bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">
              Gửi đến:{" "}
              <Badge variant="secondary" className="ml-1">
                {getTargetLabel()}
              </Badge>
            </p>
          </div>

          {/* Title */}
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

          {/* Type */}
          <Controller
            name="type"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Loại thông báo</FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
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

          {/* Message */}
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
                  className="min-h-[100px]"
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription>
                  Bạn có thể chỉnh sửa nội dung trước khi gửi lại.
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Gửi lại
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
