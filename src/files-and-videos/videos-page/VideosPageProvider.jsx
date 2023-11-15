import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

export const VideosPageContext = React.createContext({});

const VideosPageProvider = ({ courseId, children }) => {
  const contextValue = useMemo(() => ({
    courseId,
    path: `/course/${courseId}/videos`,
  }), []);
  return (
    <VideosPageContext.Provider
      value={contextValue}
    >
      {children}
    </VideosPageContext.Provider>
  );
};

VideosPageProvider.propTypes = {
  courseId: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default VideosPageProvider;
