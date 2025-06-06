import { NextResponse } from "next/server";

export async function POST() {
  // Обработка логов аутентификации (обычно это внутренний API NextAuth)
  return NextResponse.json({ success: true });
} 