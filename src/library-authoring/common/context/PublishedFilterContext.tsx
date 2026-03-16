import React from 'react';

interface PublishedFilterContextProps {
  showOnlyPublished?: boolean;
}

const Context = React.createContext<PublishedFilterContextProps | undefined>(undefined);

export const PublishedFilterContextProvider: React.FC<PublishedFilterContextProps & { children: React.ReactNode }> = ({
  showOnlyPublished,
  children,
}) => {
  const context = React.useMemo(() => ({ showOnlyPublished }), [showOnlyPublished]);

  return (
    <Context.Provider value={context}>
      {children}
    </Context.Provider>
  );
};

export const usePublishedFilterContext = (): PublishedFilterContextProps => {
  const ctx = React.useContext(Context);
  if (ctx === undefined) {
    /* istanbul ignore next */
    return {
      showOnlyPublished: false,
    };
  }
  return ctx;
};
