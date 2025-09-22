import React from 'react';
import classNames from 'classnames';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'default';
  className?: string;
}

const Badge = ({ children, variant = 'default', className }: BadgeProps) => (
  <div
    className={classNames(
      'tw-py-[2px] tw-pl-[6px] tw-pr-[8px] tw-rounded-2xl tw-border tw-flex tw-items-center tw-gap-1 tw-border-solid',
      {
        'tw-bg-green-50 tw-border-green-200': variant === 'success',
        'tw-bg-[#FFFAEB] tw-border-[#FEDF89]': variant === 'warning',
        'tw-bg-gray-50 tw-border-gray-200': variant === 'default',
      },
      className,
    )}
  >
    <div
      className={classNames('tw-w-[6px] tw-h-[6px] tw-rounded-full', {
        'tw-bg-green-500': variant === 'success',
        'tw-bg-[#F79009]': variant === 'warning',
        'tw-bg-gray-400': variant === 'default',
      })}
    />
    <span
      className={classNames('tw-text-xs tw-font-medium', {
        'tw-text-green-700': variant === 'success',
        'tw-text-[#B54708]': variant === 'warning',
        'tw-text-gray-600': variant === 'default',
      })}
    >
      {children}
    </span>
  </div>
);

export default Badge;
