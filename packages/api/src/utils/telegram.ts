import { PrismaClient } from "@aas/db";

/**
 * Отправляет сообщение пользователю в Telegram
 * @param telegramId ID пользователя в Telegram
 * @param message Сообщение для отправки
 * @returns Promise с результатом отправки
 */
export async function sendTelegramMessage(telegramId: string, message: string) {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn("TELEGRAM_BOT_TOKEN not set, skipping notification");
    return null;
  }

  if (!telegramId) {
    console.warn("User has no telegramId, skipping notification");
    return null;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: telegramId,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending Telegram notification:", error);
    return null;
  }
}

/**
 * Отправляет уведомление о тикете автору
 * @param prisma Экземпляр Prisma клиента
 * @param ticketId ID тикета
 * @param message Сообщение для отправки
 */
export async function notifyTicketAuthor(
  prisma: PrismaClient,
  ticketId: string,
  message: string
) {
  try {
    // Получаем тикет вместе с информацией о пользователе
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { user: true },
    });

    if (!ticket || !ticket.user) {
      console.warn(`Ticket ${ticketId} or its author not found`);
      return;
    }

    if (!ticket.user.telegramId) {
      console.warn(`User ${ticket.user.id} has no telegramId, skipping notification`);
      return;
    }

    // Форматируем сообщение с информацией о тикете
    const formattedMessage = `<b>Уведомление о заявке "${ticket.title}"</b>\n\n${message}\n\n<i>ID заявки:</i> #${ticketId.slice(0, 8)}`;

    // Отправляем сообщение
    await sendTelegramMessage(ticket.user.telegramId, formattedMessage);
  } catch (error) {
    console.error("Error notifying ticket author:", error);
  }
} 