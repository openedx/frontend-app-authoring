// @ts-check
import React, { useState } from 'react';

import {
  Button,
  Spinner,
  Stack,
} from '@edx/paragon';

const LoadingButton = ({
  onClick,
  children,
  disabled,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const loadingOnClick = async (e) => {
    if (!onClick) {
      return;
    }

    setIsLoading(true);
    try {
      await onClick(e);
    } finally {
      setIsLoading(false);
    }
  };

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
  disabled: null,
};

export default LoadingButton;
