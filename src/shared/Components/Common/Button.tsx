import React from 'react';
import { cva } from 'class-variance-authority';

import { StatefulButton } from '@openedx/paragon';
import { cn } from '../../lib/utils';

interface ButtonProps {
  className?: string;
  name?: string;
  id?: string;
  type?: string;
  variant?: 'brand' | 'link' | 'secondary' | 'secondaryGray' | 'tertiary';
  state?: string;
  labels?: Record<string, React.ReactNode>;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  iconBefore?: React.FC;
  iconAfter?: React.FC;
  disabled?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const buttonVariants = cva(
  'tw-inline-flex tw-items-center tw-justify-center focus:before:tw-hidden focus:!tw-outline-none focus:!tw-ring-0 !tw-m-0',
  {
    variants: {
      size: {
        xs: 'tw-text-xs tw-font-medium tw-py-[3px] tw-px-[8px] tw-gap-1',
        sm: 'tw-text-sm tw-font-semibold tw-py-[6px] tw-px-[10px] tw-gap-1',
        md: 'tw-text-sm tw-font-semibold tw-py-[10px] tw-px-[14px] tw-gap-1',
        lg: 'tw-text-md tw-font-semibold tw-py-[10px] tw-px-4 tw-gap-[6px]',
      },
      variant: {
        brand: [
          'tw-w-full',
          'tw-rounded-[100px]',
          'tw-bg-brand-600',
          'tw-text-white',
          'tw-border-0',
          'tw-shadow-xs',
          // Normal state
          'tw-cursor-pointer',
          // Hover state
          'hover:enabled:tw-bg-brand-700',
          'hover:enabled:tw-shadow-lg',
          // Focus state
          'focus:enabled:tw-bg-brand-600',
          'focus:enabled:tw-shadow-[0px_0px_0px_2px_#ffffff,0px_0px_0px_4px_#875bf7]',
          // Disabled state
          'disabled:tw-bg-gray-100',
          'disabled:tw-text-gray-400',
          'disabled:tw-border-gray-200',
          'disabled:tw-border',
          'disabled:tw-cursor-not-allowed',
        ],
        secondaryGray: [
          'tw-w-full',
          'tw-rounded-[100px]',
          'tw-bg-white',
          'tw-text-gray-700',
          'tw-border-gray-300',
          'tw-border',
          'tw-shadow-xs',
          // Normal state
          'tw-cursor-pointer',
          // Hover state
          'hover:enabled:tw-bg-gray-50',
          'hover:enabled:tw-text-gray-800',
          'hover:enabled:tw-border-gray-300',
          // Focus state
          'focus:enabled:tw-bg-white',
          'focus:enabled:tw-text-gray-700',
          'focus:enabled:tw-border-gray-300',
          'focus:enabled:tw-shadow-[0px_0px_0px_2px_#ffffff,0px_0px_0px_4px_#875bf7]',
          // Disabled state
          'disabled:tw-bg-white',
          'disabled:tw-text-gray-400',
          'disabled:tw-border-gray-200',
          'disabled:tw-cursor-not-allowed',
        ],
        link: ['tw-text-center', 'tw-text-brand-700', 'hover:tw-text-brand-600'],
        secondary: [
          'tw-w-full',
          'tw-rounded-[100px]',
          'tw-bg-white',
          'tw-text-brand-700',
          'tw-border-violet-300',
          'tw-border',
          'tw-shadow-xs',
          // Normal state
          'tw-cursor-pointer',
          // Hover state
          'hover:enabled:tw-bg-violet-50',
          'hover:enabled:tw-text-brand-800',
          'hover:enabled:tw-border-violet-300',
          // Focus state
          'focus:enabled:tw-bg-white',
          'focus:enabled:tw-text-brand-700',
          'focus:enabled:tw-border-violet-300',
          'focus:enabled:tw-shadow-[0px_0px_0px_2px_#ffffff,0px_0px_0px_4px_#875bf7]',
          // Disabled state
          'disabled:tw-bg-white',
          'disabled:tw-text-gray-400',
          'disabled:tw-border-gray-200',
          'disabled:tw-cursor-not-allowed',
        ],
        tertiary: [
          'tw-py-[10px]',
          'tw-px-[16px]',
          'tw-w-full',
          'tw-rounded-[100px]',
          'tw-bg-white',
          'tw-border-gray-300',
          'focus:!tw-border-gray-300',
          'focus:!tw-border',
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
