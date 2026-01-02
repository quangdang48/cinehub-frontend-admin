"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Send, X, Users, User } from "lucide-react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sendNotification, sendNotificationToUser, UserSelectItem } from "../actions";
import { UserSelector } from "./user-selector";

const notificationSchema = z.object({
  clientId: z.string().optional(),
  userId: z.string().optional(),
  title: z.string().min(1, "Vui lòng nhập tiêu đề"),
  message: z.string().min(1, "Vui lòng nhập nội dung"),
  type: z.enum(["info", "success", "warning", "error"]),
});

const userNotificationSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tiêu đề"),
  message: z.string().min(1, "Vui lòng nhập nội dung"),
  type: z.enum(["info", "success", "warning", "error"]),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;
type UserNotificationFormValues = z.infer<typeof userNotificationSchema>;

interface NotificationSenderProps {
  selectedClientId?: string;
  onClearClient?: () => void;
}

export function NotificationSender({ selectedClientId, onClearClient }: NotificationSenderProps) {
  const [isPending, startTransition] = useTransition();
  const [sendMode, setSendMode] = useState<"sse" | "user">("sse");
  const [selectedUser, setSelectedUser] = useState<UserSelectItem | null>(null);
  
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      clientId: "",
      userId: "",
      title: "",
      message: "",
      type: "info",
    },
  });

  const userForm = useForm<UserNotificationFormValues>({
    resolver: zodResolver(userNotificationSchema),
    defaultValues: {
      title: "",
      message: "",
      type: "info",
    },
  });

  useEffect(() => {
    if (selectedClientId) {
      form.setValue("clientId", selectedClientId);
    }
  }, [selectedClientId, form]);

  function onSubmit(data: NotificationFormValues) {
    startTransition(async () => {
      const result = await sendNotification(data);
      
      if (result.success) {
        toast.success(result.message);
        form.reset({
          clientId: "",
          userId: "",
          title: "",
          message: "",
          type: "info",
        });
        onClearClient?.();
      } else {
        toast.error(result.message);
      }
    });
  }

  function onUserSubmit(data: UserNotificationFormValues) {
    if (!selectedUser) {
      toast.error("Vui lòng chọn user để gửi thông báo");
      return;
    }

    startTransition(async () => {
      const result = await sendNotificationToUser(selectedUser.id, data);
      
      if (result.success) {
        toast.success(result.message);
        userForm.reset({
          title: "",
          message: "",
          type: "info",
        });
        setSelectedUser(null);
      } else {
        toast.error(result.message);
      }
    });
  }

  const handleClearClient = () => {
    form.setValue("clientId", "");
    onClearClient?.();
  };

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Gửi thông báo</CardTitle>
        <CardDescription>
          Gửi thông báo realtime tới hệ thống hoặc user cụ thể.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={sendMode} onValueChange={(v) => setSendMode(v as "sse" | "user")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="sse" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              SSE Client
            </TabsTrigger>
            <TabsTrigger value="user" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              User (Socket.IO)
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sse">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client ID (Target)</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input placeholder="Chọn từ danh sách hoặc nhập ID..." {...field} />
                        </FormControl>
                        {field.value && (
                          <Button type="button" variant="ghost" size="icon" onClick={handleClearClient}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <FormDescription>
                        ID của kết nối cụ thể. Nếu để trống sẽ broadcast tới tất cả.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                      Gửi thông báo SSE
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="user">
            <Form {...userForm}>
              <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-6">
                <FormItem>
                  <FormLabel>Chọn User</FormLabel>
                  <UserSelector
                    value={selectedUser}
                    onSelect={setSelectedUser}
                    placeholder="Tìm và chọn user..."
                    disabled={isPending}
                  />
                  <FormDescription>
                    Chọn user để gửi thông báo qua WebSocket (Socket.IO).
                  </FormDescription>
                </FormItem>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={userForm.control}
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
                    control={userForm.control}
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
                  control={userForm.control}
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

                <Button type="submit" className="w-full" disabled={isPending || !selectedUser}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Gửi thông báo tới User
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
