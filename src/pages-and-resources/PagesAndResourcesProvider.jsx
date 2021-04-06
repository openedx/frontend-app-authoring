import React from 'react';
import PropTypes from 'prop-types';

export const PagesAndResourcesContext = React.createContext({});

export default function PagesAndResourcesProvider({ courseId, children }) {
  return (
    <PagesAndResourcesContext.Provider
      value={{
        path: `/course/${courseId}/pages-and-resources`,
      }}
    >
      {children}
    </PagesAndResourcesContext.Provider>
  );
}

PagesAndResourcesProvider.propTypes = {
  courseId: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
