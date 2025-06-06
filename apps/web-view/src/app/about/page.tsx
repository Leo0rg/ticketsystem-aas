import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2 font-semibold">
            <Link href="/">
              <span className="text-xl">Система заявок</span>
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Войти</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            О нашей системе
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Наша система управления заявками разработана для упрощения и
            автоматизации процесса обработки обращений. Мы предоставляем удобные
            инструменты для создания, отслеживания и управления заявками, а также
            интеграцию с Telegram для мгновенных уведомлений.
          </p>
          <p className="mt-4 text-lg text-muted-foreground">
            Наша цель - помочь вам сосредоточиться на решении задач, а не на
            рутинных операциях.
          </p>
          <div className="mt-8">
            <Link href="/login">
              <Button size="lg">Начать работу</Button>
            </Link>
          </div>
        </div>
      </main>
      <footer className="border-t py-6 md:py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Система заявок. Все права защищены.
          </p>
        </div>
      </footer>
    </div>
  );
} 