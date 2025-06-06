// Константы приложения

// Статусы заявок
export const TICKET_STATUSES = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CANCELED: 'CANCELED',
} as const;

export type TicketStatus = keyof typeof TICKET_STATUSES;

// Приоритеты заявок
export const TICKET_PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export type TicketPriority = keyof typeof TICKET_PRIORITIES;

// Роли пользователей
export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPPORT: 'SUPPORT',
} as const;

export type UserRole = keyof typeof USER_ROLES; 