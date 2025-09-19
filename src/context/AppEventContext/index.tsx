import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { createContext } from 'utils/context';

import {
  ClientToServerEvents,
  EventHandlerConfig,
  NotificationCallback,
  ServerToClientEvents,
  SocketEvent,
} from './types';
import { handleSocketEvent } from './utils';

interface AppEventContextValue {
  isConnected: boolean;
  registerEventCallback: <E extends SocketEvent>(
    event: E,
    callback: NotificationCallback<E>,
  ) => () => void;
}

export const [useAppEventContext, AppEventContext] = createContext<AppEventContextValue>();
export const AppEvent = SocketEvent;

// TODO: use real url and token
const socketUrl = 'http://localhost:8081';
const token = '123';

const createEmptyRegistryMap = () => {
  return Object.values(SocketEvent).reduce(
    (acc, event) => ({
      ...acc,
      [event]: new Set(),
    }),
    {} as { [K in SocketEvent]: Set<NotificationCallback<K>> },
  );
};

export default function AppEventContextProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  const eventCallbacksRef = useRef(createEmptyRegistryMap());

  const registerEventCallback = useCallback(
    <E extends SocketEvent>(event: E, callback: NotificationCallback<E>) => {
      eventCallbacksRef.current[event].add(callback);

      return () => {
        eventCallbacksRef.current[event].delete(callback);
      };
    },
    [],
  );

  // Create event handler configuration map - all socket events and their handlers in one place
  const eventHandlers = useMemo(() => {
    const handlers: {
      [E in SocketEvent]?: EventHandlerConfig<E>;
    } = {
      [SocketEvent.CONNECT]: {
        handler: () => {
          setIsConnected(true);
        },
      },
      [SocketEvent.DISCONNECT]: {
        handler: () => {
          setIsConnected(false);
        },
      },
      [SocketEvent.OPEN_CANVAS]: {
        handler: (data) => {
          console.log('received data', data);
        },
      },
      [SocketEvent.UPDATE_CANVAS]: {
        handler: (data) => {
          console.log('received update data', data);
        },
      },
    };
    return handlers;
  }, []);

  useEffect(() => {
    const initSocket = async () => {
      socketRef.current = io(socketUrl, {
        auth: {
          token,
        },
      }) as Socket<ServerToClientEvents, ClientToServerEvents>;

      // Register all event handlers defined in the eventHandlers map
      Object.entries(eventHandlers).forEach(([event, config]) => {
        if (config) {
          socketRef.current?.on(event as SocketEvent, (data: Record<string, unknown>) => {
            // Type assertion needed because TypeScript can't infer the type correctly in this context
            const typedEvent = event as SocketEvent;
            const typedConfig = config as EventHandlerConfig<typeof typedEvent>;

            handleSocketEvent(typedEvent, data, typedConfig);
          });
        }
      });
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        Object.keys(eventHandlers).forEach((event) => {
          socketRef.current?.off(event as SocketEvent);
        });
        socketRef.current.disconnect();
      }
    };
  }, [eventHandlers]);

  const value = useMemo(
    () => ({
      isConnected,
      registerEventCallback,
    }),
    [isConnected, registerEventCallback],
  );

  return <AppEventContext.Provider value={value}>{children}</AppEventContext.Provider>;
}
