import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, IconButton, Stack } from '@openedx/paragon';
import { ArrowBack } from '@openedx/paragon/icons';
import messages from './messages';
import { InfoSidebarMenu, InfoSidebarMenuProps } from './InfoSidebarMenu';

interface SidebarTitleProps {
  /** Title of the section */
  title: string;
  /** Icon to be displayed in the section title */
  icon?: React.ComponentType;
  onBackBtnClick?: () => void;
  menuProps?: InfoSidebarMenuProps;
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
export const SidebarTitle = ({
  title,
  icon,
  onBackBtnClick,
  menuProps,
}: SidebarTitleProps) => {
  const intl = useIntl();
  return (
    <>
      <div className="d-flex justify-content-between">
        <Stack direction="horizontal" gap={2} className="mb-3">
          {onBackBtnClick && (
            <IconButton
              onClick={onBackBtnClick}
              alt={intl.formatMessage(messages.backBtnText)}
              src={ArrowBack}
              size="inline"
            />
          )}
          <Icon src={icon} className="mr-2 text-primary" />
          <h2 className="text-primary h3 mb-0">{title}</h2>
        </Stack>
        {menuProps && <InfoSidebarMenu {...menuProps} />}
      </div>
      <hr className="border" style={{ marginLeft: '-1rem', marginRight: '-1rem' }} />
    </>
  );
};
