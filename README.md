# Telegram MCP Local Server

[![npm version](https://badge.fury.io/js/telegram-mcp-local-server.svg)](https://badge.fury.io/js/telegram-mcp-local-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dm/telegram-mcp-local-server.svg)](https://www.npmjs.com/package/telegram-mcp-local-server)

A secure Model Context Protocol (MCP) server for Telegram integration. Allows AI agents to interact with Telegram API locally on your machine.

## How It Works & Security

This server runs **entirely on your local machine** and acts as a bridge between AI agents (like Cursor, Claude, etc.) and Telegram's API. 

🔒 **Your data stays private:**
- All communication happens locally between your AI agent and your machine
- No data is sent to third-party servers
- Your Telegram credentials remain on your device
- Session data is stored locally and never transmitted

🛡️ **Built-in safety features:**
- Readonly mode by default (prevents accidental message sending)
- Local session management
- Direct API communication with Telegram only

## Getting Credentials

### Step 1: Get Telegram API Keys

1. Go to https://my.telegram.org/
2. Log in with your Telegram account
3. Navigate to "API development tools"
4. Create a new application to get your `api_id` and `api_hash`

### Step 2: Generate Session String

Use the built-in session helper without downloading the repository:

```bash
npx telegram-mcp-local-server --session
```

Follow the prompts:
1. Enter your API ID and Hash
2. Enter your phone number
3. Enter the verification code from SMS
4. Enter your 2FA password if enabled
5. Copy the generated session string

## Configuration for Cursor

Add this to your Cursor MCP configuration:

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

**Note:** Keep `TELEGRAM_READONLY_MODE=true` for safe operation. This allows reading chats and message history but prevents sending messages.

## Available Tools

- `telegram_connect` - Connect to Telegram
- `telegram_get_chats` - Get list of your chats
- `telegram_get_chat_history` - Read message history from specific chats
- `telegram_send_message` - Send messages (disabled in readonly mode)

## Quick Test

Test your setup:

```bash
# Test connection and basic functionality
npx telegram-mcp-local-server --help

# Generate new session if needed
npx telegram-mcp-local-server --session
```

## License

MIT - Your data, your control.
