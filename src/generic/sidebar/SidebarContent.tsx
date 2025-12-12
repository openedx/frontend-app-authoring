import React from 'react';
import { Stack } from '@openedx/paragon';

interface SidebarContentProps {
  children: React.ReactNode[];
}

export const SidebarContent = ({ children } : SidebarContentProps) => (
  <Stack gap={1}>
    {children.map((child, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <React.Fragment key={index}>
        {child}
        {index !== children.length - 1 && <hr className="w-100" />}
      </React.Fragment>
    ))}
  </Stack>
);
