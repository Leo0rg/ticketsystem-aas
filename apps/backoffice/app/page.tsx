"use client";

import { AppLayout } from "./components/app-layout";
import { trpc } from "./trpc-provider";

export default function Home() {
  // Получаем список всех пользователей
  const { data: users, isLoading: isLoadingUsers } = trpc.user.getAll.useQuery();
  
  // Для расчета статистики
  const totalUsers = users?.length || 0;
  const adminUsers = users?.filter(user => user.role === "ADMIN").length || 0;
  const supportUsers = users?.filter(user => user.role === "SUPPORT").length || 0;
  const regularUsers = users?.filter(user => user.role === "USER").length || 0;
  
  // Общее количество заявок (по связям _count)
  const totalTickets = users?.reduce((acc, user) => acc + (user._count?.tickets || 0), 0) || 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Панель администратора</h1>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Всего пользователей" value={totalUsers} isLoading={isLoadingUsers} />
          <StatCard title="Администраторы" value={adminUsers} isLoading={isLoadingUsers} />
          <StatCard title="Поддержка" value={supportUsers} isLoading={isLoadingUsers} />
          <StatCard title="Обычные пользователи" value={regularUsers} isLoading={isLoadingUsers} />
          <StatCard title="Всего заявок" value={totalTickets} isLoading={isLoadingUsers} />
        </div>
        
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-medium">Информация о системе</h2>
          <p className="text-sm text-muted-foreground">
            Добро пожаловать в панель администратора системы заявок. Здесь вы можете управлять пользователями, 
            назначать роли и просматривать общую статистику.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ 
  title, 
  value, 
  isLoading 
}: { 
  title: string; 
  value: number; 
  isLoading: boolean;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <p className="mt-2 text-3xl font-bold">
        {isLoading ? "..." : value}
      </p>
    </div>
  );
}
