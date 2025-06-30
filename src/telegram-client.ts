import { TelegramClient as TgClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

export interface TelegramConfig {
  apiId: number;
  apiHash: string;
  sessionString?: string;
}

export interface ChatInfo {
  id: string;
  title: string;
  type: string;
  username?: string;
  participantsCount?: number;
}

export interface MessageInfo {
  id: number;
  text: string;
  date: Date;
  fromId?: string;
  fromUsername?: string;
  fromFirstName?: string;
  fromLastName?: string;
  replyToMsgId?: number;
}

export class TelegramClient {
  private client: TgClient;
  private config: TelegramConfig;

  constructor(config: TelegramConfig) {
    this.config = config;
    const session = new StringSession(config.sessionString || "");
    
    this.client = new TgClient(session, config.apiId, config.apiHash, {
      connectionRetries: 5,
    });
  }

  async connect(): Promise<void> {
    console.error("Connecting to Telegram...");
    await this.client.start({
      phoneNumber: async () => {
        throw new Error("Phone number authentication not supported in MCP server mode. Please provide a session string.");
      },
      password: async () => {
        throw new Error("Password authentication not supported in MCP server mode. Please provide a session string.");
      },
      phoneCode: async () => {
        throw new Error("Phone code authentication not supported in MCP server mode. Please provide a session string.");
      },
      onError: (err: any) => {
        console.error("Telegram authentication error:", err);
        throw err;
      },
    });
    console.error("Connected to Telegram successfully");
  }

  async getChats(limit: number = 50): Promise<ChatInfo[]> {
    console.error(`Fetching ${limit} chats...`);
    
    const dialogs = await this.client.getDialogs({ limit });
    
    const chats: ChatInfo[] = [];
    
    for (const dialog of dialogs) {
      const entity = dialog.entity as any;
      
      if (!entity) continue;
      
      let chatInfo: ChatInfo;
      
      if (entity.className === "User") {
        chatInfo = {
          id: entity.id.toString(),
          title: `${entity.firstName || ""} ${entity.lastName || ""}`.trim(),
          type: "user",
          username: entity.username,
        };
      } else if (entity.className === "Chat") {
        chatInfo = {
          id: entity.id.toString(),
          title: entity.title,
          type: "group",
          participantsCount: entity.participantsCount,
        };
      } else if (entity.className === "Channel") {
        chatInfo = {
          id: entity.id.toString(),
          title: entity.title,
          type: entity.broadcast ? "channel" : "supergroup",
          username: entity.username,
          participantsCount: entity.participantsCount,
        };
      } else {
        continue; // Skip unknown entity types
      }
      
      chats.push(chatInfo);
    }
    
    console.error(`Fetched ${chats.length} chats`);
    return chats;
  }

  async getChatHistory(chatId: string, limit: number = 50, offsetId?: number): Promise<MessageInfo[]> {
    console.error(`Fetching ${limit} messages from chat ${chatId}...`);
    
    try {
      const entity = await this.client.getEntity(chatId);
      
      const messages = await this.client.getMessages(entity, {
        limit,
        offsetId,
      });
      
      const messageInfos: MessageInfo[] = [];
      
      for (const message of messages) {
        if (!message || message.className !== "Message") {
          continue;
        }
        
        let fromUsername: string | undefined;
        let fromFirstName: string | undefined;
        let fromLastName: string | undefined;
        
        if (message.fromId) {
          try {
            const sender = await this.client.getEntity(message.fromId);
            if (sender.className === "User") {
              fromUsername = sender.username;
              fromFirstName = sender.firstName;
              fromLastName = sender.lastName;
            }
          } catch (error) {
            console.error("Error getting sender info:", error);
          }
        }
        
        const messageInfo: MessageInfo = {
          id: message.id,
          text: message.message || "",
          date: new Date(message.date * 1000),
          fromId: message.fromId?.toString(),
          fromUsername,
          fromFirstName,
          fromLastName,
          replyToMsgId: message.replyTo?.replyToMsgId,
        };
        
        messageInfos.push(messageInfo);
      }
      
      console.error(`Fetched ${messageInfos.length} messages`);
      return messageInfos;
    } catch (error) {
      console.error(`Error fetching chat history for ${chatId}:`, error);
      throw error;
    }
  }

  async sendMessage(chatId: string, message: string): Promise<MessageInfo> {
    console.error(`Sending message to chat ${chatId}...`);
    
    try {
      const entity = await this.client.getEntity(chatId);
      const result = await this.client.sendMessage(entity, { message });
      
      if (!result || result.className !== "Message") {
        throw new Error("Failed to send message");
      }
      
      const messageInfo: MessageInfo = {
        id: result.id,
        text: result.message || "",
        date: new Date(result.date * 1000),
        fromId: result.fromId?.toString(),
      };
      
      console.error("Message sent successfully");
      return messageInfo;
    } catch (error) {
      console.error(`Error sending message to ${chatId}:`, error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    console.error("Disconnecting from Telegram...");
    await this.client.disconnect();
    console.error("Disconnected from Telegram");
  }
}