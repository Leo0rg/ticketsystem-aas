import { Bot, InlineKeyboard } from "grammy";
import { prisma } from "../services/prisma";
import { MyContext } from "../index";

/**
 * Команда /tickets
 */
export function ticketsCommand(bot: Bot<MyContext>) {
  bot.command("tickets", async (ctx) => {
    const telegramId = ctx.from?.id.toString();
    
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
      
      // Получаем заявки пользователя
      const tickets = await prisma.ticket.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5, // Ограничиваем количество
      });
      
      if (tickets.length === 0) {
        await ctx.reply("У вас пока нет заявок. Чтобы создать новую, просто напишите сообщение.");
        return;
      }
      
      // Создаем клавиатуру с заявками
      const keyboard = new InlineKeyboard();
      
      tickets.forEach((ticket) => {
        const statusEmoji = getStatusEmoji(ticket.status);
        keyboard.text(
          `${statusEmoji} ${ticket.title.substring(0, 30)}...`,
          `ticket_${ticket.id}`
        ).row();
      });
      
      await ctx.reply("Ваши последние заявки:", {
        reply_markup: keyboard,
      });
    } catch (error) {
      console.error("Ошибка при получении заявок:", error);
      await ctx.reply("Произошла ошибка при получении списка заявок. Попробуйте позже.");
    }
  });
  
  // Обработчик для выбора заявки
  bot.callbackQuery(/^ticket_(.+)$/, async (ctx) => {
    const ticketId = ctx.match[1];
    
    try {
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: { comments: true },
      });
      
      if (!ticket) {
        await ctx.answerCallbackQuery("Заявка не найдена");
        return;
      }
      
      const statusEmoji = getStatusEmoji(ticket.status);
      const priorityEmoji = getPriorityEmoji(ticket.priority);
      
      let message = `📝 <b>Заявка #${ticket.id.substring(0, 8)}</b>\n\n` +
        `<b>Статус:</b> ${statusEmoji} ${ticket.status}\n` +
        `<b>Приоритет:</b> ${priorityEmoji} ${ticket.priority}\n` +
        `<b>Создана:</b> ${formatDate(ticket.createdAt)}\n\n` +
        `<b>Тема:</b> ${ticket.title}\n\n` +
        `<b>Описание:</b>\n${ticket.description}\n\n`;
      
      if (ticket.comments.length > 0) {
        message += "<b>Последние комментарии:</b>\n";
        ticket.comments.slice(-3).forEach((comment) => {
          message += `- ${formatDate(comment.createdAt)}: ${comment.text}\n`;
        });
      }
      
      await ctx.answerCallbackQuery();
      await ctx.reply(message, {
        parse_mode: "HTML",
      });
    } catch (error) {
      console.error("Ошибка при получении заявки:", error);
      await ctx.answerCallbackQuery("Произошла ошибка при получении заявки");
    }
  });
}

/**
 * Получить эмодзи для статуса заявки
 */
function getStatusEmoji(status: string): string {
  switch (status) {
    case "PENDING": return "⏳";
    case "IN_PROGRESS": return "🔄";
    case "RESOLVED": return "✅";
    case "CANCELED": return "❌";
    default: return "❓";
  }
}

/**
 * Получить эмодзи для приоритета заявки
 */
function getPriorityEmoji(priority: string): string {
  switch (priority) {
    case "LOW": return "🟢";
    case "MEDIUM": return "🟡";
    case "HIGH": return "🟠";
    case "URGENT": return "🔴";
    default: return "⚪";
  }
}

/**
 * Форматировать дату
 */
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
} 