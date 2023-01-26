import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

export const AppConfigFormContext = React.createContext({});

const AppConfigFormProvider = ({ children }) => {
  const formRef = React.createRef();
  const contextValue = useMemo(() => ({ formRef }), []);

  return (
    <AppConfigFormContext.Provider
      value={contextValue}
    >
      {children}
    </AppConfigFormContext.Provider>
  );
};

AppConfigFormProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppConfigFormProvider;
