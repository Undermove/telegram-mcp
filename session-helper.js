#!/usr/bin/env node

// Утилита для получения строки сессии Telegram
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function main() {
  console.log('=== Telegram Session Helper ===\n');
  console.log('Эта утилита поможет вам получить строку сессии для MCP сервера.');
  console.log('Для этого вам понадобятся API ключи с https://my.telegram.org/\n');

  try {
    const apiId = await question('Введите ваш API ID: ');
    const apiHash = await question('Введите ваш API Hash: ');

    console.log('\nПодключение к Telegram...');
    
    const stringSession = new StringSession('');
    const client = new TelegramClient(stringSession, parseInt(apiId), apiHash, {
      connectionRetries: 5,
    });

    await client.start({
      phoneNumber: async () => await question('Введите ваш номер телефона (с кодом страны): '),
      password: async () => await question('Введите ваш пароль двухфакторной аутентификации: '),
      phoneCode: async () => await question('Введите код из SMS: '),
      onError: (err) => console.error('Ошибка:', err),
    });

    console.log('\n✅ Успешно подключены к Telegram!');
    
    const sessionString = client.session.save();
    console.log('\n🔑 Ваша строка сессии:');
    console.log(`"${sessionString}"`);
    
    console.log('\n📝 Используйте эту строку сессии в параметре sessionString при вызове telegram_connect');
    console.log('⚠️  Храните эту строку в безопасном месте и не делитесь ей с другими!');

    await client.disconnect();
    
  } catch (error) {
    console.error('Ошибка:', error.message);
  } finally {
    rl.close();
  }
}

main();