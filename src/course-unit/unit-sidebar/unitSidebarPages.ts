import { Info } from '@openedx/paragon/icons';
import { SidebarPage } from '@src/generic/sidebar';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';
import { UnitInfoSidebar } from './UnitInfoSidebar';

export type UnitSidebarPageKeys = 'info';

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
