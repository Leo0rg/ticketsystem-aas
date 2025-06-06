"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/app/trpc-provider";

export default function NewTicketPage() {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/login");
    },
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const createTicketMutation = trpc.ticket.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const newTicket = await createTicketMutation.mutateAsync({
        title,
        description,
        priority: priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
      });

      router.push(`/dashboard/ticket/${newTicket.id}`);
    } catch (error: any) {
      setError(error?.message || "Произошла ошибка при создании заявки");
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Загрузка...</p>
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
        </div>
      </header>

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h1 className="text-xl font-bold sm:text-2xl">Создание новой заявки</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Заполните форму для создания новой заявки
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium text-foreground"
              >
                Имя заявки
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Краткое описание проблемы"
                required
                minLength={5}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                От 5 до 100 символов
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-foreground"
              >
                Описание
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Подробное описание проблемы или запроса"
                required
                minLength={10}
              />
              <p className="text-xs text-muted-foreground">
                Минимум 10 символов
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="priority"
                className="text-sm font-medium text-foreground"
              >
                Приоритет
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="LOW">Низкий</option>
                <option value="MEDIUM">Средний</option>
                <option value="HIGH">Высокий</option>
                <option value="URGENT">Срочный</option>
              </select>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                type="submit"
                className="w-full sm:flex-1"
                disabled={isLoading}
              >
                {isLoading ? "Создание..." : "Создать заявку"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="w-full sm:w-auto"
              >
                Отмена
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 