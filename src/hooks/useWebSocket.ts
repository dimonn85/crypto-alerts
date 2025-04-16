import { useEffect, useRef, useState, useCallback } from 'react';
import { createWebSocketConnection, subscribeToTopic } from '../services/websocket';
import { OrderMessage } from "../types/orders-types.ts";

interface UseWebSocketParams {
  apiKey: string;
  maxItems: number;
  topic: string;
}

export const useWebSocket = ({ apiKey, maxItems, topic }: UseWebSocketParams) => {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [orders, setOrders] = useState<OrderMessage[]>([]);

  const startStream = useCallback(() => {
    socketRef.current = createWebSocketConnection(apiKey);

    socketRef.current.onopen = () => {
      setIsConnected(true);
      subscribeToTopic(socketRef.current!, topic);
    };

    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as OrderMessage;

        if (data.TYPE === '8' && data.Q > 0 && data.P > 0) {
          setOrders(prev => [data, ...prev].slice(0, maxItems));
        }
      } catch (err) {
        console.error('Error parsing WebSocket message', err);
      }
    };

    socketRef.current.onclose = () => setIsConnected(false);
    socketRef.current.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
  }, [apiKey, maxItems, topic]);

  const stopStream = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  return { isConnected, orders, startStream, stopStream };
};
