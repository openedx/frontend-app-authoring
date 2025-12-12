import { Icon, Stack } from '@openedx/paragon';

interface SidebarTitleProps {
  title: string;
  icon?: React.ComponentType;
}

export const SidebarTitle = ({ title, icon }: SidebarTitleProps) => (
  <Stack direction="horizontal" gap={2} className="mb-3">
    <Icon src={icon} className="mr-2 text-primary" />
    <h2 className="text-primary h3 mb-0">{title}</h2>
  </Stack>
);
