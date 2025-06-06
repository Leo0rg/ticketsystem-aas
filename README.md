# Система заявок (AAS)

AAS (Advanced Application System) — это полнофункциональная система для управления заявками, построенная на современном технологическом стеке. Проект организован как монорепозиторий с использованием Turborepo и включает в себя веб-интерфейс, Telegram-бота и бэкэнд.

## 🚀 Основные возможности

- **Управление заявками**: Создание, просмотр, обновление статуса и приоритета заявок.
- **Ролевая модель**: Разделение прав доступа для Пользователей, Поддержки и Администраторов.
- **Аутентификация**: Вход в систему по логину/паролю и автоматическая авторизация через Telegram.
- **Комментарии**: Возможность вести обсуждение в рамках каждой заявки.
- **Telegram-бот**: Создание заявок и получение уведомлений прямо в Telegram.
- **Веб-интерфейс**: Адаптивный UI для удобной работы с заявками с любого устройства.

## 🛠️ Технологический стек

- **Monorepo**: [Turborepo](https://turbo.build/repo)
- **Package Manager**: [Yarn Workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/)
- **Веб-приложение**: [Next.js](https://nextjs.org/) (React)
- **Стилизация**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI-компоненты**: [shadcn/ui](https://ui.shadcn.com/)
- **API**: [tRPC v10.43.6](https://trpc.io/)
- **База данных**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Аутентификация**: [NextAuth.js](https://next-auth.js.org/)
- **Telegram-бот**: [GrammY](https://grammy.dev/)
- **TypeScript**

## 📂 Структура проекта

Проект использует структуру монорепозитория для лучшей организации кода:

```tree
/
├── apps/
|   ├── backoffice/     # Next.js веб-приложение (бэкоффис, админка)
│   ├── web-view/       # Next.js веб-приложение (фронтенд)
│   └── telegram-bot/   # Telegram-бот
├── packages/
│   ├── api/            # tRPC роутеры и логика API
│   ├── auth/           # Конфигурация NextAuth.js
│   ├── db/             # Схема Prisma, клиент и миграции
│   ├── ui/             # Общие React-компоненты (на базе shadcn/ui)
│   ├── config/         # Общие конфигурации (ESLint, и т.д.)
│   └── tsconfig/       # Общие конфигурации TypeScript
└── ...
```

## 📋 Требования

- [Node.js](https://nodejs.org/en/) (v18.x или выше)
- [Yarn](https://yarnpkg.com/) (v1.x)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Docker](https://www.docker.com/) и [Docker Compose](https://docs.docker.com/compose/)

## ⚙️ Установка и запуск

Вы можете запустить проект двумя способами: локально для разработки или с помощью Docker Compose.

### Вариант 1: Локальная разработка

Этот способ подходит для разработки и отладки.

1. **Клонируйте репозиторий:**

    ```bash
    git clone <your-repository-url>
    cd aas
    ```

2. **Установите зависимости:**

    ```bash
    yarn install
    ```

3. **Настройте переменные окружения:**
    Скопируйте файл `.env-example` в новый файл `.env` в корне проекта и заполните его необходимыми значениями.

    ```bash
    cp .env-example .env
    ```

    Детальное описание переменных находится в разделе [Переменные окружения](#-переменные-окружения).

4. **Настройте базу данных:**
    Убедитесь, что у вас запущен PostgreSQL и данные для подключения в `.env` верны. `DATABASE_URL` должна указывать на ваш локальный сервер PostgreSQL.

    Для примера, можно запустить PostgreSQL через Docker:

    ```bash
    docker run --name postgresWebView -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=ticketsystem -p 5432:5432 -d postgres
    ```

    *(Не забудьте остановить и удалить контейнер, если он уже существует)*

5. **Примените миграции Prisma:**
    Эта команда создаст таблицы в вашей базе данных в соответствии со схемой.

    ```bash
    npx prisma db push --schema=./packages/db/prisma/schema.prisma
    ```

6. **Запустите все приложения в режиме разработки:**

    ```bash
    yarn dev
    ```

### Вариант 2: Запуск с помощью Docker Compose

Этот способ идеально подходит для быстрого развертывания или для окружения, близкого к продакшену.

1. **Клонируйте репозиторий** (если еще не сделали).

2. **Настройте переменные окружения:**
    Скопируйте `.env-example` в `.env` и заполните его.

    ```bash
    cp .env-example .env
    ```

    **Важно:** Вам не нужно указывать `DATABASE_URL` в `.env` файле, так как Docker Compose автоматически настроит подключение к базе данных в контейнере.

3. **Соберите и запустите проект:**
    Эта команда соберет Docker-образы и запустит все сервисы (веб-приложение, базу данных, Nginx) в фоновом режиме.

    ```bash
    docker-compose up -d --build
    ```

    Чтобы остановить все сервисы, используйте команду:

    ```bash
    docker-compose down
    ```

## ✅ Что будет запущено?

### При локальном запуске (`yarn dev`)

- **Веб-приложение**: доступно по адресу `http://localhost:3000`.
- **Telegram-бот**: запущен и обрабатывает входящие сообщения.
- **База данных**: вам необходимо самостоятельно запустить и настроить экземпляр PostgreSQL.

### При запуске через Docker Compose

- **Веб-приложение и Telegram-бот**: доступны через прокси Nginx по адресу `http://localhost`.
- **База данных PostgreSQL**: автоматически развернута и настроена в Docker-контейнере.
- **Adminer**: инструмент для управления базой данных, доступен по адресу `http://localhost:8080`.
  - Данные для входа в Adminer:
    - Движок: PostgreSQL
    - Сервер: db
    - Имя пользователя: postgres
    - Пароль: secret
    - База данных: ticketsystem

## 🔑 Переменные окружения

Файл `.env` является обязательным для работы проекта.

- `DATABASE_URL`: Строка подключения к вашей базе данных PostgreSQL.
    *Пример: `postgresql://postgres:secret@localhost:5432/ticketsystem`*
- `NEXTAUTH_SECRET`: Секретный ключ для NextAuth.js. Можно сгенерировать командой `openssl rand -hex 32` или просто написать набор букв  и цифр.
- `NEXTAUTH_URL`: Полный URL вашего веб-приложения.
    *Пример для локальной разработки: `http://localhost:3000`*
- `TELEGRAM_BOT_TOKEN`: Токен вашего Telegram-бота, полученный от [@BotFather](https://t.me/BotFather).
- `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`: Имя пользователя вашего Telegram-бота.
- `NEXT_PUBLIC_APP_URL`: Публичный URL приложения (может совпадать с `NEXTAUTH_URL`).
- `TELEGRAM_WEB_VIEW_URL`: Ссылка на Web View вашего бота.
    *Пример: `https://t.me/your_bot_username/WebView`*

> **Важно:** Для `TELEGRAM_WEB_VIEW_URL` требуется **HTTPS**-соединение. При локальной разработке с Docker вы можете использовать сервис [ngrok](https://ngrok.com/) для создания безопасного туннеля к вашему `localhost`.
>
> ```bash
> # Пример команды для создания туннеля на порт 80, который использует Nginx
> ngrok http 80
> ```
>
> Ngrok предоставит вам временный `https` адрес, который вы можете использовать.
> Или если Ngrok не доступен, можно использовать [CloudPub](https://cloudpub.ru/)

## 📜 Доступные скрипты

В проекте доступны следующие скрипты, которые можно запускать через `yarn`:

- `dev`: Запуск всех приложений в режиме разработки.
- `build`: Сборка всех приложений для продакшена.
- `start`: Запуск всех приложений в продакшен режиме (после сборки).
- `lint`: Проверка кода с помощью ESLint.

### Скрипты для конкретных приложений

Вы можете запускать скрипты для отдельных приложений с помощью флага `--filter`:

```bash
# Запустить только веб-приложение
yarn dev --filter=web-view

# Собрать только Telegram-бота
yarn build --filter=telegram-bot
```

### Скрипты Prisma

- `prisma generate`: Генерация клиента Prisma на основе схемы.
- `prisma migrate`: Применение миграций базы данных.
- `prisma studio`: Запуск Prisma Studio для просмотра и редактирования данных в БД.

```bash
npx prisma generate --schema=./packages/db/prisma/schema.prisma
```

```bash
npx prisma migrate deploy --schema=./packages/db/prisma/schema.prisma
```

```bash
npx prisma studio --schema=./packages/db/prisma/schema.prisma
```
