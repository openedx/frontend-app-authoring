import React from 'react';
import { cn } from 'shared/lib/utils';
import { GenerationStatus } from 'types/course';

const DimmedLayout = ({ children, generationStatus }:
{ children: React.ReactNode, generationStatus: GenerationStatus }) => {
  return generationStatus ? (
    <div className={cn(
      "tw-relative before:tw-content-[''] before:tw-absolute before:tw-inset-0 before:tw-bg-white before:tw-rounded-2xl before:tw-border before:tw-border-solid before:tw-transition-opacity before:tw-duration-1000",
      'before:tw-border-white before:tw-pointer-events-none before:tw-z-[2000]',
      generationStatus === GenerationStatus.CREATING ? 'before:tw-opacity-60' : 'before:tw-opacity-0',
    )}
    >
      {children}
    </div>
  ) : (children);
};

export default DimmedLayout;
