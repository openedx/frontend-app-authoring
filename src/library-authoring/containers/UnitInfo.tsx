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
  const { sidebarComponentInfo, sidebarTab, setSidebarTab } = useSidebarContext();
  const { insideUnit, navigateTo } = useLibraryRoutes();
  const { data: container } = useContainer(unitId);

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

  if (!container) {
    return null;
  }

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
