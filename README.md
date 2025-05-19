# API для работы с обращениями

## Запуск

В качестве БД используется PostgreSQL
ORM Prisma
Необходимо создать файл .env и определить переменную DATABASE_URL с URL БД PostgresSQL


```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

## Базовый URL

```
http://localhost:3000/api/appeals
```

## Бизнес-правила

- Обращение может находиться в одном из статусов: "Новое", "В работе", "Завершено", "Отменено".
- В работу можно взять только обращение со статусом "Новое".
- Завершить можно только обращение со статусом "В работе".
- Нельзя завершить уже завершённое или отменённое обращение.
- Нельзя отменить уже завершённое или отменённое обращение.
- Нельзя отменить обращение со статусом "Новое" (сначала возьмите его в работу).
- Для отмены и завершения обращения обязательны соответствующие поля (см. ниже).
- Для фильтрации по диапазону дат оба параметра (`startDate` и `endDate`) обязательны.
- Нельзя использовать одновременно `date` и `startDate`/`endDate` в фильтрах.

## Эндпоинты

### 1. Создать обращение
**POST** `/api/appeals`

**Body:**
```json
{
  "subject": "Тема обращения", // обязательно
  "text": "Текст обращения"    // обязательно
}
```
**Ответ:**
```json
{
  "id": 1,
  "topic": "Тема обращения",
  "text": "Текст обращения",
  "status": "Новое",
  "resolution": null,
  "cancelReason": null,
  "createdAt": "2024-05-01T12:00:00.000Z",
  "updatedAt": "2024-05-01T12:00:00.000Z"
}
```

---

### 2. Взять обращение в работу
**PATCH** `/api/appeals/:id/take`

**Ответ:**
```json
{
  "id": 1,
  "topic": "Тема обращения",
  "text": "Текст обращения",
  "status": "В работе",
  "resolution": null,
  "cancelReason": null,
  "createdAt": "2024-05-01T12:00:00.000Z",
  "updatedAt": "2024-05-01T12:05:00.000Z"
}
```

---

### 3. Завершить обращение
**PATCH** `/api/appeals/:id/complete`

**Body:**
```json
{
  "resolutionText": "Решение по обращению" // обязательно
}
```
**Ответ:**
```json
{
  "id": 1,
  "topic": "Тема обращения",
  "text": "Текст обращения",
  "status": "Завершено",
  "resolution": "Решение по обращению",
  "cancelReason": null,
  "createdAt": "2024-05-01T12:00:00.000Z",
  "updatedAt": "2024-05-01T12:10:00.000Z"
}
```

---

### 4. Отменить обращение
**PATCH** `/api/appeals/:id/cancel`

**Body:**
```json
{
  "cancelReason": "Причина отмены" // обязательно
}
```
**Ответ:**
```json
{
  "id": 1,
  "topic": "Тема обращения",
  "text": "Текст обращения",
  "status": "Отменено",
  "resolution": null,
  "cancelReason": "Причина отмены",
  "createdAt": "2024-05-01T12:00:00.000Z",
  "updatedAt": "2024-05-01T12:15:00.000Z"
}
```

---

### 5. Получить список обращений (с фильтрами)
**GET** `/api/appeals`

**Параметры:**
- `date` — дата (YYYY-MM-DD или YYYY-MM-DDTHH:mm:ss.sssZ)
- `startDate` — диапазон дат (если используются, то обязательно с endDate) (YYYY-MM-DD или YYYY-MM-DDTHH:mm:ss.sssZ)
- `endDate` — диапазон дат (если используются, то обязательно с startDate) (YYYY-MM-DD или YYYY-MM-DDTHH:mm:ss.sssZ)

**Примеры:**
- `/api/appeals?date=2024-05-01`
- `/api/appeals?startDate=2024-05-01&endDate=2024-05-10`

**Ответ:**
```json
[
  {
    "id": 1,
    "topic": "...",
    "text": "...",
    "status": "Новое",
    "resolution": null,
    "cancelReason": null,
    "createdAt": "2024-05-01T12:00:00.000Z",
    "updatedAt": "2024-05-01T12:00:00.000Z"
  },
  ...
]
```

---

### 6. Массовая отмена всех "В работе"
**POST** `/api/appeals/cancel-all-in-progress`

**Ответ:**
```json
{
  "message": "Все обращения со статусом 'В работе' отменены"
}
```

---

## Ошибки

Все ошибки возвращаются в формате:
```json
{
  "status": "error",
  "message": "Описание ошибки"
}
```

## Пример curl-запроса

```bash
curl -X POST http://localhost:3000/api/appeals \
  -H "Content-Type: application/json" \
  -d '{"subject": "Вопрос", "text": "Текст обращения"}'
``` 