"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { useEffect } from "react";
import { trpc } from "../trpc-provider";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Получаем текущего пользователя для проверки роли
  const { data: user, isLoading } = trpc.user.getCurrent.useQuery(
    undefined,
    {
      enabled: status === "authenticated",
      retry: 1,
    }
  );

  // Перенаправляем неавторизованных пользователей на страницу входа
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Проверяем роль пользователя
  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      // Если пользователь не админ, перенаправляем на веб-вью
      router.push(process.env.NEXT_PUBLIC_APP_URL + "/dashboard");
    }
  }, [user, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Загрузка...</p>
      </div>
    );
  }

  // Если пользователь не админ, не отображаем содержимое
  if (user && user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-auto">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
} 