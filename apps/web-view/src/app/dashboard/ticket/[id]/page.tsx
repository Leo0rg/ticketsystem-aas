"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/app/trpc-provider";

// Определяем тип для параметров
type TicketPageParams = {
  params: {
    id: string;
  };
};

export default function TicketPage({ params }: TicketPageParams) {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/login");
    },
  });

  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ticketId = params.id;

  const { data: ticket, isLoading, refetch } = trpc.ticket.getById.useQuery(
    { id: ticketId },
    {
      enabled: status === "authenticated",
      refetchOnWindowFocus: false,
    }
  );

  const { data: user } = trpc.user.getCurrent.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  const addCommentMutation = trpc.ticket.addComment.useMutation({
    onSuccess: () => {
      refetch();
      setComment("");
      setIsSubmitting(false);
    },
    onError: () => {
      setIsSubmitting(false);
    },
  });

  const updateStatusMutation = trpc.ticket.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    await addCommentMutation.mutateAsync({
      ticketId: ticketId,
      text: comment,
    });
  };

  const handleStatusChange = async (status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CANCELED") => {
    await updateStatusMutation.mutateAsync({
      id: ticketId,
      status,
    });
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Заявка не найдена</h1>
          <p className="mt-2 text-muted-foreground">
            Запрашиваемая заявка не существует или у вас нет к ней доступа
          </p>
          <Button
            onClick={() => router.push("/dashboard")}
            className="mt-4"
          >
            Вернуться к списку заявок
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 font-semibold">
            <Link href="/dashboard">
              <span className="text-lg sm:text-xl">Система заявок</span>
            </Link>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            Назад
          </Button>
        </div>
      </header>

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold sm:text-2xl break-words">{ticket.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
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
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
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
                <span className="text-xs text-muted-foreground">
                  Создано: {new Date(ticket.createdAt).toLocaleDateString("ru-RU")}
                </span>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              {ticket.status !== "RESOLVED" && ticket.status !== "CANCELED" && (
                <>
                  {ticket.status === "PENDING" && (user?.role === "ADMIN" || user?.role === "SUPPORT") && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange("IN_PROGRESS")}
                    >
                      Взять в работу
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50"
                    onClick={() => handleStatusChange("RESOLVED")}
                  >
                    Отметить как решенную
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                    onClick={() => handleStatusChange("CANCELED")}
                  >
                    Отменить
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 sm:p-6">
            <h2 className="mb-2 font-semibold">Описание</h2>
            <p className="whitespace-pre-wrap text-sm break-words">{ticket.description}</p>
          </div>

          <div className="mt-8">
            <h2 className="mb-4 text-xl font-semibold">
              Комментарии ({ticket.comments?.length || 0})
            </h2>

            {ticket.comments && ticket.comments.length > 0 ? (
              <div className="space-y-4">
                {ticket.comments.map((comment: any) => (
                  <div
                    key={comment.id}
                    className="rounded-lg border bg-card p-4"
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{comment.text}</p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleString("ru-RU")}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                Нет комментариев
              </p>
            )}

            {(ticket.status === "PENDING" || ticket.status === "IN_PROGRESS") && (
              <form onSubmit={handleAddComment} className="mt-6">
                <div className="space-y-2">
                  <label
                    htmlFor="comment"
                    className="text-sm font-medium text-foreground"
                  >
                    Добавить комментарий
                  </label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Введите ваш комментарий..."
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="mt-2"
                  disabled={isSubmitting || !comment.trim()}
                >
                  {isSubmitting ? "Отправка..." : "Отправить"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 