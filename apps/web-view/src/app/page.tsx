"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { trpc } from "./trpc-provider";

export default function Home() {
  const [isTMA, setIsTMA] = useState<boolean | null>(null);
  const [tmaInfo, setTmaInfo] = useState<Record<string, any>>({});
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);
  const [loginStatus, setLoginStatus] = useState<string | null>(null);
  
  const router = useRouter();
  const { status } = useSession();
  
  // tRPC запрос к пользователям по telegramId
  const { data: userByTelegramId, isLoading } = trpc.user.getByTelegramId.useQuery(
    { telegramId: telegramId || "" },
    { 
      enabled: !!telegramId && isTMA === true && !autoLoginAttempted,
      retry: false
    }
  );
  
  useEffect(() => {
    // Проверяем наличие telegram WebApp API
    const telegram = (window as any).Telegram?.WebApp;
    setIsTMA(!!telegram);
    
    if (telegram) {
      // Получаем данные пользователя из initData
      try {
        const initData = telegram.initDataUnsafe || {};
        const user = initData.user || {};
        
        setTmaInfo({
          initDataUnsafe: initData,
          colorScheme: telegram.colorScheme,
          version: telegram.version,
          platform: telegram.platform,
          isExpanded: telegram.isExpanded,
          viewportHeight: telegram.viewportHeight,
          viewportStableHeight: telegram.viewportStableHeight,
          user
        });
        
        // Если есть данные пользователя, сохраняем telegramId
        if (user && user.id) {
          setTelegramId(String(user.id));
          setLoginStatus("Получен Telegram ID: " + user.id);
        }
      } catch (error) {
        console.error("Ошибка при обработке TMA данных:", error);
        setLoginStatus("Ошибка при получении данных из TMA");
      }
    }
  }, []);
  
  // Если получили данные пользователя по telegramId, выполняем вход
  useEffect(() => {
    const autoLogin = async () => {
      if (userByTelegramId && !autoLoginAttempted && telegramId) {
        setAutoLoginAttempted(true);
        setLoginStatus("Пользователь найден, выполняется вход...");
        
        try {
          // Используем кастомный провайдер для входа по telegramId
          const result = await signIn("telegram-id", {
            telegramId,
            redirect: false
          });
          
          if (result?.ok) {
            setLoginStatus("Вход выполнен успешно, перенаправление...");
            // Успешный вход - переходим на дэшборд
            router.push("/dashboard");
          } else {
            setLoginStatus("Ошибка при входе: " + (result?.error || "неизвестная ошибка"));
          }
        } catch (error) {
          console.error("Ошибка автоматического входа:", error);
          setLoginStatus("Ошибка при входе: " + String(error));
        }
      } else if (!isLoading && telegramId && !userByTelegramId && !autoLoginAttempted) {
        setAutoLoginAttempted(true);
        setLoginStatus("Пользователь с таким Telegram ID не найден");
      }
    };
    
    autoLogin();
  }, [userByTelegramId, autoLoginAttempted, telegramId, router, isLoading]);
  
  // Условие для показа баннера автоматического входа
  const showAutoLoginBanner =
    isTMA && userByTelegramId && !isLoading && status !== "authenticated";
  
  // Если пользователь уже авторизован - редирект на дэшборд
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Баннер автоматического входа для TMA */}
      {showAutoLoginBanner && (
        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 text-center">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300 animate-pulse">
            Обнаружен аккаунт Telegram. Выполняем автоматический вход...
          </p>
        </div>
      )}
      
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex mx-auto h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2 font-semibold">
            <span className="text-xl">Система заявок</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Войти</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="container flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8">
        <section className="py-12 md:py-16 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Управление заявками стало проще
            </h1>
            <p className="mt-4 text-muted-foreground md:text-xl">
              Создавайте заявки, отслеживайте их статус и получайте уведомления
              об изменениях в режиме реального времени.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/login">
                <Button size="lg">Начать работу</Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg">
                  Узнать больше
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Создание заявок</h3>
              <p className="mt-2 text-muted-foreground">
                Легко создавайте заявки с подробным описанием и приоритетом.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Отслеживание статуса</h3>
              <p className="mt-2 text-muted-foreground">
                Следите за изменениями статуса ваших заявок в реальном времени.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Уведомления</h3>
              <p className="mt-2 text-muted-foreground">
                Получайте уведомления о важных изменениях через Telegram.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-8">
        <div className="container flex mx-auto flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Система заявок. Все права защищены.
          </p>
        </div>
      </footer>
    </div>
  );
}
