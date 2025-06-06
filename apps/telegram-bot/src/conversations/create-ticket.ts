import { Bot, InlineKeyboard } from "grammy";
import { prisma } from "../services/prisma";
import { MyContext } from "../index";

/**
 * Диалог создания заявки
 */
export function createTicketConversation(bot: Bot<MyContext>) {
  // Обработка текстовых сообщений (не команд)
  bot.on("message:text", async (ctx) => {
    const telegramId = ctx.from?.id.toString();
    const messageText = ctx.message.text;
    
    // Пропускаем команды
    if (messageText.startsWith("/")) {
      return;
    }
    
    if (!telegramId) {
      await ctx.reply("Не удалось определить ваш Telegram ID");
      return;
    }
    
    try {
      // Находим пользователя по Telegram ID
      const user = await prisma.user.findFirst({
        where: { telegramId },
      });
      
      if (!user) {
        await ctx.reply(
          `Ваш аккаунт не авторизован в системе, пожалуйста <a href="${process.env.TELEGRAM_WEB_VIEW_URL}">войдите через web-view</a>`,
          { parse_mode: "HTML" }
        );
        return;
      }
      
      // Спрашиваем подтверждение создания заявки
      const keyboard = new InlineKeyboard()
        .text("✅ Да, создать заявку", `create_ticket_${messageText.substring(0, 50)}`)
        .row()
        .text("❌ Нет, отмена", "cancel_ticket");
      
      await ctx.reply(
        "Вы хотите создать новую заявку с текстом:\n\n" +
        `"${messageText.substring(0, 200)}${messageText.length > 200 ? "..." : ""}"`,
        {
          reply_markup: keyboard,
        }
      );
    } catch (error) {
      console.error("Ошибка при обработке сообщения:", error);
      await ctx.reply("Произошла ошибка. Попробуйте позже.");
    }
  });
  
  // Обработчик создания заявки
  bot.callbackQuery(/^create_ticket_(.+)$/, async (ctx) => {
    const ticketText = ctx.match[1];
    const telegramId = ctx.from.id.toString();
    
    try {
      // Находим пользователя
      const user = await prisma.user.findFirst({
        where: { telegramId },
      });
      
      if (!user) {
        await ctx.answerCallbackQuery("Ваш аккаунт не связан с системой");
        return;
      }
      
      // Создаем заявку
      const ticket = await prisma.ticket.create({
        data: {
          title: `Заявка от ${user.name || "пользователя"}`,
          description: ticketText,
          userId: user.id,
        },
      });
      
      await ctx.answerCallbackQuery("Заявка успешно создана!");
      await ctx.reply(
        `✅ Заявка #${ticket.id.substring(0, 8)} успешно создана!\n\n` +
        `Вы можете отслеживать её статус через команду /tickets`
      );
    } catch (error) {
      console.error("Ошибка при создании заявки:", error);
      await ctx.answerCallbackQuery("Ошибка при создании заявки");
      await ctx.reply("Произошла ошибка при создании заявки. Попробуйте позже.");
    }
  });
  
  // Обработчик отмены создания заявки
  bot.callbackQuery("cancel_ticket", async (ctx) => {
    await ctx.answerCallbackQuery("Создание заявки отменено");
    await ctx.reply("❌ Создание заявки отменено.");
  });
} 