import React from 'react';

/**
 * A helper to create a Context and Provider with no upfront default value, and
 * without having to check for undefined all the time.
 */
export function createContext<A>() {
  const Context = React.createContext<A | undefined>(undefined);

  function useContext() {
    const contextValue = React.useContext(Context);

    if (contextValue === undefined || contextValue === null) {
      throw new Error('useContext must be inside a Provider with a value');
    }

    return contextValue;
  }

  return [useContext, Context] as const;
}
