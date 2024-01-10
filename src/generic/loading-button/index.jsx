// @ts-check
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Button,
  Spinner,
  Stack,
} from '@edx/paragon';

/**
  * A button that shows a loading spinner when clicked.
  * @param {object} props
  * @param {React.ReactNode=} props.children
  * @param {boolean=} props.disabled
  * @param {function=} props.onClick
  * @returns {JSX.Element}
  */
const LoadingButton = ({
  onClick,
  children,
  disabled,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);
  // This is used to prevent setting the isLoading state after the component has been unmounted.
  const componentMounted = useRef(true);

  useEffect(() => () => {
    componentMounted.current = false;
  }, []);

  const loadingOnClick = useCallback(async (e) => {
    if (!onClick) {
      return;
    }

    setIsLoading(true);
    try {
      await onClick(e);
    } finally {
      if (componentMounted.current) {
        setIsLoading(false);
      }
    }
  }, [componentMounted, onClick]);

  return (
    <Button
      {...props}
      disabled={!!isLoading || disabled}
      onClick={loadingOnClick}
    >
      <Stack gap={2} direction="horizontal">
        {children}
        {isLoading && <Spinner size="sm" animation="border" data-testid="button-loading-spinner" />}
      </Stack>
    </Button>
  );
};

LoadingButton.propTypes = {
  ...Button.propTypes,
};

LoadingButton.defaultProps = {
  ...Button.defaultProps,
};

export default LoadingButton;
