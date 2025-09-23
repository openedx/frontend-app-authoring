import React, { useCallback, useMemo, useState } from 'react';
import { CanvasContent } from 'types/canvas';
import { createContext } from 'utils/context';

interface CanvasContextValue {
  isOpen: boolean;
  content: CanvasContent | null;
  closeCanvas: () => void;
  openCanvas: (newContent: CanvasContent) => void;
}

export const [useCanvasContext, CanvasContext] = createContext<CanvasContextValue>();

export default function CanvasContextProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<CanvasContent | null>(null);

  const isOpen = !!content;

  const closeCanvas = useCallback(() => {
    setContent(null);
  }, []);

  const openCanvas = useCallback((newContent: CanvasContent) => {
    setContent(newContent);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      content,
      closeCanvas,
      openCanvas,
    }),
    [isOpen, closeCanvas, openCanvas],
  );

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
}
