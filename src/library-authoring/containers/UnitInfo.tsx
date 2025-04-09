import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Stack,
  Tab,
  Tabs,
  Dropdown,
  Icon,
  IconButton,
  useToggle,
} from '@openedx/paragon';
import { MoreVert } from '@openedx/paragon/icons';
import { useCallback } from 'react';

import { useComponentPickerContext } from '../common/context/ComponentPickerContext';
import { useLibraryContext } from '../common/context/LibraryContext';
import {
  type UnitInfoTab,
  UNIT_INFO_TABS,
  isUnitInfoTab,
  useSidebarContext,
} from '../common/context/SidebarContext';
import ContainerOrganize from './ContainerOrganize';
import { useLibraryRoutes } from '../routes';
import { LibraryUnitBlocks } from '../units/LibraryUnitBlocks';
import messages from './messages';
import componentMessages from '../components/messages';
import ContainerDeleter from '../components/ContainerDeleter';
import { useContainer } from '../data/apiHooks';

type ContainerMenuProps = {
  containerId: string,
  displayName: string,
};

const UnitMenu = ({ containerId, displayName }: ContainerMenuProps) => {
  const intl = useIntl();

  const [isConfirmingDelete, confirmDelete, cancelDelete] = useToggle(false);

  return (
    <>
      <Dropdown id="unit-info-dropdown">
        <Dropdown.Toggle
          id="unit-info-menu-toggle"
          as={IconButton}
          src={MoreVert}
          iconAs={Icon}
          variant="primary"
          alt={intl.formatMessage(componentMessages.containerCardMenuAlt)}
          data-testid="unit-info-menu-toggle"
        />
        <Dropdown.Menu>
          <Dropdown.Item onClick={confirmDelete}>
            <FormattedMessage {...componentMessages.menuDeleteContainer} />
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <ContainerDeleter
        isOpen={isConfirmingDelete}
        close={cancelDelete}
        containerId={containerId}
        displayName={displayName}
      />
    </>
  );
};

const UnitInfo = () => {
  const intl = useIntl();

  const { setUnitId } = useLibraryContext();
  const { componentPickerMode } = useComponentPickerContext();
  const {
    defaultTab, disabledTabs, sidebarComponentInfo, sidebarTab, setSidebarTab,
  } = useSidebarContext();
  const { insideUnit, navigateTo } = useLibraryRoutes();
  const { data: container } = useContainer(unitId);

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

  const showOpenUnitButton = !insideUnit || componentPickerMode;

  if (!container) {
    return null;
  }

  const renderTab = useCallback((tab: UnitInfoTab, component: React.ReactNode, title: string) => {
    if (disabledTabs.includes(tab)) {
      // For some reason, returning anything other than empty list breaks the tab style
      return [];
    }
    return (
      <Tab eventKey={infoTab} title={title}>
        {component}
      </Tab>
    );
  }, [disabledTabs, defaultTab.unit, unitId]);

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
          <UnitMenu
            containerId={unitId}
            displayName={container.displayName}
          />
        </div>
      )}
      <Tabs
        variant="tabs"
        className="my-3 d-flex justify-content-around"
        defaultActiveKey={defaultTab.unit}
        activeKey={tab}
        onSelect={setSidebarTab}
      >
        {renderTab(UNIT_INFO_TABS.Preview, <LibraryUnitBlocks />, intl.formatMessage(messages.previewTabTitle))}
        {renderTab(UNIT_INFO_TABS.Organize, <ContainerOrganize />, intl.formatMessage(messages.organizeTabTitle))}
        {renderTab(UNIT_INFO_TABS.Settings, "Unit Settings", intl.formatMessage(messages.settingsTabTitle))}
      </Tabs>
    </Stack>
  );
};

export default UnitInfo;
