import React, { useContext } from 'react';
import PropTypes from 'prop-types';

const callAllHandlers = (...handlers) => {
  const unifiedEventHandler = (event) => {
    handlers
      .filter(handler => typeof handler === 'function')
      .forEach(handler => handler(event));
  };
  return unifiedEventHandler;
};

const identityFn = props => props;

const FormRadioSetContext = React.createContext({
  getRadioControlProps: identityFn,
  hasRadioSetProvider: false,
});

const useRadioSetContext = () => useContext(FormRadioSetContext);

const FormRadioSetContextProvider = ({
  children,
  name,
  onBlur,
  onFocus,
  onChange,
  value,
  defaultValue,
}) => {
  const isControlled = !defaultValue && value !== undefined;
  const getRadioControlProps = (radioProps) => ({
    ...radioProps,
    name,
    /* istanbul ignore next */
    onBlur: radioProps.onBlur ? callAllHandlers(onBlur, radioProps.onBlur) : onBlur,
    /* istanbul ignore next */
    onFocus: radioProps.onFocus ? callAllHandlers(onFocus, radioProps.onFocus) : onFocus,
    /* istanbul ignore next */
    onChange: radioProps.onChange ? callAllHandlers(onChange, radioProps.onChange) : onChange,
    checked: isControlled ? value === radioProps.value : undefined,
    defaultChecked: isControlled ? undefined : defaultValue === radioProps.value,
  });
  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const contextValue = {
    name,
    value,
    defaultValue,
    getRadioControlProps,
    onBlur,
    onFocus,
    onChange,
    hasRadioSetProvider: true,
  };
  return (
    <FormRadioSetContext.Provider value={contextValue}>
      {children}
    </FormRadioSetContext.Provider>
  );
};

FormRadioSetContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
  name: PropTypes.string.isRequired,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  onChange: PropTypes.func,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
};

FormRadioSetContextProvider.defaultProps = {
  onBlur: undefined,
  onFocus: undefined,
  onChange: undefined,
  value: undefined,
  defaultValue: undefined,
};

export default FormRadioSetContext;
export {
  useRadioSetContext,
  FormRadioSetContextProvider,
};
