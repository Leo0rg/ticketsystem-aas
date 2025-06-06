"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/app/trpc-provider";
import { useRouter } from "next/navigation";

interface TelegramAuthButtonProps {
  email?: string; // Если указан email, то это вход, иначе регистрация
  botUsername: string;
  className?: string;
}

export function TelegramAuthButton({ 
  email, 
  botUsername,
  className = ""
}: TelegramAuthButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Получаем функцию для создания токена
  const createTokenMutation = trpc.user.createTelegramAuthToken.useMutation();
  
  const handleAuth = async () => {
    setIsLoading(true);
    
    try {
      // Создаем токен для авторизации
      const { token } = await createTokenMutation.mutateAsync({
        email, // Если null/undefined, то это регистрация
        isRegister: !email, // Если email не указан, значит регистрация
      });
      
      // Формируем ссылку на бота с командой /start и токеном
      const telegramUrl = `https://t.me/${botUsername}?start=auth_${token}`;
      
      // Открываем ссылку в новом окне/вкладке
      window.open(telegramUrl, "_blank");
      
      // Оповещаем пользователя
      alert(
        email 
          ? "Откройте Telegram для входа и связывания аккаунта" 
          : "Откройте Telegram для регистрации"
      );
    } catch (error) {
      console.error("Ошибка при создании токена:", error);
      alert("Произошла ошибка при создании токена авторизации");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button 
      variant="outline" 
      className={`flex items-center gap-2 ${className}`}
      onClick={handleAuth}
      disabled={isLoading}
    >
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 10.38 15.84 14.22 15.51 15.99C15.37 16.74 15.09 16.99 14.83 17.02C14.25 17.07 13.81 16.64 13.25 16.27C12.37 15.69 11.87 15.33 11.02 14.77C10.03 14.12 10.67 13.76 11.24 13.18C11.39 13.03 13.95 10.7 14 10.49C14.0069 10.4582 14.006 10.4252 13.9973 10.3938C13.9886 10.3624 13.9724 10.3337 13.95 10.31C13.89 10.26 13.81 10.28 13.74 10.29C13.65 10.31 12.25 11.24 9.52 13.08C9.1 13.35 8.72 13.49 8.39 13.48C8.03 13.47 7.33 13.28 6.82 13.11C6.19 12.91 5.69 12.8 5.73 12.44C5.75 12.25 6 12.06 6.48 11.87C9.39 10.59 11.34 9.76 12.33 9.39C15.12 8.32 15.74 8.1 16.15 8.1C16.24 8.1 16.45 8.13 16.58 8.23C16.69 8.32 16.72 8.44 16.73 8.52C16.72 8.62 16.74 8.76 16.64 8.8Z" 
          fill="#229ED9"
        />
      </svg>
      {isLoading 
        ? "Загрузка..." 
        : email 
          ? "Войти через Telegram" 
          : "Регистрация через Telegram"}
    </Button>
  );
} 