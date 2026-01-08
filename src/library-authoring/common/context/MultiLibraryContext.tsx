import { useStickyState } from '@src/hooks';
import React from 'react';

interface MultiLibraryContextProps {
  selectedLibraries: string[];
  setSelectedLibraries: React.Dispatch<React.SetStateAction<string[]>>;
  selectedCollections: string[];
  setSelectedCollections: React.Dispatch<React.SetStateAction<string[]>>;
}

const Context = React.createContext<MultiLibraryContextProps | undefined>(undefined);

export const MultiLibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLibraries, setSelectedLibraries] = useStickyState<string[]>([], 'outline-library-filter');
  const [selectedCollections, setSelectedCollections] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (selectedLibraries.length !== 1) {
      setSelectedCollections([]);
    }
  }, [selectedLibraries, setSelectedCollections]);

  const context = React.useMemo(() => ({
    selectedLibraries,
    setSelectedLibraries,
    selectedCollections,
    setSelectedCollections,
  }), [
    selectedLibraries,
    setSelectedLibraries,
    selectedCollections,
    setSelectedCollections,
  ]);

  return (
    <Context.Provider value={context}>
      {children}
    </Context.Provider>
  );
};

export const useMultiLibraryContext = (): MultiLibraryContextProps => {
  const ctx = React.useContext(Context);
  if (ctx === undefined) {
    /* istanbul ignore next */
    return {
      selectedLibraries: [],
      setSelectedLibraries: () => {},
      selectedCollections: [],
      setSelectedCollections: () => {},
    };
  }
  return ctx;
};
