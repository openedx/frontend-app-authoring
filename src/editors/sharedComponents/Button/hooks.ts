import React from 'react';
import { Add } from '@openedx/paragon/icons';
import { Button as ParagonButton } from '@openedx/paragon';

type ButtonProps = React.ComponentProps<typeof ParagonButton>;

export const getButtonProps = ({ variant, className }: { variant: string, className?: string }) => {
  const variantClasses = {
    default: 'shared-button',
    add: 'shared-button pl-0 text-primary-500 button-variant-add',
  };
  const variantMap = {
    add: 'tertiary',
  };
  const classes = [variantClasses[variant]];
  if (className) { classes.push(className); }

  const iconProps: Partial<ButtonProps> = {};
  if (variant === 'add') { iconProps.iconBefore = Add; }

  return {
    className: classes.join(' '),
    variant: variantMap[variant] || variant,
    ...iconProps,
  };
};
