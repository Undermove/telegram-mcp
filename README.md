# Telegram MCP Local Server

Простой MCP (Model Context Protocol) сервер для работы с Telegram. Позволяет получать список чатов, историю сообщений и отправлять сообщения через Telegram API.

## Возможности

- 🔌 Подключение к Telegram через API
- 💬 Получение списка чатов
- 📜 Получение истории сообщений из чатов
- 📤 Отправка сообщений
- 🔄 Работа через stdio (для интеграции с MCP-совместимыми клиентами)
- 🔒 Режим "только чтение" (readonly) для безопасной работы

## Установка

### Через npx (рекомендуется)

Вы можете запустить сервер напрямую без установки:

```bash
npx telegram-mcp-local-server
```

Или установить глобально:

```bash
npm install -g telegram-mcp-local-server
telegram-mcp-local-server
```

### Для разработки

```bash
git clone <repository-url>
cd telegram-mcp-server
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
# Через npx
npx telegram-mcp-local-server

# Или если установлен глобально
telegram-mcp-local-server

# Для разработки
npm start
# или
npm run dev
```

### Режим "только чтение" (Readonly Mode)

Для безопасной работы сервер можно запустить в режиме "только чтение", в котором доступны только функции чтения (получение чатов и истории сообщений), а отправка сообщений заблокирована.

```bash
# Через npx
TELEGRAM_READONLY_MODE=true npx telegram-mcp-local-server

# Или если установлен глобально  
TELEGRAM_READONLY_MODE=true telegram-mcp-local-server

# Для разработки
TELEGRAM_READONLY_MODE=true npm start
# или
TELEGRAM_READONLY_MODE=true npm run dev
```

В readonly режиме доступны только следующие инструменты:
- `telegram_connect` - подключение к Telegram
- `telegram_get_chats` - получение списка чатов  
- `telegram_get_chat_history` - получение истории сообщений

Инструмент `telegram_send_message` недоступен в readonly режиме.

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

## Настройка аутентификации

Для работы с Telegram API необходимо получить строку сессии:

### Способ 1: Использование утилиты session-helper

```bash
npm run session
```

Следуйте инструкциям в интерактивном режиме:
1. Введите API ID и Hash
2. Введите номер телефона
3. Введите код из SMS
4. При необходимости введите пароль двухфакторной аутентификации
5. Скопируйте полученную строку сессии

### Способ 2: Вручную

```bash
npm run test-client
```

Эта команда запустит интерактивный тест клиента для получения сессии.

## Тестирование

### Тест основного функционала

```bash
npm run example
```

Эта команда покажет доступные инструменты и примеры использования.

### Интерактивный тест

```bash
npm run test-client
```

Интерактивный тест, который поможет проверить подключение и основные функции.

## Настройка MCP клиента

Для использования с MCP-совместимыми клиентами (например, Claude Desktop), добавьте в конфигурацию:

### Через npx (рекомендуется)

```json
{
  "mcpServers": {
    "telegram": {
      "command": "npx",
      "args": ["telegram-mcp-local-server"],
      "env": {
        "TELEGRAM_API_ID": "your_api_id",
        "TELEGRAM_API_HASH": "your_api_hash",
        "TELEGRAM_SESSION_STRING": "your_session_string",
        "TELEGRAM_READONLY_MODE": "true"
      }
    }
  }
}
```

### Через глобальную установку

```json
{
  "mcpServers": {
    "telegram": {
      "command": "telegram-mcp-local-server",
      "env": {
        "TELEGRAM_API_ID": "your_api_id",
        "TELEGRAM_API_HASH": "your_api_hash", 
        "TELEGRAM_SESSION_STRING": "your_session_string",
        "TELEGRAM_READONLY_MODE": "true"
      }
    }
  }
}
```

### Локальная установка

```json
{
  "mcpServers": {
    "telegram": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/telegram-mcp-server",
      "env": {
        "TELEGRAM_API_ID": "your_api_id",
        "TELEGRAM_API_HASH": "your_api_hash",
        "TELEGRAM_SESSION_STRING": "your_session_string",
        "TELEGRAM_READONLY_MODE": "true"
      }
    }
  }
}
```

**Примечание**: Установите `TELEGRAM_READONLY_MODE=true` для безопасного режима только чтения.

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

## Разработка

Для разработки и внесения изменений см. [CONTRIBUTING.md](CONTRIBUTING.md).

### Быстрый старт для разработчиков

```bash
git clone <repository-url>
cd telegram-mcp-server
npm install
npm run build
npm test
```

### Автоматическая публикация

Проект использует GitHub Actions для автоматической публикации в npm при изменениях в main ветке.

## Лицензия

MIT
