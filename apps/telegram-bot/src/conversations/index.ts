import { Bot } from "grammy";
import { createTicketConversation } from "./create-ticket";
import { MyContext } from "../index";

/**
 * Настройка диалогов бота
 */
export function setupConversations(bot: Bot<MyContext>) {
  // Диалог создания заявки
  createTicketConversation(bot);
} 