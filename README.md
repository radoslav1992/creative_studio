# Креатив Студио — AI Генератор на Видео и Изображения

Българска SaaS платформа за генериране на видео и изображения с изкуствен интелект, задвижвана от Replicate API.

## Възможности

### Видео Студио
- **Google Veo 3, 3.1, 3 Fast, 3.1 Fast, 2** — Генериране на видео с вграден звук
- **OpenAI Sora 2, Sora 2 Pro** — Кинематографично видео със синхронизирано аудио
- **Kuaishou Kling v2.5 Turbo Pro, v2.1** — Плавно движение и кинематографична дълбочина

### Изображения Студио
- **Google Imagen 4, 4 Ultra, 4 Fast, 3, 3 Fast** — Висококачествено генериране на изображения
- **Google Nano Banana, Nano Banana Pro** — Генериране и редактиране на изображения
- **OpenAI GPT Image 1.5** — Генериране и редактиране с прецизен контрол
- **Ideogram v3 Quality, Balanced, Turbo** — Реализъм и креативни дизайни
- **Ideogram Character** — Последователност на персонажи

### Ключови функции
- Отделни студиа за видео и изображения
- Поддръжка за редактиране на изображения (Nano Banana, GPT Image)
- Начални/крайни кадри за видео модели (Veo 3.1, Kling)
- Последователност на персонажи (Ideogram Character)
- Референтни изображения за стил
- Изцяло на български език

### Автентикация и база данни
- **Потребителски акаунти** — Регистрация с имейл/парола или GitHub OAuth
- **Защитени маршрути** — Студиата и галерията изискват вход
- **Персистентна база данни** — Всички генерации се запазват за всеки потребител
- **Профил** — Статистика и информация за акаунта
- **Сесии с JWT** — Сигурно управление на сесиите

## Стартиране

### 1. Инсталиране на зависимостите

```bash
npm install
```

### 2. Конфигурация

Създайте `.env` файл (или копирайте `.env.example`):

```bash
cp .env.example .env
```

Редактирайте `.env`:

```
# Database (SQLite по подразбиране)
DATABASE_URL="file:./dev.db"

# NextAuth.js — задължително
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="генерирайте-случаен-стринг-тук"

# Replicate API — задължително за генериране
REPLICATE_API_TOKEN=your_replicate_api_token_here

# Опционално: GitHub OAuth
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

Вземете Replicate токен от [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens).

### 3. Инициализиране на базата данни

```bash
npm run db:migrate
```

### 4. Стартиране в режим на разработка

```bash
npm run dev
```

Отворете [http://localhost:3000](http://localhost:3000).

## Налични скриптове

| Скрипт | Описание |
|---|---|
| `npm run dev` | Стартиране в режим на разработка |
| `npm run build` | Продуктивен билд |
| `npm start` | Стартиране на продуктивния сървър |
| `npm run lint` | Линтер |
| `npm run db:migrate` | Prisma миграции |
| `npm run db:push` | Синхронизиране на схемата (без миграция) |
| `npm run db:studio` | Отваряне на Prisma Studio (GUI за БД) |

## Архитектура

### Технологии

- **Next.js 14** — React framework с App Router
- **Tailwind CSS** — Стилизиране
- **Zustand** — Управление на състоянието (синхронизирано с БД)
- **Prisma** — ORM за базата данни
- **SQLite** — Лека релационна база данни (лесно се заменя с PostgreSQL)
- **NextAuth.js** — Автентикация (Credentials + GitHub OAuth)
- **bcryptjs** — Хеширане на пароли
- **Replicate API** — AI модели
- **TypeScript** — Типизиран код

### Структура на проекта

```
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts  # NextAuth handler
│   │   │   └── register/route.ts       # User registration
│   │   ├── generate/route.ts           # Replicate generation (auth-protected)
│   │   ├── generations/                # CRUD for generations (DB)
│   │   │   ├── route.ts               # GET (list) + POST (create)
│   │   │   └── [id]/route.ts          # PATCH (update) + DELETE
│   │   └── status/[id]/route.ts       # Poll Replicate status
│   ├── auth/
│   │   ├── layout.tsx                 # Auth layout (no sidebar)
│   │   ├── login/page.tsx             # Login page
│   │   └── register/page.tsx          # Registration page
│   ├── gallery/page.tsx               # Gallery (all generations)
│   ├── profile/page.tsx               # User profile & stats
│   ├── studio/
│   │   ├── image/page.tsx             # Image generation studio
│   │   └── video/page.tsx             # Video generation studio
│   ├── globals.css
│   ├── layout.tsx                     # Root layout with Providers
│   └── page.tsx                       # Landing page
├── components/
│   ├── AppShell.tsx                   # Conditional sidebar wrapper
│   ├── GenerationResult.tsx           # Generation result card
│   ├── ImageUploader.tsx              # Image upload (drag & drop)
│   ├── ModelSelector.tsx              # AI model selection grid
│   ├── ParameterControls.tsx          # Model parameter controls
│   ├── Providers.tsx                  # SessionProvider wrapper
│   ├── Sidebar.tsx                    # Navigation + user menu
│   └── StudioLayout.tsx              # Studio page layout
├── lib/
│   ├── auth.ts                       # NextAuth configuration
│   ├── auth-types.ts                 # Session type augmentation
│   ├── models.ts                     # AI model definitions
│   ├── prisma.ts                     # Prisma client singleton
│   ├── store.ts                      # Zustand store (DB-synced)
│   └── types.ts                      # TypeScript types
├── prisma/
│   ├── migrations/                   # Database migrations
│   └── schema.prisma                 # Database schema
├── middleware.ts                      # Auth middleware (route protection)
├── .env.example                       # Environment variables template
└── package.json
```

### Модели в базата данни

- **User** — Потребителски акаунти
- **Account** — OAuth акаунти (GitHub и др.)
- **Session** — Потребителски сесии
- **VerificationToken** — Токени за верификация на имейл
- **Generation** — AI генерации (свързани с потребител)

### Защитени маршрути

Следните маршрути изискват автентикация (middleware):
- `/studio/*` — Видео и изображения студиа
- `/gallery/*` — Галерия с генерации
- `/profile/*` — Потребителски профил
- `/api/generate/*` — API за генериране
- `/api/generations/*` — API за CRUD на генерации

Неавтентикирани потребители се пренасочват към `/auth/login`.
