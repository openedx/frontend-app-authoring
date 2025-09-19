import { EventHandlerConfig, ServerToClientEventPayloadMap, SocketEvent } from './types';

export const handleSocketEvent = <E extends SocketEvent>(
  event: E,
  data: Record<string, unknown>,
  config: EventHandlerConfig<E>,
) => {
  // Convert data to camel case
  const payload = (data || {}) as unknown as ServerToClientEventPayloadMap[E];

  if (config.handler) {
    config.handler(payload);
  }

  if (config.registry?.size) {
    config.registry.forEach((callback) => {
      callback(payload);
    });
  }

  return payload;
};
