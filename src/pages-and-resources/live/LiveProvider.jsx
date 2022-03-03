import React from 'react';
import PropTypes from 'prop-types';

export const LiveContext = React.createContext({});

export default function LiveProvider({ children, path }) {
  return (
    <LiveContext.Provider
      value={{
        path,
      }}
    >
      {children}
    </LiveContext.Provider>
  );
}

LiveProvider.propTypes = {
  children: PropTypes.node.isRequired,
  path: PropTypes.string.isRequired,
};
