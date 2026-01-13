import { Info } from '@openedx/paragon/icons';
import { SidebarPage } from '@src/generic/sidebar';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';
import { UnitInfoSidebar } from './UnitInfoSidebar';

export type UnitSidebarPageKeys = 'info';

/**
 * Get the pages for the unit sidebar
 *
 * This has been separated from the context to avoid a cyclical import
 * if you want to use the context in the sidebar pages.
 */
export function useUnitSidebarPages(): Record<UnitSidebarPageKeys, SidebarPage> {
  const intl = useIntl();

  return {
    info: {
      component: UnitInfoSidebar,
      icon: Info,
      title: intl.formatMessage(messages.sidebarButtonInfo),
    },
  };
}
