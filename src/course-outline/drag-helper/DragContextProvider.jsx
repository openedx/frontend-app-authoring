import React from 'react';
import PropTypes from 'prop-types';

export const DragContext = React.createContext({ activeId: '', overId: '', children: undefined });

const DragContextProvider = ({ activeId, overId, children }) => {
  const contextValue = React.useMemo(() => ({
    activeId,
    overId,
  }), [activeId, overId]);
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
  overId: '',
};

DragContextProvider.propTypes = {
  activeId: PropTypes.string,
  overId: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default DragContextProvider;
