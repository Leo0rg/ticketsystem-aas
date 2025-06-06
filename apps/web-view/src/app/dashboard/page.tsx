"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/app/trpc-provider";
import { type Ticket, type Comment, type User } from "@aas/db";

// Добавляем user и handler в тип Ticket для удобства
type TicketWithUser = Ticket & { 
  user?: { name?: string | null };
  comments?: Comment[];
  handler?: User | null;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("active");
  
  const isPrivilegedUser = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPPORT';

  // Получение заявок в зависимости от роли
  const { data: userTickets, isLoading: isLoadingUserTickets } = trpc.ticket.getUserTickets.useQuery(
    undefined,
    {
      enabled: status === "authenticated" && !isPrivilegedUser,
      refetchOnWindowFocus: false,
    }
  );

  const { data: allTickets, isLoading: isLoadingAllTickets } = trpc.ticket.getAll.useQuery(
    undefined,
    {
      enabled: status === "authenticated" && isPrivilegedUser,
      refetchOnWindowFocus: false,
    }
  );
  
  const tickets = (isPrivilegedUser ? allTickets : userTickets) as TicketWithUser[] | undefined;
  const isLoading = isPrivilegedUser ? isLoadingAllTickets : isLoadingUserTickets;

  // Перенаправление на страницу логина, если пользователь не авторизован
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Фильтрация заявок по статусу
  const filteredTickets = tickets?.filter((ticket) => {
    if (activeTab === "active") {
      return ["PENDING", "IN_PROGRESS"].includes(ticket.status);
    } else if (activeTab === "resolved") {
      return ticket.status === "RESOLVED";
    } else if (activeTab === "canceled") {
      return ticket.status === "CANCELED";
    }
    return true;
  });

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 font-semibold">
            <Link href="/dashboard">
              <span className="text-lg sm:text-xl">Система заявок</span>
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            {/* <Link href="/dashboard/profile" className="text-sm hover:underline">
              Профиль
            </Link> */}
            <span className="text-sm">
              {session?.user?.name || session?.user?.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/api/auth/signout")}
            >
              Выйти
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <h1 className="text-2xl font-bold">
              {isPrivilegedUser ? 'Все заявки' : 'Мои заявки'}
            </h1>
            <Link href="/dashboard/new-ticket" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">Создать заявку</Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <div className="flex border-b">
              <button
                className={`flex-shrink-0 px-4 py-2 text-sm font-medium ${
                  activeTab === "active"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab("active")}
              >
                Активные
              </button>
              <button
                className={`flex-shrink-0 px-4 py-2 text-sm font-medium ${
                  activeTab === "resolved"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab("resolved")}
              >
                Решенные
              </button>
              <button
                className={`flex-shrink-0 px-4 py-2 text-sm font-medium ${
                  activeTab === "canceled"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab("canceled")}
              >
                Отмененные
              </button>
            </div>
          </div>

          {filteredTickets?.length === 0 ? (
            <div className="rounded-lg border bg-card p-8 text-center">
              <p className="text-muted-foreground">
                У вас пока нет заявок в этой категории
              </p>
              <Link href="/dashboard/new-ticket" className="mt-4 inline-block">
                <Button variant="outline" size="sm">
                  Создать заявку
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredTickets?.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/dashboard/ticket/${ticket.id}`}
                  className="block"
                >
                  <div className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row">
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <h3 className="font-semibold" title={ticket.title}>
                          {truncateText(ticket.title, 25)}
                        </h3>
                        <p
                          className="mt-1 text-sm text-muted-foreground"
                          title={ticket.description}
                        >
                          {truncateText(ticket.description, 25)}
                        </p>
                        {isPrivilegedUser && ticket.user && (
                          <p className="mt-2 text-xs font-medium text-gray-500">
                            Автор: {ticket.user.name}
                          </p>
                        )}
                        {ticket.handler && (
                          <p className="mt-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                            В работе у: {ticket.handler.name}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-row items-center gap-2 sm:flex-col sm:items-end">
                        <span
                          className={`inline-flex w-full items-center justify-center rounded-full px-2 py-1 text-xs font-medium sm:w-auto sm:justify-start ${
                            ticket.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500"
                              : ticket.status === "IN_PROGRESS"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500"
                              : ticket.status === "RESOLVED"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500"
                          }`}
                        >
                          {ticket.status === "PENDING"
                            ? "Ожидает"
                            : ticket.status === "IN_PROGRESS"
                            ? "В работе"
                            : ticket.status === "RESOLVED"
                            ? "Решено"
                            : "Отменено"}
                        </span>
                        <span
                          className={`inline-flex w-full items-center justify-center rounded-full px-2 py-1 text-xs font-medium sm:w-auto sm:justify-start ${
                            ticket.priority === "LOW"
                              ? "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                              : ticket.priority === "MEDIUM"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500"
                              : ticket.priority === "HIGH"
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500"
                          }`}
                        >
                          {ticket.priority === "LOW"
                            ? "Низкий"
                            : ticket.priority === "MEDIUM"
                            ? "Средний"
                            : ticket.priority === "HIGH"
                            ? "Высокий"
                            : "Срочный"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Создано:{" "}
                        {new Date(ticket.createdAt).toLocaleDateString("ru-RU")}
                      </span>
                      <span>
                        Комментарии: {ticket.comments?.length || 0}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 