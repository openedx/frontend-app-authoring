import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  StatefulButton,
} from '@openedx/paragon';

interface LoadingButtonProps {
  label: string;
  onClick?: (e: any) => (Promise<void> | void);
  disabled?: boolean;
  size?: string;
  variant?: string;
  className?: string;
}

/**
  * A button that shows a loading spinner when clicked, if the onClick function returns a Promise.
  */
const LoadingButton: React.FC<LoadingButtonProps> = ({
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

  const loadingOnClick = useCallback(async (e: any) => {
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

export default LoadingButton;
