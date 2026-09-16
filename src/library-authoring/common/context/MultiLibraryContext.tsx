import { useStickyState } from '@src/hooks';
import { ContentLibrary } from '@src/library-authoring/data/api';
import React, { useRef } from 'react';

interface MultiLibraryContextProps {
  selectedLibraries: string[];
  setSelectedLibraries: React.Dispatch<React.SetStateAction<string[]>>;
  selectedCollections: string[];
  setSelectedCollections: React.Dispatch<React.SetStateAction<string[]>>;
  allLibraries: React.MutableRefObject<ContentLibrary[]>;
}

const Context = React.createContext<MultiLibraryContextProps | undefined>(undefined);

export const MultiLibraryProvider: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
  const [selectedLibraries, setSelectedLibraries] = useStickyState<string[]>([], 'outline-library-filter');
  const [selectedCollections, setSelectedCollections] = React.useState<string[]>([]);
  const allLibraries = useRef<ContentLibrary[]>([]);

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
    allLibraries,
  }), [
    selectedLibraries,
    setSelectedLibraries,
    selectedCollections,
    setSelectedCollections,
    allLibraries,
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
      allLibraries: { current: [] },
    };
  }
  return ctx;
};
