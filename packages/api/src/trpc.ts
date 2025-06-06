import { initTRPC, TRPCError } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import superjson from 'superjson';
import { ZodError } from 'zod';

import { prisma } from '@aas/db';
import { getServerSession, authOptions } from '@aas/auth';

// Определяем тип контекста
export interface Context {
  prisma: typeof prisma;
  userId?: string;
  userRole?: string;
}

/**
 * Общий обработчик контекста
 */
const createContextInner = async (opts: { userId?: string, userRole?: string } = {}) => {
  return {
    prisma,
    userId: opts.userId,
    userRole: opts.userRole,
  };
};

/**
 * Контекст для Next.js Pages API Routes
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  // Получаем сессию пользователя
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const userRole = session?.user?.role;

  return await createContextInner({ userId, userRole });
};

/**
 * Контекст для App Router и fetch адаптера
 */
export const createTRPCContextFetch = async (opts: FetchCreateContextFnOptions) => {
  const { req, resHeaders } = opts;
  
  // Получаем сессию пользователя для App Router
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const userRole = session?.user?.role;
  
  return await createContextInner({ userId, userRole });
};

/**
 * Инициализация tRPC API
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Экспорт базовых компонентов tRPC
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Middleware для проверки авторизации
 */
const isAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  });
});

/**
 * Защищенная процедура (требует авторизации)
 */
export const protectedProcedure = t.procedure.use(isAuthed); 

/**
 * Middleware для проверки роли админа/саппорта
 */
const isAdminOrSupport = t.middleware(async ({ ctx, next }) => {
  if (ctx.userRole !== 'ADMIN' && ctx.userRole !== 'SUPPORT') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'У вас нет прав для выполнения этого действия',
    });
  }

  return next({ ctx });
});

/**
 * Процедура для админов и саппортов
 */
export const adminProcedure = protectedProcedure.use(isAdminOrSupport); 