#!/usr/bin/env node

import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function main(): Promise<void> {
  console.log('=== Telegram Session Helper ===\n');
  console.log('This utility will help you generate a session string for the MCP server.');
  console.log('You will need API keys from https://my.telegram.org/\n');

  try {
    const apiId = await question('Enter your API ID: ');
    const apiHash = await question('Enter your API Hash: ');

    console.log('\nConnecting to Telegram...');
    
    const stringSession = new StringSession('');
    const client = new TelegramClient(stringSession, parseInt(apiId), apiHash, {
      connectionRetries: 5,
    });

    await client.start({
      phoneNumber: async () => await question('Enter your phone number (with country code): '),
      password: async () => await question('Enter your 2FA password: '),
      phoneCode: async () => await question('Enter the verification code from SMS: '),
      onError: (err: Error) => console.error('Error:', err),
    });

    console.log('\n✅ Successfully connected to Telegram!');
    
    const sessionString = client.session.save();
    console.log('\n🔑 Your session string:');
    console.log(`"${sessionString}"`);
    
    console.log('\n📝 Use this session string in the TELEGRAM_SESSION_STRING environment variable');
    console.log('⚠️  Keep this string secure and do not share it with others!');
    console.log('\n📋 Example usage:');
    console.log('TELEGRAM_SESSION_STRING="' + sessionString + '" npx telegram-mcp-local-server');

    await client.disconnect();
    
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
  } finally {
    rl.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default main;