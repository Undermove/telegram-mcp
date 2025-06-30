# Telegram MCP Server

Простой MCP (Model Context Protocol) сервер для работы с Telegram. Позволяет получать список чатов, историю сообщений и отправлять сообщения через Telegram API.

## Возможности

- 🔌 Подключение к Telegram через API
- 💬 Получение списка чатов
- 📜 Получение истории сообщений из чатов
- 📤 Отправка сообщений
- 🔄 Работа через stdio (для интеграции с MCP-совместимыми клиентами)

## Установка

```bash
npm install
npm run build
```

## Получение Telegram API ключей

1. Перейдите на https://my.telegram.org/
2. Войдите в свою учетную запись Telegram
3. Перейдите в раздел "API development tools"
4. Создайте новое приложение и получите `api_id` и `api_hash`

## Использование

### Запуск сервера

```bash
npm start
```

или для разработки:

```bash
npm run dev
```

### Доступные инструменты

#### `telegram_connect`
Подключение к Telegram с использованием API ключей.

Параметры:
- `apiId` (обязательно): Telegram API ID
- `apiHash` (обязательно): Telegram API Hash
- `sessionString` (опционально): Строка сессии для авторизации

#### `telegram_get_chats`
Получение списка чатов.

Параметры:
- `limit` (опционально): Максимальное количество чатов (по умолчанию: 50)

#### `telegram_get_chat_history`
Получение истории сообщений из конкретного чата.

Параметры:
- `chatId` (обязательно): ID чата или username
- `limit` (опционально): Максимальное количество сообщений (по умолчанию: 50)
- `offsetId` (опционально): ID сообщения для начала (для пагинации)

#### `telegram_send_message`
Отправка сообщения в конкретный чат.

Параметры:
- `chatId` (обязательно): ID чата или username
- `message` (обязательно): Текст сообщения

## Пример использования

```javascript
// Подключение к Telegram
{
  "name": "telegram_connect",
  "arguments": {
    "apiId": "your_api_id",
    "apiHash": "your_api_hash"
  }
}

// Получение списка чатов
{
  "name": "telegram_get_chats",
  "arguments": {
    "limit": 20
  }
}

// Получение истории сообщений
{
  "name": "telegram_get_chat_history", 
  "arguments": {
    "chatId": "@username",
    "limit": 100
  }
}

// Отправка сообщения
{
  "name": "telegram_send_message",
  "arguments": {
    "chatId": "@username",
    "message": "Привет!"
  }
}
```

## Аутентификация

При первом подключении вам может потребоваться пройти аутентификацию:

1. Запустите сервер в интерактивном режиме
2. Введите номер телефона
3. Введите код подтверждения из SMS
4. При необходимости введите двухфакторный пароль
5. Сохраните полученную строку сессии для дальнейшего использования

## Структура проекта

```
src/
├── index.ts          # Основной MCP сервер
└── telegram-client.ts # Клиент для работы с Telegram API
```

## Зависимости

- `@modelcontextprotocol/sdk` - SDK для MCP
- `telegram` - Библиотека для работы с Telegram API
- `zod` - Валидация параметров

## Лицензия

MIT
