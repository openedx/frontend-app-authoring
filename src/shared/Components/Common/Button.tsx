import React from 'react';
import { cva } from 'class-variance-authority';

import { StatefulButton } from '@openedx/paragon';
import { cn } from '../../lib/utils';

interface ButtonProps {
  className?: string;
  name?: string;
  id?: string;
  type?: string;
  variant?: 'brand' | 'link' | 'secondary';
  state?: string;
  labels?: Record<string, React.ReactNode>;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  iconBefore?: React.FC;
  iconAfter?: React.FC;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const buttonVariants = cva(
  'tw-font-semibold focus:before:tw-hidden focus:!tw-outline-none focus:!tw-ring-0 focus:!tw-border-0',
  {
    variants: {
      size: {
        sm: 'tw-text-[14px]',
        md: 'tw-text-[16px]',
        lg: 'tw-text-[18px]',
      },
      variant: {
        brand: [
          'login-button-width',
          'tw-py-[10px]',
          'tw-px-[16px]',
          'tw-w-full',
          'tw-rounded-[100px]',
          'tw-bg-brand-600',
          'hover:tw-bg-brand-700',
          'active:!tw-bg-brand-700',
          'tw-border-0',
        ],
        link: ['tw-text-center', 'tw-text-brand-700', 'hover:tw-text-brand-600'],
        secondary: [
          'tw-py-[10px]',
          'tw-px-[16px]',
          'tw-w-full',
          'tw-rounded-[100px]',
          'tw-bg-white',
          'tw-text-brand-600',
          'tw-border-brand-600',
          'tw-border-1',
          'hover:tw-bg-brand-600',
          'active:!tw-bg-brand-700',
        ],
      },
    },
    defaultVariants: {
      variant: 'brand',
      size: 'md',
    },
  },
);

const Button = ({
  className,
  variant,
  size,
  ...restProps
}: ButtonProps) => (
  <StatefulButton
    {...restProps}
    variant={variant}
    size={size}
    className={cn(buttonVariants({ variant, size }), className)}
  />
);

export default Button;
