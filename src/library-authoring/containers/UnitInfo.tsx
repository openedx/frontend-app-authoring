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
  const { sidebarComponentInfo, sidebarTab, setSidebarTab } = useSidebarContext();
  const { insideUnit, navigateTo } = useLibraryRoutes();

  const tab: UnitInfoTab = (
    sidebarTab && isUnitInfoTab(sidebarTab)
  ) ? sidebarTab : UNIT_INFO_TABS.Preview;

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
        defaultActiveKey={UNIT_INFO_TABS.Preview}
        activeKey={tab}
        onSelect={setSidebarTab}
      >
        <Tab eventKey={UNIT_INFO_TABS.Preview} title={intl.formatMessage(messages.previewTabTitle)}>
          Unit Preview
        </Tab>
        <Tab eventKey={UNIT_INFO_TABS.Organize} title={intl.formatMessage(messages.organizeTabTitle)}>
          Organize Unit
        </Tab>
        <Tab eventKey={UNIT_INFO_TABS.Settings} title={intl.formatMessage(messages.settingsTabTitle)}>
          Unit Settings
        </Tab>
      </Tabs>
    </Stack>
  );
};

export default UnitInfo;
