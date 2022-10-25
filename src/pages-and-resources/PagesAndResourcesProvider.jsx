import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

export const PagesAndResourcesContext = React.createContext({});

const PagesAndResourcesProvider = ({ courseId, children }) => {
  const contextValue = useMemo(() => ({
    courseId,
    path: `/course/${courseId}/pages-and-resources`,
  }), []);
  return (
    <PagesAndResourcesContext.Provider
      value={contextValue}
    >
      {children}
    </PagesAndResourcesContext.Provider>
  );
};

PagesAndResourcesProvider.propTypes = {
  courseId: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default PagesAndResourcesProvider;
