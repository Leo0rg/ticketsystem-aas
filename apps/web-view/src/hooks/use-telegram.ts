import { useEffect, useState } from "react";

// Определяем тип для пользователя Telegram
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

// Определяем тип для объекта WebApp из скрипта Telegram
interface TelegramWebApp {
  initDataUnsafe: {
    user?: TelegramUser;
  };
  ready: () => void;
}

// Расширяем интерфейс Window, чтобы TypeScript знал о Telegram.WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

/**
 * Хук для работы с Telegram Mini App API.
 * Возвращает данные о пользователе и флаг, указывающий на запуск в среде TMA.
 */
export function useTelegram() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isTma, setIsTma] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp) {
      const { WebApp } = window.Telegram;
      WebApp.ready(); // Сообщаем Telegram, что приложение готово
      
      const tmaUser = WebApp.initDataUnsafe.user;

      if (tmaUser) {
        setUser(tmaUser);
      }
      setIsTma(true);
    }
  }, []);

  return {
    user,
    isTma,
  };
} 