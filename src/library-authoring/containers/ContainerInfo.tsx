import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Stack,
  Dropdown,
  Icon,
  IconButton,
  useToggle,
} from '@openedx/paragon';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Tab, Nav } from 'react-bootstrap';
import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MoreVert } from '@openedx/paragon/icons';

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

  const handleTabChange = (newTab: ContainerInfoTab) => {
    resetSidebarAction();
    setSidebarTab(newTab);
  };

  const renderTab = useCallback((infoTab: ContainerInfoTab, title: string) => {
    if (hiddenTabs.includes(infoTab)) {
      return null;
    }
    return (
      <Nav.Item key={infoTab}>
        <Nav.Link eventKey={infoTab}>{title}</Nav.Link>
      </Nav.Item>
    );
  }, [hiddenTabs]);

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

      <Tab.Container
        defaultActiveKey={defaultContainerTab}
        activeKey={tab}
        onSelect={(k) => handleTabChange(k as ContainerInfoTab)}
        mountOnEnter
        unmountOnExit
      >
        <Nav variant="tabs" className="my-3 d-flex justify-content-around">
          {renderTab(
            CONTAINER_INFO_TABS.Preview,
            intl.formatMessage(messages.previewTabTitle),
          )}
          {renderTab(
            CONTAINER_INFO_TABS.Manage,
            intl.formatMessage(messages.manageTabTitle),
          )}
          {renderTab(
            CONTAINER_INFO_TABS.Usage,
            intl.formatMessage(messages.usageTabTitle),
          )}
          {/* 👇 Always show Settings */}
          <Nav.Item>
            <Nav.Link eventKey={CONTAINER_INFO_TABS.Settings}>
              {intl.formatMessage(messages.settingsTabTitle)}
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content className="mt-3">
          <Tab.Pane eventKey={CONTAINER_INFO_TABS.Preview}>
            <ContainerPreview containerId={containerId} />
          </Tab.Pane>
          <Tab.Pane eventKey={CONTAINER_INFO_TABS.Manage}>
            <ContainerOrganize />
          </Tab.Pane>
          <Tab.Pane eventKey={CONTAINER_INFO_TABS.Usage}>
            <ContainerUsage />
          </Tab.Pane>
          <Tab.Pane eventKey={CONTAINER_INFO_TABS.Settings}>
            {/* TODO: Container settings component */}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Stack>
  );
};

export default ContainerInfo;
