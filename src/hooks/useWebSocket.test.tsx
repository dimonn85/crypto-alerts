import { renderHook, act } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import { subscribeToTopic } from '../services/websocket';
import { useWebSocket } from './useWebSocket';
import { OrderMessage } from '../types/orders-types';

class MockWebSocket {
  static instances: MockWebSocket[] = [];
  onopen: () => void = () => {};
  onmessage: (event: { data: string }) => void = () => {};
  close = vi.fn();

  constructor() {
    MockWebSocket.instances.push(this);
  }
}
vi.stubGlobal('WebSocket', MockWebSocket);

vi.mock('../services/websocket', () => ({
  createWebSocketConnection: () => new WebSocket('wss://test'),
  subscribeToTopic: vi.fn(),
}));

const orderMessage = {
  ACTION: 0,
  CCSEQ: 0,
  DELAYNS: 0,
  FSYM: 'BTC',
  M: 'Binance',
  P: 50000,
  Q: 1,
  REPORTEDNS: Date.now() * 1000000,
  SEQ: 1,
  SIDE: 0,
  TSYM: 'USDT',
  TYPE: '8',
} satisfies OrderMessage;

describe('useWebSocket', () => {
  beforeEach(() => {
    MockWebSocket.instances = [];
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('connects and sets isConnected to true on open', () => {
    const { result } = renderHook(() =>
      useWebSocket({ apiKey: 'test', maxItems: 10, topic: 'orders' })
    );

    act(() => {
      result.current.startStream();
    });

    expect(MockWebSocket.instances.length).toBe(1);

    act(() => {
      MockWebSocket.instances[0].onopen();
    });

    expect(result.current.isConnected).toBe(true);
  });

  test('receives and buffers order messages correctly and flushes after interval', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() =>
      useWebSocket({ apiKey: 'test', maxItems: 5, topic: 'orders' })
    );

    act(() => {
      result.current.startStream();
      MockWebSocket.instances[0].onopen();
    });

    act(() => {
      MockWebSocket.instances[0].onmessage({
        data: JSON.stringify(orderMessage),
      });
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.orders).toHaveLength(1);
    expect(result.current.orders[0].FSYM).toBe('BTC');
  });

  test('limits order buffer to maxItems', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() =>
      useWebSocket({ apiKey: 'test', maxItems: 3, topic: 'orders' })
    );

    act(() => {
      result.current.startStream();
      MockWebSocket.instances[0].onopen();
    });

    act(() => {
      for (let i = 0; i < 5; i++) {
        MockWebSocket.instances[0].onmessage({
          data: JSON.stringify({ ...orderMessage, SEQ: i }),
        });
      }
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.orders).toHaveLength(3);
    expect(result.current.orders[0].SEQ).toBe(4);
  });

  test('stopStream closes connection and clears state', () => {
    const { result } = renderHook(() =>
      useWebSocket({ apiKey: 'test', maxItems: 5, topic: 'orders' })
    );

    act(() => {
      result.current.startStream();
      MockWebSocket.instances[0].onopen();
    });

    act(() => {
      result.current.stopStream();
    });

    expect(result.current.isConnected).toBe(false);
    expect(MockWebSocket.instances[0].close).toHaveBeenCalled();
  });

  test('ignores non-8 messages', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() =>
      useWebSocket({ apiKey: 'test', maxItems: 5, topic: 'orders' })
    );

    act(() => {
      result.current.startStream();
      MockWebSocket.instances[0].onopen();
    });

    act(() => {
      MockWebSocket.instances[0].onmessage({
        data: JSON.stringify({ ...orderMessage, TYPE: '2' }),
      });
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.orders).toHaveLength(0);
  });

  test('logs parse errors gracefully', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() =>
      useWebSocket({ apiKey: 'test', maxItems: 5, topic: 'orders' })
    );

    act(() => {
      result.current.startStream();
      MockWebSocket.instances[0].onopen();
    });

    act(() => {
      MockWebSocket.instances[0].onmessage({
        data: 'invalid_json',
      });
    });

    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  test('calls subscribeToTopic with correct socket and topic', () => {
    const { result } = renderHook(() =>
      useWebSocket({ apiKey: 'test', maxItems: 5, topic: 'orders' })
    );

    act(() => {
      result.current.startStream();
      MockWebSocket.instances[0].onopen();
    });

    expect(subscribeToTopic).toHaveBeenCalledWith(MockWebSocket.instances[0], 'orders');
  });

  test('closes socket on unmount', () => {
    const { result, unmount } = renderHook(() =>
      useWebSocket({ apiKey: 'test', maxItems: 5, topic: 'orders' })
    );

    act(() => {
      result.current.startStream();
      MockWebSocket.instances[0].onopen();
    });

    unmount();
    expect(MockWebSocket.instances[0].close).toHaveBeenCalled();
  });
});
