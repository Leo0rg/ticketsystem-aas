import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загружаем .env из корня монорепозитория
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@aas/ui", "@aas/api", "@aas/auth", "@aas/db"],
  eslint: {
    // Отключаем проверку ESLint при сборке
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Отключаем проверку типов при сборке
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
  },
  // Устанавливаем базовый путь для приложения
  basePath: '/backoffice',
  // Разрешаем доступ к ресурсам /_next/* с определенных доменов в режиме разработки
  allowedDevOrigins: [
    "*.ngrok-free.app",
    "*.ngrok.io",
    "*.ngrok.app" 
  ]
};

export default nextConfig;