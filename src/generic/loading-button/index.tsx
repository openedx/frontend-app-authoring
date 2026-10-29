import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  StatefulButton,
} from '@openedx/paragon';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  onClick?: (e: any) => Promise<void> | void;
  size?: string;
  variant?: string;
  isLoading?: boolean;
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
  isLoading,
  ...props
}) => {
  // Button state depends on isLoading and disabled flags
  const getState = () => {
    if (isLoading) { return 'pending'; }
    if (disabled) { return 'disabled'; }
    return '';
  };
  const [state, setState] = useState(getState);

  useEffect(() => {
    setState(getState);
  }, [isLoading, disabled]);

  const componentMounted = useRef(true);

  // Guards against setting state after unmount. The body sets the ref too, since StrictMode runs the cleanup once at
  // mount in development.
  useEffect(() => {
    componentMounted.current = true;
    return () => {
      componentMounted.current = false;
    };
  }, []);

  const loadingOnClick = useCallback(async (e: any) => {
    if (disabled) {
      return;
    }

    if (!onClick) {
      return;
    }

    setState('pending');
    try {
      await onClick(e);
    } catch {
      // Do nothing
    } finally {
      if (componentMounted.current) {
        setState('');
      }
    }
  }, [componentMounted, onClick]);

  return (
    <StatefulButton
      disabledStates={['disabled', 'pending'] /* StatefulButton doesn't support disabled prop */}
      onClick={loadingOnClick}
      labels={{ default: label }}
      state={state}
      size={size}
      variant={variant}
      {...props}
    />
  );
};

export default LoadingButton;
