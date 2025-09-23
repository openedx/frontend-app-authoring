import React, { useCallback, useMemo, useState } from 'react';
import { createContext } from 'utils/context';

interface CanvasContextValue {
  isOpen: boolean;
  closeCanvas: () => void;
  openCanvas: () => void;
}

export const [useCanvasContext, CanvasContext] = createContext<CanvasContextValue>();

export default function CanvasContextProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const closeCanvas = useCallback(() => {
    setIsOpen(false);
  }, []);

  const openCanvas = useCallback(() => {
    setIsOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      closeCanvas,
      openCanvas,
    }),
    [isOpen, closeCanvas, openCanvas],
  );

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
}
