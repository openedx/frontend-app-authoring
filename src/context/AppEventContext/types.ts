import { CanvasContent } from 'types/canvas';

export enum SocketEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  OPEN_CANVAS = 'open_canvas',
}

export interface ServerToClientEventPayloadMap {
  [SocketEvent.CONNECT]: undefined;
  [SocketEvent.DISCONNECT]: undefined;
  [SocketEvent.OPEN_CANVAS]: CanvasContent;
}

type SocketEventHandler = (data: Record<string, unknown>) => void;

export type ServerToClientEvents = {
  [E in SocketEvent]: SocketEventHandler;
};

export type ClientToServerEvents = {
  // No client-to-server events in this case, but needed for Socket typing
  __dummy: never; // This property will never be used, just to satisfy the linter
};

export type NotificationCallback<E extends SocketEvent> = (
  notification: ServerToClientEventPayloadMap[E],
) => void;

export type RegisterCallback<E extends SocketEvent> = (
  callback: NotificationCallback<E>,
) => () => void;

export type EventHandlerConfig<E extends SocketEvent> = {
  registry?: Set<NotificationCallback<E>>;
  handler?: (payload: ServerToClientEventPayloadMap[E]) => void;
};
