import React from 'react';

interface MultiLibraryContextProps {
  selectedLibraries: string[];
  setSelectedLibraries: React.Dispatch<React.SetStateAction<string[]>>;
}

const Context = React.createContext<MultiLibraryContextProps | undefined>(undefined);

export const MultiLibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLibraries, setSelectedLibraries] = React.useState<string[]>([]);
  const context = React.useMemo(() => {
    return { selectedLibraries, setSelectedLibraries };
  }, [selectedLibraries, setSelectedLibraries]);

  return (
    <Context.Provider value={context}>
      {children}
    </Context.Provider>
  );
};

export const useMultiLibraryContext = (): MultiLibraryContextProps => {
  const ctx = React.useContext(Context)
  if (ctx === undefined) {
    /* istanbul ignore next */
    return {
      selectedLibraries: [],
      setSelectedLibraries: () => {},
    }
  }
  return ctx;
};
