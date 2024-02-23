import React from 'react';
import PropTypes from 'prop-types';

export const DragContext = React.createContext({});

const DragContextProvider = ({ activeId, children }) => {
  const contextValue = React.useMemo(() => ({
    activeId
  }), [activeId]);
  return (
    <DragContext.Provider
      value={contextValue}
    >
      {children}
    </DragContext.Provider>
  );
};

DragContextProvider.defaultProps = {
  activeId: '',
}

DragContextProvider.propTypes = {
  activeId: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default DragContextProvider;
