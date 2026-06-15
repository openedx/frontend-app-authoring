import { useState, useCallback } from 'react';

/**
 * Generic modal state hook — manages open/close + optional typed data.
 *
 * @example
 *   const { isOpen, open, close, data } = useModalState<OutlineActionSelection>();
 *   open(someSelection);     // sets data + isOpen = true
 *   close();                 // clears data + isOpen = false
 *   data                     // the selection (or undefined when closed)
 */
export function useModalState<T>() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | undefined>();

  const open = useCallback((d: T) => {
    setData(d);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setData(undefined);
    setIsOpen(false);
  }, []);

  return { isOpen, open, close, data };
}
