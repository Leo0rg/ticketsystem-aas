/// <reference types="node" />
import { z } from "zod";

/**
 * Валидация переменных окружения
 */
const envSchema = z.object({
  // База данных
  DATABASE_URL: z.string().url(),
  
  // NextAuth
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string(),
  
  // Telegram Bot
  TELEGRAM_BOT_TOKEN: z.string(),
  NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: z.string(),
  
  // Окружение
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

/**
 * Валидация переменных окружения
 */
export const env = envSchema.parse(process.env);

/**
 * Тип для переменных окружения
 */
export type Env = z.infer<typeof envSchema>; 