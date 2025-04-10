import { useEffect } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Stack,
  Tab,
  Tabs,
} from '@openedx/paragon';
import { useComponentPickerContext } from '../common/context/ComponentPickerContext';
import {
  type UnitInfoTab,
  SidebarActions,
  UNIT_INFO_TABS,
  isUnitInfoTab,
  useSidebarContext,
} from '../common/context/SidebarContext';
import ContainerOrganize from './ContainerOrganize';
import messages from './messages';

const UnitInfo = () => {
  const intl = useIntl();

  const { componentPickerMode } = useComponentPickerContext();
  const {
    sidebarTab,
    setSidebarTab,
    sidebarComponentInfo,
    sidebarAction,
  } = useSidebarContext();
  const jumpToCollections = sidebarAction === SidebarActions.JumpToAddCollections;

  const tab: UnitInfoTab = (
    sidebarTab && isUnitInfoTab(sidebarTab)
  ) ? sidebarTab : UNIT_INFO_TABS.Preview;

  const unitId = sidebarComponentInfo?.id;
  // istanbul ignore if: this should never happen
  if (!unitId) {
    throw new Error('unitId is required');
  }

  useEffect(() => {
    // Show Organize tab if JumpToAddCollections action is set in sidebarComponentInfo
    if (jumpToCollections) {
      setSidebarTab(UNIT_INFO_TABS.Organize);
    }
  }, [jumpToCollections, setSidebarTab]);

  const showOpenCollectionButton = !componentPickerMode;

  return (
    <Stack>
      {showOpenCollectionButton && (
        <div className="d-flex flex-wrap">
          <Button
            variant="outline-primary"
            className="m-1 text-nowrap flex-grow-1"
            disabled
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
          <ContainerOrganize />
        </Tab>
        <Tab eventKey={UNIT_INFO_TABS.Settings} title={intl.formatMessage(messages.settingsTabTitle)}>
          Unit Settings
        </Tab>
      </Tabs>
    </Stack>
  );
};

export default UnitInfo;
