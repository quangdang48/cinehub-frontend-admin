"use client";

import { useState, useTransition, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Send, Users, User, UsersRound } from "lucide-react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { broadcastToAllUsers, sendNotificationToUser, sendNotificationToUsers, UserSelectItem } from "../actions";
import { UserSelector } from "./user-selector";
import { MultiUserSelector } from "./multi-user-selector";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";

const broadcastSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tiêu đề"),
  message: z.string().min(1, "Vui lòng nhập nội dung"),
  type: z.enum(["info", "success", "warning", "error"]),
});

const userNotificationSchema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.email(),
  }),
  title: z.string().min(1, "Vui lòng nhập tiêu đề"),
  message: z.string().min(1, "Vui lòng nhập nội dung"),
  type: z.enum(["info", "success", "warning", "error"]),
});

const groupNotificationSchema = z.object({
  users: z.array(z.object({
    id: z.string(),
    name: z.string(),
    email: z.email(),
  })).min(1, "Vui lòng chọn ít nhất một user"),
  title: z.string().min(1, "Vui lòng nhập tiêu đề"),
  message: z.string().min(1, "Vui lòng nhập nội dung"),
  type: z.enum(["info", "success", "warning", "error"]),
});

type BroadcastFormValues = z.infer<typeof broadcastSchema>;
type UserNotificationFormValues = z.infer<typeof userNotificationSchema>;
type GroupNotificationFormValues = z.infer<typeof groupNotificationSchema>;

interface NotificationSenderProps {
  // Props kept for backward compatibility but not used
}

export function NotificationSender(_props: NotificationSenderProps) {
  const [isPending, startTransition] = useTransition();
  const [sendMode, setSendMode] = useState<"broadcast" | "user" | "group">("broadcast");
  const [selectedUser, setSelectedUser] = useState<UserSelectItem | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<UserSelectItem[]>([]);
  
  const broadcastForm = useForm<BroadcastFormValues>({
    resolver: zodResolver(broadcastSchema as any),
    defaultValues: {
      title: "",
      message: "",
      type: "info",
    },
  });

  const userForm = useForm<UserNotificationFormValues>({
    resolver: zodResolver(userNotificationSchema as any),
    defaultValues: {
      user: {
        id: "",
        name: "",
        email: "",
      },
      title: "",
      message: "",
      type: "info",
    },
  });

  const groupForm = useForm<GroupNotificationFormValues>({
    resolver: zodResolver(groupNotificationSchema as any),
    defaultValues: {
      users: [],
      title: "",
      message: "",
      type: "info",
    },
    mode: "onSubmit", // Hoặc "onChange" tùy nhu cầu validation
  });

  function onBroadcastSubmit(data: BroadcastFormValues) {
    startTransition(async () => {
      const result = await broadcastToAllUsers(data);
      
      if (result.success) {
        toast.success(result.message);
        broadcastForm.reset({
          title: "",
          message: "",
          type: "info",
        });
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

  function onGroupSubmit(data: GroupNotificationFormValues) {
    if (selectedUsers.length === 0) {
      toast.error("Vui lòng chọn ít nhất một user để gửi thông báo");
      return;
    }

    startTransition(async () => {
      const userIds = selectedUsers.map(u => u.id);
      const result = await sendNotificationToUsers(userIds, data);
      
      if (result.success) {
        toast.success(result.message);
        groupForm.reset({
          title: "",
          message: "",
          type: "info",
        });
        setSelectedUsers([]);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Gửi thông báo đến Client</CardTitle>
        <CardDescription>
          Gửi thông báo realtime đến users qua WebSocket.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={sendMode} onValueChange={(v) => setSendMode(v as "broadcast" | "user" | "group")} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="broadcast" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Tất cả
            </TabsTrigger>
            <TabsTrigger value="user" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              1 User
            </TabsTrigger>
            <TabsTrigger value="group" className="flex items-center gap-2">
              <UsersRound className="h-4 w-4" />
              Nhóm
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="broadcast">
              <form onSubmit={broadcastForm.handleSubmit(onBroadcastSubmit)} className="space-y-6">
                <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
                  Thông báo sẽ được gửi đến <strong>tất cả users</strong> trong hệ thống qua WebSocket.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* TITLE FIELD */}
                  <Controller
                    name="title"
                    control={broadcastForm.control}
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
                    control={broadcastForm.control}
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
                  control={broadcastForm.control}
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
                      Gửi đến tất cả users
                    </>
                  )}
                </Button>
              </form>
          </TabsContent>
          
          <TabsContent value="user">
              <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-6">
                <Controller
                  name="user"
                  control={userForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Chọn User</FieldLabel>
                      <UserSelector
                        value={selectedUser}
                        onSelect={(user) => {
                          setSelectedUser(user);
                          field.onChange(user);
                        }}
                        placeholder="Tìm và chọn user..."
                        disabled={isPending}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>

                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* TITLE FIELD */}
                  <Controller
                    name="title"
                    control={userForm.control}
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
                    control={userForm.control}
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
                  control={userForm.control}
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
          </TabsContent>

          <TabsContent value="group">
              <form onSubmit={groupForm.handleSubmit(onGroupSubmit)} className="space-y-6">
                <Controller
                  name="users"
                  control={groupForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Chọn Users</FieldLabel>
                      <MultiUserSelector
                        value={selectedUsers}
                        onSelect={(users) => {
                          setSelectedUsers(users);
                          field.onChange(users);
                        }}
                        placeholder="Tìm và chọn users..."
                        disabled={isPending}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* TITLE FIELD */}
                  <Controller
                    name="title"
                    control={groupForm.control}
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
                    control={groupForm.control}
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
                  control={groupForm.control}
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

                <Button type="submit" className="w-full" disabled={isPending || selectedUsers.length === 0}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Gửi thông báo tới {selectedUsers.length} User{selectedUsers.length > 1 ? "s" : ""}
                    </>
                  )}
                </Button>
              </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}