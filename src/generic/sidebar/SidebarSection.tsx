import { Icon, Stack } from '@openedx/paragon';

export interface SidebarSectionProps {
  title: string;
  icon?: React.ComponentType;
  children: React.ReactNode;
}

export const SidebarSection = ({ title, icon, children }: SidebarSectionProps) => (
  <Stack gap={2}>
    <Stack direction="horizontal" gap={2}>
      {icon && <Icon src={icon} className="mr-1 text-primary" size="sm" />}
      <h3 className="h5 font-weight-bold text-primary mb-0">
        {title}
      </h3>
    </Stack>
    {children}
  </Stack>
);
