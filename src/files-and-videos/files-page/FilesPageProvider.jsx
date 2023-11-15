import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

export const FilesPageContext = React.createContext({});

const FilesPageProvider = ({ courseId, children }) => {
  const contextValue = useMemo(() => ({
    courseId,
    path: `/course/${courseId}/assets`,
  }), []);
  return (
    <FilesPageContext.Provider
      value={contextValue}
    >
      {children}
    </FilesPageContext.Provider>
  );
};

FilesPageProvider.propTypes = {
  courseId: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default FilesPageProvider;
