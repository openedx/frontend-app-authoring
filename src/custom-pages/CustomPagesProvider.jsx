import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

export const CustomPagesContext = React.createContext({});

const CustomPagesProvider = ({ courseId, children }) => {
  const contextValue = useMemo(() => ({
    courseId,
    path: `/course/${courseId}/custom-pages`,
  }), []);
  return (
    <CustomPagesContext.Provider
      value={contextValue}
    >
      {children}
    </CustomPagesContext.Provider>
  );
};

CustomPagesProvider.propTypes = {
  courseId: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default CustomPagesProvider;
