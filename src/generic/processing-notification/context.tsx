import { createContext, useContext, useState } from "react";

interface ProcessingNotificationContextData {
  show: boolean;
  setShow: (newValue: boolean) => void;
  message: string;
  setMessage: (newValue: string) => void;
}

const ProcessingNotificationContext = createContext<ProcessingNotificationContextData>({
  show: false,
  setShow: () => {},
  message: "",
  setMessage: () => {},
});

export const ProcessingNotificationContextProvider = ({ children }) => {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  return <ProcessingNotificationContext.Provider value={{
    show,
    setShow,
    message,
    setMessage,
  }}>
    {children}
  </ProcessingNotificationContext.Provider>
};

export function useProcessingNotification() {
  return useContext(ProcessingNotificationContext);
};
