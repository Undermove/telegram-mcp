#!/usr/bin/env tsx

/**
 * Test script to check channel message collection functionality
 * Uses credentials from .env file
 */

import { TelegramClient } from "./telegram-client.js";
import { readFileSync } from 'fs';
import * as path from 'path';

interface EnvConfig {
  TELEGRAM_API_ID?: string;
  TELEGRAM_API_HASH?: string;
  TELEGRAM_STRING_SESSION?: string;
  TG_CHANNELS?: string;
}

function loadEnvFile(): EnvConfig {
  try {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = readFileSync(envPath, 'utf8');
    const config: EnvConfig = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        (config as any)[key.trim()] = value;
      }
    });
    
    return config;
  } catch (error) {
    console.error('Error loading .env file:', error);
    return {};
  }
}

async function testChannelMessages() {
  try {
    console.log("=== Telegram Channel Messages Test ===\n");

    // Load configuration from .env
    const config = loadEnvFile();
    
    if (!config.TELEGRAM_API_ID || !config.TELEGRAM_API_HASH || !config.TELEGRAM_STRING_SESSION) {
      console.error("Missing required environment variables in .env file:");
      console.error("- TELEGRAM_API_ID");
      console.error("- TELEGRAM_API_HASH"); 
      console.error("- TELEGRAM_SESSION_STRING");
      return;
    }

    const channels = config.TG_CHANNELS?.split(',').map(c => c.trim()) || [];
    if (channels.length === 0) {
      console.error("No channels specified in TG_CHANNELS");
      return;
    }

    console.log(`Found ${channels.length} channels in config:`, channels.slice(0, 3).join(', '), channels.length > 3 ? '...' : '');
    
    console.log("\nConnecting to Telegram...");
    
    const client = new TelegramClient({
      apiId: parseInt(config.TELEGRAM_API_ID),
      apiHash: config.TELEGRAM_API_HASH,
      sessionString: config.TELEGRAM_STRING_SESSION,
    });

    await client.connect();
    console.log("✅ Connected successfully!");

    // Test with first few channels
    const testChannels = channels.slice(0, 3);
    console.log(`\n=== Testing with first ${testChannels.length} channels ===`);

    for (const channelName of testChannels) {
      console.log(`\n--- Testing channel: @${channelName} ---`);
      
      try {
        // Test getting recent messages (last 5)
        const messages = await client.getChatHistory(channelName, 5);
        
        console.log(`✅ Found ${messages.length} messages in @${channelName}`);
        
        if (messages.length > 0) {
          console.log("Recent messages:");
          messages.forEach((msg, index) => {
            const date = msg.date.toLocaleString();
            const preview = msg.text.substring(0, 80);
            const truncated = msg.text.length > 80 ? '...' : '';
            console.log(`  ${index + 1}. [${date}] ${preview}${truncated}`);
          });
        } else {
          console.log("  No recent messages found");
        }
        
      } catch (error) {
        console.error(`❌ Error with @${channelName}:`, error instanceof Error ? error.message : error);
      }
    }

    // Test getting chats to see what's available
    console.log("\n=== Available Chats (first 10) ===");
    try {
      const chats = await client.getChats(10);
      console.log(`Found ${chats.length} chats:`);
      chats.forEach((chat, index) => {
        console.log(`  ${index + 1}. ${chat.title} (${chat.type}) - ID: ${chat.id}`);
      });
    } catch (error) {
      console.error("Error getting chats:", error);
    }

    await client.disconnect();
    console.log("\n✅ Test completed successfully!");
    
  } catch (error) {
    console.error("❌ Test failed:", error instanceof Error ? error.message : error);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testChannelMessages();
}