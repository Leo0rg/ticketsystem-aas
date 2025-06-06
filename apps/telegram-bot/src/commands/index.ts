import { Bot } from "grammy";
import { startCommand } from "./start";
import { helpCommand } from "./help";
import { ticketsCommand } from "./tickets";
import { MyContext } from "../index";

/**
 * Настройка команд бота
 */
export function setupCommands(bot: Bot<MyContext>) {
  // Регистрируем команды в Telegram
  bot.api.setMyCommands([
    { command: "start", description: "Начать работу с ботом" },
    { command: "help", description: "Получить справку" },
    { command: "tickets", description: "Мои заявки" },
  ]);

  // Обработчики команд
  startCommand(bot);
  helpCommand(bot);
  ticketsCommand(bot);
} 