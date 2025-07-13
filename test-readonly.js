#!/usr/bin/env node

/**
 * Test script to check readonly mode functionality
 */

import { spawn } from 'child_process';

function testReadonlyMode() {
  console.log('Testing readonly mode...');
  
  // Start server in readonly mode
  const server = spawn('node', ['dist/index.js'], {
    env: { ...process.env, TELEGRAM_READONLY_MODE: 'true' },
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Test list tools request
  const listToolsRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  };

  server.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      if (line.startsWith('{')) {
        try {
          const response = JSON.parse(line);
          if (response.id === 1 && response.result && response.result.tools) {
            console.log('Available tools in readonly mode:');
            response.result.tools.forEach(tool => {
              console.log(`- ${tool.name}: ${tool.description}`);
            });
            
            // Check if send message tool is NOT present
            const hasSendMessage = response.result.tools.some(tool => tool.name === 'telegram_send_message');
            if (!hasSendMessage) {
              console.log('✅ SUCCESS: telegram_send_message tool is not available in readonly mode');
            } else {
              console.log('❌ ERROR: telegram_send_message tool is available in readonly mode');
            }
            
            server.kill();
            process.exit(0);
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });
  });

  server.stderr.on('data', (data) => {
    console.log('Server log:', data.toString());
  });

  server.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
  });

  // Send list tools request
  setTimeout(() => {
    server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
  }, 1000);

  // Timeout after 10 seconds
  setTimeout(() => {
    console.log('Test timeout');
    server.kill();
    process.exit(1);
  }, 10000);
}

function testNormalMode() {
  console.log('Testing normal mode...');
  
  // Start server in normal mode
  const server = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Test list tools request
  const listToolsRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  };

  server.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      if (line.startsWith('{')) {
        try {
          const response = JSON.parse(line);
          if (response.id === 2 && response.result && response.result.tools) {
            console.log('Available tools in normal mode:');
            response.result.tools.forEach(tool => {
              console.log(`- ${tool.name}: ${tool.description}`);
            });
            
            // Check if send message tool IS present
            const hasSendMessage = response.result.tools.some(tool => tool.name === 'telegram_send_message');
            if (hasSendMessage) {
              console.log('✅ SUCCESS: telegram_send_message tool is available in normal mode');
            } else {
              console.log('❌ ERROR: telegram_send_message tool is not available in normal mode');
            }
            
            server.kill();
            
            // Now test readonly mode
            testReadonlyMode();
            return;
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });
  });

  server.stderr.on('data', (data) => {
    console.log('Server log:', data.toString());
  });

  server.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
  });

  // Send list tools request
  setTimeout(() => {
    server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
  }, 1000);

  // Timeout after 10 seconds
  setTimeout(() => {
    console.log('Test timeout');
    server.kill();
    process.exit(1);
  }, 10000);
}

console.log('Starting readonly mode tests...');
testNormalMode();