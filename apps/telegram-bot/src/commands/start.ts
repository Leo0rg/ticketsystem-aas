import { Bot } from "grammy";
import { MyContext } from "../index";
import { prisma } from "../services/prisma";
import bcrypt from "bcryptjs";

/**
 * Команда /start
 */
export function startCommand(bot: Bot<MyContext>) {
  bot.command("start", async (ctx) => {
    const firstName = ctx.from?.first_name || "Пользователь";
    const telegramId = ctx.from?.id.toString();
    
    // Проверяем, есть ли параметр авторизации
    const startPayload = ctx.message?.text.split(" ")[1];
    
    if (startPayload && startPayload.startsWith("auth_") && telegramId) {
      const token = startPayload.substring(5); // Получаем токен после "auth_"
      await handleAuthToken(ctx, token, telegramId);
      return;
    }
    
    await ctx.reply(
      `Привет, ${firstName}! 👋\n\nЯ бот для работы с системой заявок.\n\n` +
      `Вы можете использовать следующие команды:\n` +
      `/help - получить справку\n` +
      `/tickets - просмотреть ваши заявки\n\n` +
      `Чтобы создать новую заявку, просто напишите мне сообщение.`
    );
  });
}

/**
 * Обработка токена авторизации
 */
async function handleAuthToken(ctx: MyContext, token: string, telegramId: string) {
  try {
    // Ищем токен в базе данных
    const authToken = await prisma.telegramAuthToken.findFirst({
      where: {
        token,
        isUsed: false,
        expires: {
          gt: new Date(), // Токен еще не истек
        },
      },
    });
    
    if (!authToken) {
      await ctx.reply("❌ Недействительный или просроченный токен авторизации.");
      return;
    }
    
    // Проверяем, существует ли пользователь с таким telegramId
    const existingUserWithTelegram = await prisma.user.findFirst({
      where: { telegramId },
    });
    
    if (existingUserWithTelegram) {
      // Если этот Telegram уже связан с другим аккаунтом
      await ctx.reply("❌ Этот аккаунт Telegram уже связан с другой учетной записью.");
      return;
    }
    
    // Проверяем входим мы или регистрируемся
    if (authToken.email) {
      // Вход - связываем Telegram ID с существующим аккаунтом
      const user = await prisma.user.findUnique({
        where: { email: authToken.email },
      });
      
      if (!user) {
        await ctx.reply("❌ Пользователь не найден.");
        return;
      }
      
      // Обновляем пользователя, добавляя telegramId
      await prisma.user.update({
        where: { id: user.id },
        data: { telegramId },
      });
      
      await ctx.reply(
        `✅ Ваш Telegram успешно связан с аккаунтом ${user.email}!\n\n` +
        `Теперь вы можете использовать бота для работы с заявками.`
      );
    } else {
      // Регистрация - создаем нового пользователя
      // Генерируем случайный пароль
      const randomPassword = Math.random().toString(36).slice(-10);
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      
      const username = ctx.from?.username || `user_${Math.floor(Math.random() * 10000)}`;
      
      // Создаем нового пользователя
      const user = await prisma.user.create({
        data: {
          name: ctx.from?.first_name,
          email: `${username}@telegram.user`, // Используем уникальный email
          passwordHash,
          telegramId,
        },
      });
      
      await ctx.reply(
        `✅ Вы успешно зарегистрировались в системе заявок!\n\n` +
        `Ваш email для входа: ${user.email}\n` +
        `Ваш пароль: ${randomPassword}`
      );
    }
    
    // Отмечаем токен как использованный
    await prisma.telegramAuthToken.update({
      where: { id: authToken.id },
      data: { isUsed: true },
    });
  } catch (error) {
    console.error("Ошибка при обработке токена авторизации:", error);
    await ctx.reply("❌ Произошла ошибка при обработке авторизации. Попробуйте позже.");
  }
} 