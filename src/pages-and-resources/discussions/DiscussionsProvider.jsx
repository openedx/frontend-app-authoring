import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

export const DiscussionsContext = React.createContext({});

const DiscussionsProvider = ({ children, path }) => {
  const contextValue = useMemo(() => ({ path }), []);
  return (
    <DiscussionsContext.Provider
      value={contextValue}
    >
      {children}
    </DiscussionsContext.Provider>
  );
};

DiscussionsProvider.propTypes = {
  children: PropTypes.node.isRequired,
  path: PropTypes.string.isRequired,
};

export default DiscussionsProvider;
