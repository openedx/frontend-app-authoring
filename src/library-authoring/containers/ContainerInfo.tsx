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

import { useClipboard } from '@src/generic/clipboard';
import { ContainerType, getBlockType } from '@src/generic/key-utils';
import { useComponentPickerContext } from '../common/context/ComponentPickerContext';
import { useLibraryContext } from '../common/context/LibraryContext';
import {
  type ContainerInfoTab,
  CONTAINER_INFO_TABS,
  isContainerInfoTab,
  useSidebarContext,
} from '../common/context/SidebarContext';
import ContainerOrganize from './ContainerOrganize';
import ContainerUsage from './ContainerUsage';
import { useLibraryRoutes } from '../routes';
import { LibraryUnitBlocks } from '../units/LibraryUnitBlocks';
import { LibraryContainerChildren } from '../section-subsections/LibraryContainerChildren';
import messages from './messages';
import { useContainer } from '../data/apiHooks';
import ContainerDeleter from './ContainerDeleter';
import { ContainerPublisher } from './ContainerPublisher';
import { PublishDraftButton, PublishedChip } from '../generic/publish-status-buttons';

type ContainerPreviewProps = {
  containerId: string,
};

const ContainerMenu = ({ containerId }: ContainerPreviewProps) => {
  const intl = useIntl();
  const { copyToClipboard } = useClipboard();

  const handleCopy = useCallback(() => {
    copyToClipboard(containerId);
  }, [copyToClipboard, containerId]);

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
          <Dropdown.Item onClick={handleCopy}>
            <FormattedMessage {...messages.menuCopyContainer} />
          </Dropdown.Item>
          <Dropdown.Item onClick={confirmDelete}>
            <FormattedMessage {...messages.menuDeleteContainer} />
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      {isConfirmingDelete && (
        <ContainerDeleter
          close={cancelDelete}
          containerId={containerId}
        />
      )}
    </>
  );
};

const ContainerPreview = ({ containerId } : ContainerPreviewProps) => {
  const containerType = getBlockType(containerId);
  if (containerType === ContainerType.Unit) {
    return <LibraryUnitBlocks unitId={containerId} readOnly />;
  }
  return <LibraryContainerChildren containerKey={containerId} readOnly />;
};

const ContainerActions = ({
  containerId,
  containerType,
  hasUnpublishedChanges,
}: {
  containerId: string,
  containerType: string,
  hasUnpublishedChanges: boolean,
}) => {
  const intl = useIntl();
  const { libraryId } = useLibraryContext();
  const { componentPickerMode } = useComponentPickerContext();
  const { insideUnit, insideSubsection, insideSection } = useLibraryRoutes();
  const [isPublisherOpen, openPublisher, closePublisher] = useToggle(false);

  const showOpenButton = !componentPickerMode && !(
    insideUnit || insideSubsection || insideSection
  );

  if (isPublisherOpen) {
    return (
      <ContainerPublisher
        handleClose={closePublisher}
        containerId={containerId}
      />
    );
  }

  return (
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
      {!componentPickerMode && (
        !hasUnpublishedChanges ? (
          <div className="m-1 flex-grow-1">
            <PublishedChip />
          </div>
        ) : (
          <div className="flex-grow-1">
            <PublishDraftButton
              onClick={openPublisher}
            />
          </div>
        )
      )}
      {showOpenButton && (
        <div className="mt-1">
          <ContainerMenu containerId={containerId} />
        </div>
      )}
    </div>
  );
};

const ContainerInfo = () => {
  const intl = useIntl();
  const {
    defaultTab,
    hiddenTabs,
    sidebarTab,
    setSidebarTab,
    sidebarItemInfo,
    resetSidebarAction,
  } = useSidebarContext();
  const containerId = sidebarItemInfo?.id;
  const containerType = containerId ? getBlockType(containerId) : undefined;
  const { data: container } = useContainer(containerId);

  const defaultContainerTab = defaultTab.container;
  const tab: ContainerInfoTab = (
    sidebarTab && isContainerInfoTab(sidebarTab)
  ) ? sidebarTab : defaultContainerTab;

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

  if (!container || !containerId || !containerType) {
    return null;
  }

  return (
    <Stack>
      <ContainerActions
        containerId={containerId}
        containerType={containerType}
        hasUnpublishedChanges={container.hasUnpublishedChanges}
      />
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
          CONTAINER_INFO_TABS.Usage,
          intl.formatMessage(messages.usageTabTitle),
          <ContainerUsage />,
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
