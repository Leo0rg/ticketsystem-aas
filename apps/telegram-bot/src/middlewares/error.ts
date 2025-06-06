import { Context, NextFunction } from "grammy";
import { MyContext } from "../index";

/**
 * Middleware для обработки ошибок
 */
export async function errorMiddleware(ctx: MyContext, next: NextFunction) {
  try {
    // Продолжаем обработку
    await next();
  } catch (error) {
    // Логируем ошибку
    console.error("Ошибка при обработке сообщения:", error);
    
    // Отправляем сообщение пользователю
    await ctx.reply(
      "Произошла ошибка при обработке вашего запроса. " +
      "Пожалуйста, попробуйте позже или обратитесь в поддержку."
    );
  }
} 