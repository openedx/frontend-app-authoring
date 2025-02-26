// @ts-check
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  StatefulButton,
} from '@openedx/paragon';
import PropTypes from 'prop-types';

/**
  * A button that shows a loading spinner when clicked.
  * @param {object} props
  * @param {string} props.label
  * @param {function=} props.onClick
  * @param {boolean=} props.disabled
  * @param {string=} props.size
  * @param {string=} props.variant
  * @param {string=} props.className
  * @returns {JSX.Element}
  */
const LoadingButton = ({
  label,
  onClick,
  disabled,
  size,
  variant,
  className,
}) => {
  const [state, setState] = useState('');
  // This is used to prevent setting the isLoading state after the component has been unmounted.
  const componentMounted = useRef(true);

  useEffect(() => () => {
    componentMounted.current = false;
  }, []);

  const loadingOnClick = useCallback(async (e) => {
    if (!onClick) {
      return;
    }

    setState('pending');
    try {
      await onClick(e);
    } catch (err) {
      // Do nothing
    } finally {
      if (componentMounted.current) {
        setState('');
      }
    }
  }, [componentMounted, onClick]);

  return (
    <StatefulButton
      disabledStates={disabled ? [state] : ['pending'] /* StatefulButton doesn't support disabled prop */}
      onClick={loadingOnClick}
      labels={{ default: label }}
      state={state}
      size={size}
      variant={variant}
      className={className}
    />
  );
};

LoadingButton.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  size: PropTypes.string,
  variant: PropTypes.string,
  className: PropTypes.string,
};

LoadingButton.defaultProps = {
  onClick: undefined,
  disabled: undefined,
  size: undefined,
  variant: '',
  className: '',
};

export default LoadingButton;
