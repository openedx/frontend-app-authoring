import React from 'react';
import PropTypes from 'prop-types';

export const DiscussionsContext = React.createContext({});

export default function DiscussionsProvider({ children, path }) {
  return (
    <DiscussionsContext.Provider
      value={{
        path,
      }}
    >
      {children}
    </DiscussionsContext.Provider>
  );
}

DiscussionsProvider.propTypes = {
  children: PropTypes.node.isRequired,
  path: PropTypes.string.isRequired,
};
