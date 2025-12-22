import React from 'react';
import { Stack } from '@openedx/paragon';

interface SidebarContentProps {
  children: React.ReactNode | React.ReactNode[],
}

/**
 * Sidebar content component
 *
 * This component is used to render the content body of the sidebar.
 * It is used as a child of the Sidebar component.
 *
 * This is meant to standardize the look and feel of the sidebar content,
 * so that it can be reused across different parts of the application.
 *
 * Example usage:
 *
 * ```tsx
 * <SidebarContent>
 *   <SidebarSection title="Section 1">
 *     <p>Content 1</p>
 *   </SidebarSection>
 *   <SidebarSection title="Section 2">
 *     <MyContentComponent someProps={someProps} />
 *   </SidebarSection>
 * </SidebarContent>
 * ```
 */
export const SidebarContent = ({ children } : SidebarContentProps) => (
  <Stack gap={1}>
    {Array.isArray(children) ? children.map((child, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <React.Fragment key={index}>
        {child}
        {index !== children.length - 1 && <hr className="w-100" />}
      </React.Fragment>
    )) : children}
  </Stack>
);
