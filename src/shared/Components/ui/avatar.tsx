import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';

import { cn } from 'shared/lib/utils';

const Avatar = ({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) => (
  <AvatarPrimitive.Root
    data-slot="avatar"
    className={cn(
      'tw-relative tw-flex tw-size-8 tw-shrink-0 tw-overflow-hidden tw-rounded-full',
      className,
    )}
    {...props}
  />
);

const AvatarImage = ({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) => (
  <AvatarPrimitive.Image
    data-slot="avatar-image"
    className={cn('tw-aspect-square tw-size-full', className)}
    {...props}
  />
);

const AvatarFallback = ({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) => (
  <AvatarPrimitive.Fallback
    data-slot="avatar-fallback"
    className={cn(
      'tw-bg-muted tw-flex tw-size-full tw-items-center tw-justify-center tw-rounded-full',
      className,
    )}
    {...props}
  />
);

export { Avatar, AvatarImage, AvatarFallback };
