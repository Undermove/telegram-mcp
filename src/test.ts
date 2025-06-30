#!/usr/bin/env node

import { TelegramClient } from "./telegram-client.js";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function main() {
  try {
    console.log("=== Telegram MCP Server Test ===\n");

    const apiId = await question("Enter your Telegram API ID: ");
    const apiHash = await question("Enter your Telegram API Hash: ");
    const sessionString = await question("Enter your session string (or press Enter to skip): ");

    console.log("\nConnecting to Telegram...");
    
    const client = new TelegramClient({
      apiId: parseInt(apiId),
      apiHash,
      sessionString: sessionString || undefined,
    });

    await client.connect();

    console.log("\n=== Testing chat list ===");
    const chats = await client.getChats(10);
    console.log(`Found ${chats.length} chats:`);
    chats.forEach((chat, index) => {
      console.log(`${index + 1}. ${chat.title} (${chat.type}) - ID: ${chat.id}`);
    });

    if (chats.length > 0) {
      const chatIndex = await question(`\nSelect chat number (1-${chats.length}) to get history: `);
      const selectedChat = chats[parseInt(chatIndex) - 1];
      
      if (selectedChat) {
        console.log(`\n=== Getting history for ${selectedChat.title} ===`);
        const messages = await client.getChatHistory(selectedChat.id, 5);
        console.log(`Found ${messages.length} messages:`);
        messages.forEach((msg, index) => {
          console.log(`${index + 1}. [${msg.date.toLocaleString()}] ${msg.fromFirstName || 'Unknown'}: ${msg.text.substring(0, 100)}${msg.text.length > 100 ? '...' : ''}`);
        });
      }
    }

    await client.disconnect();
    console.log("\nTest completed successfully!");
    
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    rl.close();
  }
}

main();