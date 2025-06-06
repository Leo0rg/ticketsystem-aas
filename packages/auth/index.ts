import { PrismaAdapter } from '@auth/prisma-adapter';
import { type DefaultSession, type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

import { prisma } from '@aas/db';

/**
 * Расширение типов NextAuth для включения роли и id пользователя
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
    } & DefaultSession['user'];
  }

  interface User {
    role: string;
  }
}

/**
 * Опции аутентификации
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email и пароль обязательны');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          throw new Error('Пользователь не найден');
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          throw new Error('Неверный пароль');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    // Провайдер для входа по Telegram ID
    CredentialsProvider({
      id: "telegram-id",
      name: 'TelegramID',
      credentials: {
        telegramId: { label: 'Telegram ID', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.telegramId) {
          throw new Error('Telegram ID обязателен');
        }

        const user = await prisma.user.findFirst({
          where: { telegramId: credentials.telegramId },
        });

        if (!user) {
          throw new Error('Пользователь не найден');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    // Новый провайдер для входа через Telegram Mini App
    CredentialsProvider({
      id: "telegram-tma",
      name: 'TelegramTMA',
      credentials: {
        telegramId: { label: 'Telegram ID', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.telegramId) {
          throw new Error('Telegram ID не предоставлен');
        }

        const user = await prisma.user.findFirst({
          where: { telegramId: credentials.telegramId },
        });

        if (!user) {
          // Этот случай не должен происходить, так как пользователь создается
          // перед вызовом signIn, но это хорошая проверка.
          throw new Error('Не удалось найти или создать пользователя');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
};

/**
 * Утилита для хеширования пароля
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

/**
 * Серверная утилита для получения сессии
 */
export { getServerSession } from 'next-auth'; 