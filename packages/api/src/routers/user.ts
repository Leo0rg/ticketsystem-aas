import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { randomBytes } from 'crypto';
import { sendTelegramMessage } from '../utils/telegram';

// Функция для создания случайного токена
function generateToken() {
  return randomBytes(12).toString('hex');
}

export const userRouter = router({
  // Регистрация нового пользователя
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Проверяем, существует ли пользователь с таким email
      const exists = await ctx.prisma.user.findFirst({
        where: { email: input.email },
      });

      if (exists) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Пользователь с таким email уже существует',
        });
      }

      // Проверяем, есть ли уже пользователи в системе
      const userCount = await ctx.prisma.user.count();
      const role = userCount === 0 ? 'ADMIN' : 'USER';

      // Хешируем пароль
      const passwordHash = await bcrypt.hash(input.password, 10);

      // Создаем пользователя
      const user = await ctx.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          passwordHash,
          role,
        },
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    }),

  // Получение профиля пользователя
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.userId },
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Пользователь не найден',
      });
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      telegramId: user.telegramId,
    };
  }),

  // Обновление профиля пользователя
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).optional(),
        // Другие поля для обновления...
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: { id: ctx.userId },
        data: {
          name: input.name,
          // Другие поля для обновления...
        },
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    }),

  // Создание токена для авторизации через Telegram
  createTelegramAuthToken: publicProcedure
    .input(
      z.object({
        email: z.string().email().optional(), // Для входа
        isRegister: z.boolean().default(false), // Флаг регистрации
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Если это вход, проверяем пользователя
      if (!input.isRegister && input.email) {
        const user = await ctx.prisma.user.findUnique({
          where: { email: input.email },
        });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Пользователь не найден',
          });
        }
      }

      // Создаем токен с временем жизни 15 минут
      const token = generateToken();
      const expires = new Date();
      expires.setMinutes(expires.getMinutes() + 15);

      // Сохраняем токен в базе
      await ctx.prisma.telegramAuthToken.create({
        data: {
          token,
          email: input.email,
          expires,
          userId: null,
          isUsed: false,
        },
      });

      return { token };
    }),

  // Получить всех пользователей (для админа)
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        telegramId: true,
        createdAt: true,
        _count: {
          select: {
            tickets: true,
          },
        },
      },
    });
  }),

  // Получить текущего пользователя
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.user.findUnique({
      where: {
        id: ctx.userId,
      },
    });
  }),

  // Обновить данные пользователя
  update: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        telegramId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.user.update({
        where: {
          id: ctx.userId,
        },
        data: {
          name: input.name,
          telegramId: input.telegramId,
        },
      });
    }),

  // Изменить роль пользователя (только для админа)
  updateRole: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(['USER', 'ADMIN', 'SUPPORT']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Здесь должна быть проверка прав доступа
      return await ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          role: input.role,
        },
      });
    }),

  // Найти пользователя по Telegram ID
  getByTelegramId: publicProcedure
    .input(
      z.object({
        telegramId: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!input.telegramId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Telegram ID не может быть пустым',
        });
      }

      const user = await ctx.prisma.user.findFirst({
        where: { telegramId: input.telegramId },
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
    }),

  // Регистрация или вход через Telegram Mini App
  registerOrLoginFromTMA: publicProcedure
    .input(
      z.object({
        telegramId: z.number(),
        firstName: z.string(),
        lastName: z.string().optional(),
        username: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const telegramIdStr = String(input.telegramId);

      // 1. Ищем пользователя по Telegram ID, используя findFirst
      let user = await ctx.prisma.user.findFirst({
        where: { telegramId: telegramIdStr },
      });

      // 2. Если пользователь не найден, создаем нового
      if (!user) {
        // Создаем имя пользователя
        const name = input.username || `${input.firstName} ${input.lastName || ''}`.trim();
        
        // Генерируем email, предпочитая username
        const email = input.username 
          ? `${input.username}@telegram.user`
          : `${telegramIdStr}@telegram.user.local`;

        // Генерируем случайный пароль
        const randomPassword = randomBytes(4).toString('hex'); // 8 символов
        const passwordHash = await bcrypt.hash(randomPassword, 10);

        const userCount = await ctx.prisma.user.count();

        user = await ctx.prisma.user.create({
          data: {
            telegramId: telegramIdStr,
            name: name,
            email: email,
            passwordHash: passwordHash, // Сохраняем хеш пароля
            role: userCount === 0 ? 'ADMIN' : 'USER',
          },
        });

        // Отправляем пользователю его учетные данные
        const message = `
Вы успешно зарегистрированы!
Ваши данные для входа через браузер:

<b>Email:</b> <code>${email}</code>
<b>Пароль:</b> <code>${randomPassword}</code>
        `.trim();

        await sendTelegramMessage(telegramIdStr, message);
      }

      // 3. Возвращаем данные пользователя для входа
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        telegramId: user.telegramId,
      };
    }),
}); 