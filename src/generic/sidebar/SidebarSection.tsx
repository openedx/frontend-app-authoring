import {
  Dropdown,
  Icon,
  IconButton,
  Stack,
} from '@openedx/paragon';
import { MoreVert } from '@openedx/paragon/icons';

export interface SidebarSectionProps {
  /** Title of the section */
  title: string;
  /** Icon to be displayed in the section */
  icon?: React.ComponentType;
  /** Actions to be displayed in the section */
  actions?: [
    {
      /** Label of the action */
      label: string;
      /** Function to be called when the action is clicked */
      onClick: () => void;
    },
  ];
  /** Content of the section */
  children: React.ReactNode;
}

/**
 * Sidebar section component
 *
 * This component is used to render a section in the sidebar.
 * It is used as a child of the SidebarContent component.
 *
 * This is meant to standardize the look and feel of the sidebar sections,
 * so that it can be reused across different parts of the application.
 *
 * Example usage:
 *
 * ```tsx
 * <SidebarSection title="Section 1">
 *   <p>Content 1</p>
 * </SidebarSection>
 * ```
 */
export const SidebarSection = ({
  title, icon, actions, children,
}: SidebarSectionProps) => (
  <Stack gap={2}>
    <Stack direction="horizontal" gap={2}>
      {icon && <Icon src={icon} className="mr-1 text-primary" size="sm" />}
      <h3 className="h5 font-weight-bold text-primary mb-0">
        {title}
      </h3>
      {actions && (
        <Dropdown className="ml-auto">
          <Dropdown.Toggle
            as={IconButton}
            src={MoreVert}
            iconAs={Icon}
            size="sm"
          />
          <Dropdown.Menu>
            {actions.map((action) => (
              <Dropdown.Item
                key={action.label}
                onClick={action.onClick}
              >
                {action.label}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      )}
    </Stack>
    {children}
  </Stack>
);
