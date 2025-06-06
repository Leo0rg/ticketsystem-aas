"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { TelegramAuthButton } from "@/components/ui/telegram-auth-button";
import { useTelegram } from "@/hooks/use-telegram";
import { trpc } from "@/app/trpc-provider";

// Получаем имя бота из переменных окружения
const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME as string;

export default function LoginPage() {
  const router = useRouter();
  const { user: tmaUser, isTma } = useTelegram();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const registerOrLoginMutation = trpc.user.registerOrLoginFromTMA.useMutation({
    onSuccess: async (data) => {
      // Используем специальный провайдер для входа через TMA
      const result = await signIn("telegram-tma", {
        redirect: false,
        telegramId: data.telegramId,
      });

      if (result?.error) {
        setError("Не удалось войти через Telegram.");
      } else {
        router.push("/dashboard");
      }
    },
    onError: (err) => {
      setError(`Ошибка: ${err.message}`);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const handleTmaLogin = () => {
    if (!tmaUser) {
      setError("Данные пользователя Telegram не найдены.");
      return;
    }
    setIsLoading(true);
    setError("");
    registerOrLoginMutation.mutate({
      telegramId: tmaUser.id,
      firstName: tmaUser.first_name,
      lastName: tmaUser.last_name,
      username: tmaUser.username,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Неверный email или пароль");
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (error) {
      setError("Произошла ошибка при входе");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Вход в систему</h1>
          <p className="mt-2 text-muted-foreground">
            {isTma && tmaUser
              ? "Нажмите кнопку ниже, чтобы продолжить"
              : "Введите свои данные для входа"}
          </p>
        </div>
        
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-center text-sm font-medium text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {isTma && tmaUser ? (
          <div className="space-y-4">
            <Button
              onClick={handleTmaLogin}
              disabled={isLoading}
              className="w-full h-14"
            >
              {isLoading ? (
                "Входим..."
              ) : (
                <div className="flex items-center gap-3">
                  {tmaUser.photo_url && (
                    <Image
                      src={tmaUser.photo_url}
                      alt="Avatar"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <span>Продолжить как {tmaUser.first_name}</span>
                </div>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Нажимая продолжить, вы соглашаетесь с нашими условиями обслуживания.
            </p>
          </div>
        ) : (
          <>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="example@mail.ru"
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium"
                >
                  Пароль
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Вход..." : "Войти"}
              </Button>
            </form>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Или
                </span>
              </div>
            </div>
            <TelegramAuthButton botUsername={botUsername} className="w-full" />
          </>
        )}
      </div>
    </div>
  );
} 