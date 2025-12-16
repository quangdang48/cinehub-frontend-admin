import { Suspense } from "react";

import { LoginForm } from "@/modules/auth/components";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md mx-4">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-primary-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m7 2 5 5-5 5" />
            <path d="m17 7-5 5 5 5" />
          </svg>
        </div>
        <CardTitle className="text-2xl">Đăng nhập CineHub</CardTitle>
        <CardDescription>Đăng nhập vào trang quản trị</CardDescription>
      </CardHeader>

      <CardContent>
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
