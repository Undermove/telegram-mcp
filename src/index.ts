#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { TelegramClient } from "./telegram-client.js";

const server = new Server(
  {
    name: "telegram-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Telegram client instance
let telegramClient: TelegramClient | null = null;

// Initialize Telegram client
async function initializeTelegramClient(apiId: string, apiHash: string, sessionString?: string) {
  if (!telegramClient) {
    telegramClient = new TelegramClient({
      apiId: parseInt(apiId),
      apiHash,
      sessionString,
    });
    await telegramClient.connect();
  }
  return telegramClient;
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "telegram_connect",
        description: "Connect to Telegram using API credentials",
        inputSchema: {
          type: "object",
          properties: {
            apiId: {
              type: "string",
              description: "Telegram API ID",
            },
            apiHash: {
              type: "string", 
              description: "Telegram API Hash",
            },
            sessionString: {
              type: "string",
              description: "Optional session string for authentication",
            },
          },
          required: ["apiId", "apiHash"],
        },
      },
      {
        name: "telegram_get_chats",
        description: "Get list of chats from Telegram",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Maximum number of chats to retrieve (default: 50)",
            },
          },
        },
      },
      {
        name: "telegram_get_chat_history",
        description: "Get message history from a specific chat",
        inputSchema: {
          type: "object",
          properties: {
            chatId: {
              type: "string",
              description: "Chat ID or username",
            },
            limit: {
              type: "number", 
              description: "Maximum number of messages to retrieve (default: 50)",
            },
            offsetId: {
              type: "number",
              description: "Message ID to start from (for pagination)",
            },
          },
          required: ["chatId"],
        },
      },
      {
        name: "telegram_send_message",
        description: "Send a message to a specific chat",
        inputSchema: {
          type: "object",
          properties: {
            chatId: {
              type: "string",
              description: "Chat ID or username",
            },
            message: {
              type: "string",
              description: "Message text to send",
            },
          },
          required: ["chatId", "message"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "telegram_connect": {
        const connectSchema = z.object({
          apiId: z.string(),
          apiHash: z.string(),
          sessionString: z.string().optional(),
        });

        const { apiId, apiHash, sessionString } = connectSchema.parse(args);
        
        try {
          await initializeTelegramClient(apiId, apiHash, sessionString);
          return {
            content: [
              {
                type: "text",
                text: "Successfully connected to Telegram",
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Failed to connect to Telegram: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
          };
        }
      }

      case "telegram_get_chats": {
        if (!telegramClient) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            "Telegram client not initialized. Please connect first using telegram_connect."
          );
        }

        const chatsSchema = z.object({
          limit: z.number().optional().default(50),
        });

        const { limit } = chatsSchema.parse(args);
        
        try {
          const chats = await telegramClient.getChats(limit);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(chats, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Failed to get chats: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
          };
        }
      }

      case "telegram_get_chat_history": {
        if (!telegramClient) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            "Telegram client not initialized. Please connect first using telegram_connect."
          );
        }

        const historySchema = z.object({
          chatId: z.string(),
          limit: z.number().optional().default(50),
          offsetId: z.number().optional(),
        });

        const { chatId, limit, offsetId } = historySchema.parse(args);
        
        try {
          const messages = await telegramClient.getChatHistory(chatId, limit, offsetId);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(messages, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Failed to get chat history: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
          };
        }
      }

      case "telegram_send_message": {
        if (!telegramClient) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            "Telegram client not initialized. Please connect first using telegram_connect."
          );
        }

        const sendSchema = z.object({
          chatId: z.string(),
          message: z.string(),
        });

        const { chatId, message } = sendSchema.parse(args);
        
        try {
          const result = await telegramClient.sendMessage(chatId, message);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Failed to send message: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
          };
        }
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid parameters: ${error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')}`
      );
    }
    throw error;
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Telegram MCP server running on stdio");
}

runServer().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});