import { useEffect, useRef, MutableRefObject } from 'react';

export function useEventListener<K extends keyof WindowEventMap>(
  type: K,
  handler: (event: WindowEventMap[K]) => void,
) {
  // We use this ref so that we can hold a reference to the currently active event listener.
  const eventListenerRef = useRef<(event: WindowEventMap[K]) => void | null>(null);

  useEffect(() => {
    // If we currently have an event listener, remove it.
    if (eventListenerRef.current !== null) {
      global.removeEventListener(type, eventListenerRef.current);
    }
    // Now add our new handler as the event listener.
    global.addEventListener(type, handler);
    // And then save it to our ref for next time.
    (eventListenerRef as MutableRefObject<(event: WindowEventMap[K]) => void>).current = handler;
    // When the component finally unmounts, use the ref to remove the correct handler.
    return () => {
      if (eventListenerRef.current !== null) {
        global.removeEventListener(type, eventListenerRef.current);
      }
    };
  }, [type, handler]);
}
