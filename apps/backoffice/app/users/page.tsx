"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { trpc } from "../trpc-provider";
import { AppLayout } from "../components/app-layout";

// Компонент для управления ролью пользователя
function UserRoleSelector({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const utils = trpc.useContext();
  const updateRoleMutation = trpc.user.updateRole.useMutation({
    onSuccess: () => {
      // После успешного обновления обновляем список пользователей
      utils.user.getAll.invalidate();
    },
  });

  const handleRoleChange = async (userId: string, role: "USER" | "ADMIN" | "SUPPORT") => {
    setIsUpdating(true);
    try {
      await updateRoleMutation.mutateAsync({
        userId,
        role,
      });
      setSelectedRole(role);
    } catch (error) {
      console.error("Error updating role:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <select
        value={selectedRole}
        onChange={(e) => handleRoleChange(userId, e.target.value as "USER" | "ADMIN" | "SUPPORT")}
        className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
        disabled={isUpdating}
      >
        <option value="USER">Пользователь</option>
        <option value="ADMIN">Администратор</option>
        <option value="SUPPORT">Поддержка</option>
      </select>
      {isUpdating && <span className="text-xs text-muted-foreground">Сохранение...</span>}
    </div>
  );
}

export default function UsersPage() {
  const { status } = useSession();
  const { data: users, isLoading } = trpc.user.getAll.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <p>Загрузка списка пользователей...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Управление пользователями</h1>
        
        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 font-medium">Имя</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Роль</th>
                  <th className="px-4 py-3 font-medium">Telegram ID</th>
                  <th className="px-4 py-3 font-medium">Заявок</th>
                  <th className="px-4 py-3 font-medium">Дата регистрации</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-3">
                      {user.name || <span className="text-muted-foreground italic">Не указано</span>}
                    </td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      <UserRoleSelector userId={user.id} currentRole={user.role} />
                    </td>
                    <td className="px-4 py-3">
                      {user.telegramId || <span className="text-muted-foreground italic">Не указан</span>}
                    </td>
                    <td className="px-4 py-3">{user._count?.tickets || 0}</td>
                    <td className="px-4 py-3">
                      {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                    </td>
                  </tr>
                ))}
                
                {users?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                      Нет зарегистрированных пользователей
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 