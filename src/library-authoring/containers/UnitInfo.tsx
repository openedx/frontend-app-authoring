import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Stack,
  Tab,
  Tabs,
} from '@openedx/paragon';
import { useCallback } from 'react';

import { useComponentPickerContext } from '../common/context/ComponentPickerContext';
import { useLibraryContext } from '../common/context/LibraryContext';
import {
  type UnitInfoTab,
  UNIT_INFO_TABS,
  isUnitInfoTab,
  useSidebarContext,
} from '../common/context/SidebarContext';
import { useLibraryRoutes } from '../routes';
import messages from './messages';

const UnitInfo = () => {
  const intl = useIntl();

  const { setUnitId } = useLibraryContext();
  const { componentPickerMode } = useComponentPickerContext();
  const { defaultTab, disabledTabs, sidebarComponentInfo, sidebarTab, setSidebarTab } = useSidebarContext();
  const { insideUnit, navigateTo } = useLibraryRoutes();

  const tab: UnitInfoTab = (
    sidebarTab && isUnitInfoTab(sidebarTab)
  ) ? sidebarTab : defaultTab.unit;

  const unitId = sidebarComponentInfo?.id;
  // istanbul ignore if: this should never happen
  if (!unitId) {
    throw new Error('unitId is required');
  }

  const handleOpenUnit = useCallback(() => {
    if (componentPickerMode) {
      setUnitId(unitId);
    } else {
      navigateTo({ unitId });
    }
  }, [componentPickerMode, navigateTo, unitId]);

  const showOpenUnitButton = !insideUnit || !componentPickerMode;

  const renderTab = useCallback((tab: UnitInfoTab, component: React.ReactNode, title: string) => {
    if (disabledTabs.includes(tab)) {
      // For some reason, returning anything other than empty list breaks the tab style
      return [];
    }
    return (
      <Tab eventKey={tab} title={title}>
        {component}
      </Tab>
    );
  }, [disabledTabs, defaultTab.unit]);

  return (
    <Stack>
      {showOpenUnitButton && (
        <div className="d-flex flex-wrap">
          <Button
            variant="outline-primary"
            className="m-1 text-nowrap flex-grow-1"
            onClick={handleOpenUnit}
          >
            {intl.formatMessage(messages.openUnitButton)}
          </Button>
        </div>
      )}
      <Tabs
        variant="tabs"
        className="my-3 d-flex justify-content-around"
        defaultActiveKey={defaultTab.unit}
        activeKey={tab}
        onSelect={setSidebarTab}
      >
        {renderTab(UNIT_INFO_TABS.Preview, "Unit Preview", intl.formatMessage(messages.previewTabTitle))}
        {renderTab(UNIT_INFO_TABS.Organize, "Organize Unit", intl.formatMessage(messages.organizeTabTitle))}
        {renderTab(UNIT_INFO_TABS.Settings, "Unit Settings", intl.formatMessage(messages.settingsTabTitle))}
      </Tabs>
    </Stack>
  );
};

export default UnitInfo;
