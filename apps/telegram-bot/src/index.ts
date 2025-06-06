import { Bot, Context, session, SessionFlavor } from "grammy";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// Проверяем наличие токена
if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN не указан в переменных окружения");
}

// Определяем тип данных сессии
interface SessionData {
  step: string;
}

// Создаём собственный тип контекста, расширяющий базовый
export type MyContext = Context & SessionFlavor<SessionData>;

// Создаем типизированный экземпляр бота
const bot = new Bot<MyContext>(process.env.TELEGRAM_BOT_TOKEN!);

// Добавляем middleware для сессий с правильной типизацией
bot.use(session({ initial: () => ({ step: "idle" }) }));

// Импортируем команды
import { setupCommands } from "./commands";
import { setupConversations } from "./conversations";
import { setupMiddlewares } from "./middlewares";

// Настраиваем команды и обработчики
setupMiddlewares(bot);
setupCommands(bot);
setupConversations(bot);

// Обработка ошибок
bot.catch((err) => {
  console.error("Ошибка в боте:", err);
});

// Запускаем бота
bot.start({
  onStart: (botInfo) => {
    console.log(`Бот @${botInfo.username} запущен`);
  },
}).catch((err) => {
  console.error("Ошибка при запуске бота:", err);
  process.exit(1);
});
