import React from 'react';
import { Button as ParagonButton } from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';

import { getButtonProps } from './hooks';
import './index.scss';

interface Props extends Omit<React.ComponentProps<typeof ParagonButton>, 'variant' | 'className'> {
  /** `add` is this component's own variant (tertiary + Add icon); anything else goes to Paragon as-is. */
  variant?: string;
  className?: string | null;
  text?: string | null;
}

const Button = ({
  variant = 'default',
  className = null,
  text = null,
  children = null,
  ...props
}: Props) => (
  <ParagonButton
    {...getButtonProps({ variant, className, Add })}
    {...props}
  >
    {children || text}
  </ParagonButton>
);

export default Button;
