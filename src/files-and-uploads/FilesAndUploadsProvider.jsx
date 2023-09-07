import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

export const FilesAndUploadsContext = React.createContext({});

const FilesAndUploadsProvider = ({ courseId, children }) => {
  const contextValue = useMemo(() => ({
    courseId,
    path: `/course/${courseId}/assets`,
  }), []);
  return (
    <FilesAndUploadsContext.Provider
      value={contextValue}
    >
      {children}
    </FilesAndUploadsContext.Provider>
  );
};

FilesAndUploadsProvider.propTypes = {
  courseId: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default FilesAndUploadsProvider;
