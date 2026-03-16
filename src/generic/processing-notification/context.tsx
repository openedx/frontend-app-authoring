import { createContext, useContext, useState } from "react";

interface ProcessingNotificationContextData {
  show: boolean;
  setShow: (newValue: boolean) => void;
}

const ProcessingNotificationContext = createContext<ProcessingNotificationContextData>({
  show: false,
  setShow: () => {},
});

export const ProcessingNotificationContextProvider = ({ children }) => {
  const [show, setShow] = useState(false);
  return <ProcessingNotificationContext.Provider value={{ show, setShow }}>
    {children}
  </ProcessingNotificationContext.Provider>
};

export function useProcessingNotification() {
  return useContext(ProcessingNotificationContext);
};
