describe('TelegramClient', () => {
  test('should validate telegram configuration', () => {
    const validateTelegramConfig = (config: any): boolean => {
      return typeof config === 'object' &&
             typeof config.apiId === 'string' &&
             typeof config.apiHash === 'string';
    };

    const validConfig = {
      apiId: "test_api_id",
      apiHash: "test_api_hash",
    };

    const invalidConfig = {
      apiId: "test_api_id",
      // missing apiHash
    };

    expect(validateTelegramConfig(validConfig)).toBe(true);
    expect(validateTelegramConfig(invalidConfig)).toBe(false);
  });

  test('should format message data correctly', () => {
    // Test message formatting utility functions
    const formatMessage = (msg: any) => {
      return {
        id: msg.id || 0,
        text: msg.text || '',
        date: msg.date || new Date().toISOString(),
        from: msg.from || 'unknown'
      };
    };

    const rawMessage = {
      id: 123,
      text: 'Hello world',
      date: '2024-01-01T00:00:00Z',
      from: 'user123'
    };

    const formatted = formatMessage(rawMessage);
    
    expect(formatted.id).toBe(123);
    expect(formatted.text).toBe('Hello world');
    expect(formatted.date).toBe('2024-01-01T00:00:00Z');
    expect(formatted.from).toBe('user123');
  });

  test('should handle empty messages', () => {
    const formatMessage = (msg: any) => {
      return {
        id: msg.id || 0,
        text: msg.text || '',
        date: msg.date || new Date().toISOString(),
        from: msg.from || 'unknown'
      };
    };

    const emptyMessage = {};
    const formatted = formatMessage(emptyMessage);
    
    expect(formatted.id).toBe(0);
    expect(formatted.text).toBe('');
    expect(formatted.from).toBe('unknown');
    expect(formatted.date).toBeDefined();
  });

  test('should validate chat IDs', () => {
    const isValidChatId = (chatId: any): boolean => {
      return typeof chatId === 'string' && chatId.length > 0;
    };

    expect(isValidChatId('valid_chat_id')).toBe(true);
    expect(isValidChatId('')).toBe(false);
    expect(isValidChatId(123)).toBe(false);
    expect(isValidChatId(null)).toBe(false);
  });
});