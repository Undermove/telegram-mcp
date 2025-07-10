#!/usr/bin/env node

// Пример использования MCP сервера для работы с Telegram через stdio
const { spawn } = require('child_process');

// Запуск MCP сервера
const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit']
});

// Функция для отправки JSON-RPC запросов
function sendRequest(method, params = {}) {
  const request = {
    jsonrpc: "2.0",
    id: Math.random(),
    method: method,
    params: params
  };
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, 30000);

    const onData = (data) => {
      clearTimeout(timeout);
      server.stdout.removeListener('data', onData);
      try {
        const response = JSON.parse(data.toString());
        if (response.error) {
          reject(new Error(response.error.message));
        } else {
          resolve(response.result);
        }
      } catch (e) {
        reject(e);
      }
    };

    server.stdout.on('data', onData);
    server.stdin.write(JSON.stringify(request) + '\n');
  });
}

// Основная функция для демонстрации
async function main() {
  try {
    console.log('=== Тестирование Telegram MCP Server ===\n');

    // Инициализация MCP сервера
    console.log('1. Инициализация сервера...');
    await sendRequest('initialize', {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "test-client",
        version: "1.0.0"
      }
    });

    // Получение списка доступных инструментов
    console.log('2. Получение списка инструментов...');
    const tools = await sendRequest('tools/list');
    console.log('Доступные инструменты:');
    tools.tools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });

    console.log('\n=== Для использования сервера: ===');
    console.log('1. Получите API ключи на https://my.telegram.org/');
    console.log('2. Используйте инструмент telegram_connect для подключения');
    console.log('3. Затем используйте telegram_get_chats и telegram_get_chat_history');
    console.log('\nПример вызова:');
    console.log(JSON.stringify({
      method: 'tools/call',
      params: {
        name: 'telegram_connect',
        arguments: {
          apiId: 'YOUR_API_ID',
          apiHash: 'YOUR_API_HASH'
        }
      }
    }, null, 2));

  } catch (error) {
    console.error('Ошибка:', error.message);
  } finally {
    server.kill();
  }
}

// Обработка ошибок
server.on('error', (error) => {
  console.error('Ошибка сервера:', error);
});

server.on('exit', (code) => {
  console.log(`Сервер завершился с кодом ${code}`);
});

main();