"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      userId: "",
      title: "",
      message: "",
      type: "info",
    },
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User ID (Tùy chọn)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập ID người dùng (để trống để gửi cho tất cả)" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nếu để trống, thông báo sẽ không được gửi tới user cụ thể nào (hoặc broadcast tùy backend).
                    Để test chính mình, hãy nhập ID của bạn hoặc mở tab khác.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề</FormLabel>
                    <FormControl>
                      <Input placeholder="Tiêu đề thông báo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại thông báo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại thông báo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="info">Thông tin (Info)</SelectItem>
                        <SelectItem value="success">Thành công (Success)</SelectItem>
                        <SelectItem value="warning">Cảnh báo (Warning)</SelectItem>
                        <SelectItem value="error">Lỗi (Error)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Nội dung chi tiết của thông báo..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
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
        </Form>
      </CardContent>
    </Card>
  );
}
