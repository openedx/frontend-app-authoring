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
  type ContainerInfoTab,
  CONTAINER_INFO_TABS,
  isContainerInfoTab,
  useSidebarContext,
} from '../common/context/SidebarContext';
import ContainerOrganize from './ContainerOrganize';
import { useLibraryRoutes } from '../routes';
import { LibraryUnitBlocks } from '../units/LibraryUnitBlocks';
import { LibraryContainerChildren } from '../section-subsections/LibraryContainerChildren';
import messages from './messages';
import { useContainer, usePublishContainer } from '../data/apiHooks';
import { ContainerType, getBlockType } from '../../generic/key-utils';
import { ToastContext } from '../../generic/toast-context';
import ContainerDeleter from './ContainerDeleter';

type ContainerMenuProps = {
  containerId: string,
  displayName: string,
};

const ContainerMenu = ({ containerId, displayName }: ContainerMenuProps) => {
  const intl = useIntl();

  const [isConfirmingDelete, confirmDelete, cancelDelete] = useToggle(false);

  return (
    <>
      <Dropdown id="container-info-dropdown">
        <Dropdown.Toggle
          id="container-info-menu-toggle"
          as={IconButton}
          src={MoreVert}
          iconAs={Icon}
          variant="primary"
          alt={intl.formatMessage(messages.containerCardMenuAlt)}
          data-testid="container-info-menu-toggle"
        />
        <Dropdown.Menu>
          <Dropdown.Item onClick={confirmDelete}>
            <FormattedMessage {...messages.menuDeleteContainer} />
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

type ContainerPreviewProps = {
  containerId: string,
};

const ContainerPreview = ({ containerId } : ContainerPreviewProps) => {
  const containerType = getBlockType(containerId);
  if (containerType === ContainerType.Unit) {
    return <LibraryUnitBlocks unitId={containerId} readOnly />;
  }
  return <LibraryContainerChildren containerKey={containerId} readOnly />;
};

const ContainerInfo = () => {
  const intl = useIntl();

  const { libraryId, readOnly } = useLibraryContext();
  const { componentPickerMode } = useComponentPickerContext();
  const { showToast } = React.useContext(ToastContext);
  const {
    defaultTab,
    hiddenTabs,
    sidebarTab,
    setSidebarTab,
    sidebarItemInfo,
    resetSidebarAction,
  } = useSidebarContext();
  const { insideUnit, insideSubsection, insideSection } = useLibraryRoutes();

  const containerId = sidebarItemInfo?.id;
  const containerType = containerId ? getBlockType(containerId) : undefined;
  const { data: container } = useContainer(containerId);
  const publishContainer = usePublishContainer(containerId!);

  const defaultContainerTab = defaultTab.container;
  const tab: ContainerInfoTab = (
    sidebarTab && isContainerInfoTab(sidebarTab)
  ) ? sidebarTab : defaultContainerTab;

  const showOpenButton = !componentPickerMode && !(
    insideUnit || insideSubsection || insideSection
  );

  /* istanbul ignore next */
  const handleTabChange = (newTab: ContainerInfoTab) => {
    resetSidebarAction();
    setSidebarTab(newTab);
  };

  const renderTab = useCallback((infoTab: ContainerInfoTab, title: string, component?: React.ReactNode) => {
    if (hiddenTabs.includes(infoTab)) {
      // For some reason, returning anything other than empty list breaks the tab style
      return [];
    }
    return (
      <Tab eventKey={infoTab} title={title}>
        {component}
      </Tab>
    );
  }, [hiddenTabs, defaultContainerTab, containerId]);

  const handlePublish = useCallback(async () => {
    try {
      await publishContainer.mutateAsync();
      showToast(intl.formatMessage(messages.publishContainerSuccess));
    } catch (error) {
      showToast(intl.formatMessage(messages.publishContainerFailed));
    }
  }, [publishContainer]);

  if (!container || !containerId || !containerType) {
    return null;
  }

  return (
    <Stack>
      <div className="d-flex flex-wrap">
        {showOpenButton && (
          <Button
            variant="outline-primary"
            className="m-1 text-nowrap flex-grow-1"
            as={Link}
            to={`/library/${libraryId}/${containerType}/${containerId}`}
          >
            {intl.formatMessage(messages.openButton)}
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
        {showOpenButton && (
          <ContainerMenu
            containerId={containerId}
            displayName={container.displayName}
          />
        )}
      </div>
      <Tabs
        variant="tabs"
        className="my-3 d-flex justify-content-around"
        defaultActiveKey={defaultContainerTab}
        activeKey={tab}
        onSelect={handleTabChange}
      >
        {renderTab(
          CONTAINER_INFO_TABS.Preview,
          intl.formatMessage(messages.previewTabTitle),
          <ContainerPreview containerId={containerId} />,
        )}
        {renderTab(
          CONTAINER_INFO_TABS.Manage,
          intl.formatMessage(messages.manageTabTitle),
          <ContainerOrganize />,
        )}
        {renderTab(
          CONTAINER_INFO_TABS.Settings,
          intl.formatMessage(messages.settingsTabTitle),
          // TODO: container settings component
        )}
      </Tabs>
    </Stack>
  );
};

export default ContainerInfo;
