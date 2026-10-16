import React from 'react';
import { Button as ParagonButton } from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';

import { getButtonProps } from './hooks';
import './index.scss';

type ParagonButtonProps = React.ComponentProps<typeof ParagonButton>;

interface Props extends Omit<ParagonButtonProps, 'variant' | 'className' | 'children'> {
  variant?: string;
  className?: string | null;
  text?: string | null;
  children?: React.ReactNode;
}

const Button: React.FC<Props> = ({
  variant = 'default',
  className = null,
  text = null,
  children = null,
  ...props
}) => (
  <ParagonButton
    {...getButtonProps({ variant, className, Add })}
    {...props}
  >
    {children || text}
  </ParagonButton>
);

export default Button;
