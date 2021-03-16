import React, { useState } from 'react';
import PropTypes from 'prop-types';

export const StepperContext = React.createContext({
  isAtTop: true,
  isAtBottom: false,
});

export function StepperContextProvider({ children }) {
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);
  return (
    <StepperContext.Provider
      value={{
        isAtTop,
        isAtBottom,
        setIsAtTop,
        setIsAtBottom,
      }}
    >
      {children}
    </StepperContext.Provider>
  );
}

StepperContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
