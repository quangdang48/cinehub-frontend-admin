'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface SSENotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'connected';
  title?: string;
  message?: string;
  content?: string;
  timestamp: string;
  read?: boolean;
  metadata?: Record<string, unknown>;
}

interface UseSSEOptions {
  url: string;
  autoConnect?: boolean;
  onNotification?: (notification: SSENotification) => void;
  onConnect?: (clientId: string) => void;
  onError?: (error: Event) => void;
}

export interface UseSSEReturn {
  isConnected: boolean;
  clientId: string | null;
  notifications: SSENotification[];
  unreadCount: number;
  connect: () => void;
  disconnect: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export function useSSE(options: UseSSEOptions): UseSSEReturn {
  const {
    url,
    autoConnect = true,
    onNotification,
    onConnect,
    onError,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<SSENotification[]>([]);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const shouldReconnectRef = useRef(true);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
    setClientId(null);
  }, []);

  const connect = useCallback(() => {
    shouldReconnectRef.current = true;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    try {
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as SSENotification;

          if (data.type === 'connected') {
            setClientId(data.id || null);
            onConnect?.(data.id || '');
          } else {
            const notification: SSENotification = {
              ...data,
              id: data.id || `notif-${Date.now()}`,
              timestamp: data.timestamp || new Date().toISOString(),
              read: false,
            };

            setNotifications((prev) => [notification, ...prev].slice(0, 50)); // Keep last 50
            onNotification?.(notification);
          }
        } catch (error) {
          console.error('Failed to parse SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        setIsConnected(false);
        onError?.(error);

        // Store reference for comparison
        const currentEventSource = eventSource;

        // Auto reconnect after 5 seconds
        if (shouldReconnectRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (
              eventSourceRef.current === currentEventSource &&
              shouldReconnectRef.current
            ) {
              // Create new connection
              eventSourceRef.current = null;
              const newUrl = url;
              try {
                const newEventSource = new EventSource(newUrl);
                eventSourceRef.current = newEventSource;

                newEventSource.onopen = () => setIsConnected(true);
                newEventSource.onmessage = eventSource.onmessage;
                newEventSource.onerror = eventSource.onerror;
              } catch (err) {
                console.error('Failed to reconnect:', err);
              }
            }
          }, 5000);
        }
      };
    } catch (error) {
      console.error('Failed to create EventSource:', error);
      setIsConnected(false);
    }
  }, [url, onConnect, onError, onNotification]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    clientId,
    notifications,
    unreadCount,
    connect,
    disconnect,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
}
