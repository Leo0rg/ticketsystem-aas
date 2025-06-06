// Конфигурация сайта

export const siteConfig = {
  name: "Система учета заявок",
  description: "Система для создания и отслеживания заявок",
  url: "https://ticket-system.example.com",
  links: {
    github: "https://github.com/your-username/ticket-system",
  },
  creator: "Your Company",
};

export const navItems = [
  {
    title: "Главная",
    href: "/",
  },
  {
    title: "Заявки",
    href: "/tickets",
  },
  {
    title: "Профиль",
    href: "/profile",
  },
];

export const adminNavItems = [
  {
    title: "Дашборд",
    href: "/admin",
  },
  {
    title: "Пользователи",
    href: "/admin/users",
  },
  {
    title: "Заявки",
    href: "/admin/tickets",
  },
  {
    title: "Настройки",
    href: "/admin/settings",
  },
]; 