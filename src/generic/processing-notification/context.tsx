import {
  createContext, useContext, useMemo, useState,
} from 'react';

interface ProcessingNotificationContextData {
  show: boolean;
  setShow: (newValue: boolean) => void;
  message: string;
  setMessage: (newValue: string) => void;
}

const ProcessingNotificationContext = createContext<ProcessingNotificationContextData>({
  show: false,
  setShow: () => {},
  message: '',
  setMessage: () => {},
});

export const ProcessingNotificationContextProvider = ({ children }: { children?: React.ReactNode }) => {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const values = useMemo(() => ({
    show,
    setShow,
    message,
    setMessage,
  }), [
    show,
    setShow,
    message,
    setMessage,
  ]);
  return (
    <ProcessingNotificationContext.Provider value={values}>
      {children}
    </ProcessingNotificationContext.Provider>
  );
};

export function useProcessingNotification() {
  return useContext(ProcessingNotificationContext);
}
