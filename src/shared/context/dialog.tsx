import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';

type DialogContextType = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const contextValue = useMemo(
    () => (
      { isOpen, open: handleOpen, close: handleClose }),
    [handleOpen, handleClose, isOpen],
  );

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) { throw new Error('useDialog must be used within DialogProvider'); }
  return context;
}
