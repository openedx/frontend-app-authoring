import React from 'react';
import { Button as ParagonButton } from '@openedx/paragon';

import { getButtonProps } from './hooks';
import './index.scss';

interface Props extends React.ComponentProps<typeof ParagonButton> {
  text?: string;
}

export const Button = ({
  variant = 'default', className, text, children, ...props
}: Props) => (
  <ParagonButton
    {...getButtonProps({ variant, className })}
    {...props}
  >
    {children || text}
  </ParagonButton>
);

export default Button;
