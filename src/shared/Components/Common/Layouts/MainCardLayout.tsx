import { cn } from 'shared/lib/utils';
import React from 'react';
import background from '@/assets/images/main-content-background.png';

export const MainCardLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="tw-relative tw-flex-1 tw-overflow-hidden tw-rounded-[20px] tw-shadow-[0px_2px_4px_-2px_#1018280F,0px_4px_8px_-2px_#1018281A] tw-h-full">
    {/* Background overlay with 50% opacity */}
    <div
      className="tw-absolute tw-inset-0 tw-opacity-30 tw-z-0 tw-scale-x-[-1] "
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    />
    <main
      className={cn(
        'tw-relative tw-z-10 tw-h-full',
        'tw-p-8 tw-pb-0 tw-flex-1',
        'tw-border tw-border-white tw-border-solid',
        'tw-rounded-[20px]',
        'tw-flex tw-flex-col tw-gap-8',
      )}
    >
      {children}
    </main>
  </div>
);
