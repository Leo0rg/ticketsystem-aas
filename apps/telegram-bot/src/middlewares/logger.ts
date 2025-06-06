import { Context, NextFunction } from "grammy";
import { MyContext } from "../index";

/**
 * Middleware для логирования сообщений
 */
export async function loggerMiddleware(ctx: MyContext, next: NextFunction) {
  const start = Date.now();
  const chatId = ctx.chat?.id;
  const username = ctx.from?.username;
  const firstName = ctx.from?.first_name;
  const lastName = ctx.from?.last_name;
  
  // Логируем входящее сообщение
  console.log(
    `👤 Получено сообщение от ${firstName || ""} ${lastName || ""} (@${username || "unknown"}) в чате ${chatId}`
  );
  
  // Продолжаем обработку
  await next();
  
  // Логируем время обработки
  const ms = Date.now() - start;
  console.log(`⏱️ Время обработки: ${ms}ms`);
} 