import { Icon, Stack } from '@openedx/paragon';

interface SidebarTitleProps {
  /** Title of the section */
  title: string;
  /** Icon to be displayed in the section title */
  icon?: React.ComponentType;
}

/**
 * Sidebar title component
 *
 * This component is used to render a title in the sidebar.
 * It is used as a child of the SidebarContent component.
 *
 * This is meant to standardize the look and feel of the sidebar section titles,
 * so that it can be reused across different parts of the application.
 */
export const SidebarTitle = ({ title, icon }: SidebarTitleProps) => (
  <Stack direction="horizontal" gap={2} className="mb-3">
    <Icon src={icon} className="mr-2 text-primary" />
    <h2 className="text-primary h3 mb-0">{title}</h2>
  </Stack>
);
