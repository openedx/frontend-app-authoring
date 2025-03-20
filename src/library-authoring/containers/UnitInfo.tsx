import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Stack,
  Tab,
  Tabs,
} from '@openedx/paragon';
import { useCallback } from 'react';

import { useComponentPickerContext } from '../common/context/ComponentPickerContext';
import {
  type UnitInfoTab,
  UNIT_INFO_TABS,
  isUnitInfoTab,
  useSidebarContext,
} from '../common/context/SidebarContext';
import { useLibraryRoutes } from '../routes';
import UnitPreview from './UnitPreview';
import messages from './messages';

const UnitInfo = () => {
  const intl = useIntl();

  const { componentPickerMode } = useComponentPickerContext();
  const { sidebarComponentInfo, sidebarTab, setSidebarTab } = useSidebarContext();

  const tab: UnitInfoTab = (
    sidebarTab && isUnitInfoTab(sidebarTab)
  ) ? sidebarTab : UNIT_INFO_TABS.Preview;

  const unitId = sidebarComponentInfo?.id;
  // istanbul ignore if: this should never happen
  if (!unitId) {
    throw new Error('unitId is required');
  }

  const { insideUnit, navigateTo } = useLibraryRoutes();
  const showOpenCollectionButton = !insideUnit || !componentPickerMode;

  const handleOpenUnit = useCallback(() => {
    navigateTo({ unitId });
  }, [navigateTo]);

  return (
    <Stack>
      {showOpenCollectionButton && (
        <div className="d-flex flex-wrap">
          <Button
            onClick={handleOpenUnit}
            variant="outline-primary"
            className="m-1 text-nowrap flex-grow-1"
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
          <UnitPreview />
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
