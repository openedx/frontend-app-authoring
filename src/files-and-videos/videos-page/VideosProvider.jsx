import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

export const VideosContext = React.createContext({});

const VideosProvider = ({ courseId, children }) => {
  const contextValue = useMemo(() => ({
    courseId,
    path: `/course/${courseId}/videos`,
  }), []);
  return (
    <VideosContext.Provider
      value={contextValue}
    >
      {children}
    </VideosContext.Provider>
  );
};

VideosProvider.propTypes = {
  courseId: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default VideosProvider;
