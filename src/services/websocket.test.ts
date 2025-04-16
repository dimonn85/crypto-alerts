import { describe, test, expect, vi } from 'vitest';
import { createWebSocketConnection, subscribeToTopic } from './websocket';

describe('createWebSocketConnection', () => {
  test('creates WebSocket with correct URL', () => {
    const mockConstructor = vi.fn();
    vi.stubGlobal('WebSocket', mockConstructor as unknown as typeof WebSocket);

    const apiKey = 'my-test-key';
    createWebSocketConnection(apiKey);

    expect(mockConstructor).toHaveBeenCalledWith(
      `wss://streamer.cryptocompare.com/v2?api_key=${apiKey}`
    );

    vi.unstubAllGlobals();
  });
});

describe('subscribeToTopic', () => {
  test('sends subscription message to socket', () => {
    const mockSend = vi.fn();
    const mockSocket = { send: mockSend } as unknown as WebSocket;

    subscribeToTopic(mockSocket, 'my-topic');

    expect(mockSend).toHaveBeenCalledWith(
      JSON.stringify({
        action: 'SubAdd',
        subs: ['my-topic'],
      })
    );
  });
});
