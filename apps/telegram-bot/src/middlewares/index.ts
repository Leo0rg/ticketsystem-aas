import { Bot } from "grammy";
import { loggerMiddleware } from "./logger";
import { errorMiddleware } from "./error";
import { MyContext } from "../index";

/**
 * Настройка middlewares бота
 */
export function setupMiddlewares(bot: Bot<MyContext>) {
  // Логирование
  bot.use(loggerMiddleware);
  
  // Обработка ошибок
  bot.use(errorMiddleware);
} 