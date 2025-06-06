"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@aas/ui";

const navItems = [
  { name: "Главная", href: "/" },
  { name: "Пользователи", href: "/users" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="p-4">
        <h1 className="text-lg font-semibold">Админ-панель</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center justify-between border-t p-4">
        <Link href={process.env.NEXT_PUBLIC_APP_URL + "/dashboard"} className="text-sm text-muted-foreground hover:text-primary">
          К системе заявок
        </Link>
      </div>
    </div>
  );
} 