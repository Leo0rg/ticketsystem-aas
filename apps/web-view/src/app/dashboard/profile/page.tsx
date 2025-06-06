"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { trpc } from "@/app/trpc-provider";
import Link from "next/link";
import { TRPCClientErrorLike } from "@trpc/client";
import { AppRouter } from "@aas/api";

export default function ProfilePage() {
  const router = useRouter();
  const [telegramId, setTelegramId] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  // Запрашиваем данные пользователя
  const { data: user, isLoading: isLoadingUser } = trpc.user.getCurrent.useQuery();
  
  // Мутация для обновления профиля
  const updateProfile = trpc.user.update.useMutation({
    onSuccess: () => {
      setSuccessMessage("Профиль успешно обновлен!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      setError(error.message);
    }
  });

  // Заполняем форму данными пользователя при загрузке
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setTelegramId(user.telegramId || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      await updateProfile.mutateAsync({
        name,
        telegramId
      });
    } catch (e) {
      // Ошибки уже обрабатываются в onError
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Загрузка профиля...</p>
      </div>
    );
  }

  // Имя Telegram-бота из переменных окружения или фиксированное значение
  const botName = "AASupportBot"; // Здесь будет имя вашего бота

  return (
    <div className="container max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-xl font-bold sm:text-2xl">Настройки профиля</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {successMessage && (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-600 dark:bg-green-900/30 dark:text-green-400">
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Ваше имя
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            placeholder="Иван Иванов"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="telegramId" className="text-sm font-medium">
            Telegram ID
          </label>
          <input
            id="telegramId"
            type="text"
            value={telegramId}
            onChange={(e) => setTelegramId(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            placeholder="123456789"
          />
          <div className="mt-1 text-xs text-muted-foreground">
            <p>Чтобы получить ваш Telegram ID:</p>
            <ol className="list-decimal pl-4 pt-1">
              <li>Откройте Telegram и найдите бота <code>@userinfobot</code></li>
              <li>Отправьте боту любое сообщение</li>
              <li>Бот ответит вам с информацией, включая ваш ID</li>
            </ol>
            <p className="pt-1">После сохранения ID вы сможете использовать бота <code>@{botName}</code> для отправки заявок.</p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </div>
      </form>
    </div>
  );
} 