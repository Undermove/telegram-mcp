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
  console.log('Open https://my.telegram.org/\n');
  console.log('Navigate "API development tools" section\n');

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
      phoneCode: async () => await question('Enter the verification code from SMS or Telegram: '),
      onError: (err: Error) => console.error('Error:', err),
    });

    console.log('\n✅ Successfully connected to Telegram!');
    
    const sessionString = client.session.save();
    
    console.log('\n🔑 Session string generated successfully!');
    console.log('⚠️  Keep this configuration secure and do not share it with others!');

    console.log('\n📝 Alternative: Environment variables setup');
    console.log(`TELEGRAM_API_ID="${apiId}"`);
    console.log(`TELEGRAM_API_HASH="${apiHash}"`);
    console.log(`TELEGRAM_SESSION_STRING="${sessionString}"`);
    
    // Generate MCP configuration JSON
    const mcpConfig = {
      mcpServers: {
        telegram: {
          command: "npx",
          args: ["telegram-mcp-local-server"],
          env: {
            TELEGRAM_API_ID: apiId,
            TELEGRAM_API_HASH: apiHash,
            TELEGRAM_SESSION_STRING: sessionString,
            TELEGRAM_READONLY_MODE: true
          }
        }
      }
    };
    
    console.log('\n📋 Copy this JSON configuration for your MCP client:');
    console.log('=' .repeat(60));
    console.log(JSON.stringify(mcpConfig, null, 2));
    console.log('=' .repeat(60));
    
    console.log('\n💡 Usage instructions:');
    console.log('1. Copy the JSON configuration above to your MCP client settings');
    console.log('2. Or set the environment variables and run: npx telegram-mcp-local-server');
    console.log('3. The server supports readonly mode with: TELEGRAM_READONLY_MODE=true');

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