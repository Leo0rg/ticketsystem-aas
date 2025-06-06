import { Bot } from "grammy";
import { MyContext } from "../index";

/**
 * Команда /help
 */
export function helpCommand(bot: Bot<MyContext>) {
  bot.command("help", async (ctx) => {
    await ctx.reply(
      `📋 Справка по командам:\n\n` +
      `/start - начать работу с ботом\n` +
      `/help - показать это сообщение\n` +
      `/tickets - просмотреть ваши заявки\n\n` +
      `Чтобы создать новую заявку, просто напишите мне сообщение с описанием проблемы.\n\n` +
      `Для просмотра статуса заявки используйте команду /tickets и выберите интересующую вас заявку.`
    );
  });
} 