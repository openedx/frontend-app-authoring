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
import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MoreVert } from '@openedx/paragon/icons';

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
import { useContainer, usePublishContainer } from '../data/apiHooks';
import { ToastContext } from '../../generic/toast-context';

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

  const { libraryId, readOnly } = useLibraryContext();
  const { componentPickerMode } = useComponentPickerContext();
  const { showToast } = React.useContext(ToastContext);
  const {
    defaultTab,
    hiddenTabs,
    sidebarTab,
    setSidebarTab,
    sidebarComponentInfo,
    resetSidebarAction,
  } = useSidebarContext();
  const { insideUnit } = useLibraryRoutes();

  const tab: UnitInfoTab = (
    sidebarTab && isUnitInfoTab(sidebarTab)
  ) ? sidebarTab : defaultTab.unit;

  const unitId = sidebarComponentInfo?.id;
  const { data: container } = useContainer(unitId);
  const publishContainer = usePublishContainer(unitId!);

  const showOpenUnitButton = !insideUnit && !componentPickerMode;

  /* istanbul ignore next */
  const handleTabChange = (newTab: UnitInfoTab) => {
    resetSidebarAction();
    setSidebarTab(newTab);
  };

  const renderTab = useCallback((infoTab: UnitInfoTab, component: React.ReactNode, title: string) => {
    if (hiddenTabs.includes(infoTab)) {
      // For some reason, returning anything other than empty list breaks the tab style
      return [];
    }
    return (
      <Tab eventKey={infoTab} title={title}>
        {component}
      </Tab>
    );
  }, [hiddenTabs, defaultTab.unit, unitId]);

  const handlePublish = React.useCallback(async () => {
    try {
      await publishContainer.mutateAsync();
      showToast(intl.formatMessage(messages.publishContainerSuccess));
    } catch (error) {
      showToast(intl.formatMessage(messages.publishContainerFailed));
    }
  }, [publishContainer]);

  if (!container || !unitId) {
    return null;
  }

  return (
    <Stack>
      <div className="d-flex flex-wrap">
        {showOpenUnitButton && (
          <Button
            variant="outline-primary"
            className="m-1 text-nowrap flex-grow-1"
            as={Link}
            to={`/library/${libraryId}/unit/${unitId}`}
          >
            {intl.formatMessage(messages.openUnitButton)}
          </Button>
        )}
        {!componentPickerMode && !readOnly && (
          <Button
            variant="outline-primary"
            className="m-1 text-nowrap flex-grow-1"
            disabled={!container.hasUnpublishedChanges || publishContainer.isLoading}
            onClick={handlePublish}
          >
            {intl.formatMessage(messages.publishContainerButton)}
          </Button>
        )}
        {showOpenUnitButton && ( // Check: should we still show this on the unit page?
          <UnitMenu
            containerId={unitId}
            displayName={container.displayName}
          />
        )}
      </div>
      <Tabs
        variant="tabs"
        className="my-3 d-flex justify-content-around"
        defaultActiveKey={defaultTab.unit}
        activeKey={tab}
        onSelect={handleTabChange}
      >
        {renderTab(
          UNIT_INFO_TABS.Preview,
          <LibraryUnitBlocks readOnly />,
          intl.formatMessage(messages.previewTabTitle),
        )}
        {renderTab(UNIT_INFO_TABS.Manage, <ContainerOrganize />, intl.formatMessage(messages.manageTabTitle))}
        {renderTab(UNIT_INFO_TABS.Settings, 'Unit Settings', intl.formatMessage(messages.settingsTabTitle))}
      </Tabs>
    </Stack>
  );
};

export default UnitInfo;
