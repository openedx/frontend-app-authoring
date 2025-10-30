import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Tab,
  Tabs,
  Stack,
  useToggle,
} from '@openedx/paragon';
import {
  CheckBoxIcon,
  CheckBoxOutlineBlank,
} from '@openedx/paragon/icons';
import { getBlockType } from '@src/generic/key-utils';

import { useComponentPickerContext } from '../common/context/ComponentPickerContext';
import { useLibraryContext } from '../common/context/LibraryContext';
import {
  type ComponentInfoTab,
  COMPONENT_INFO_TABS,
  isComponentInfoTab,
  useSidebarContext,
} from '../common/context/SidebarContext';
import ComponentMenu from '../components';
import { canEditComponent } from '../components/ComponentEditorModal';
import ComponentDetails from './ComponentDetails';
import ComponentManagement from './ComponentManagement';
import ComponentPreview from './ComponentPreview';
import messages from './messages';
import { useLibraryBlockMetadata } from '../data/apiHooks';
import { ComponentUsageTab } from './ComponentUsageTab';
import { PublishDraftButton, PublishedChip } from '../generic/publish-status-buttons';
import { ComponentPublisher } from './ComponentPublisher';

const AddComponentWidget = () => {
  const intl = useIntl();

  const { sidebarItemInfo } = useSidebarContext();

  const {
    componentPickerMode,
    onComponentSelected,
    addComponentToSelectedComponents,
    removeComponentFromSelectedComponents,
    selectedComponents,
  } = useComponentPickerContext();

  const usageKey = sidebarItemInfo?.id;

  // istanbul ignore if: this should never happen
  if (!usageKey) {
    throw new Error('usageKey is required');
  }

  if (!componentPickerMode) {
    return null;
  }

  if (componentPickerMode === 'single') {
    return (
      <Button
        variant="outline-primary"
        className="m-1 text-nowrap flex-grow-1"
        onClick={() => {
          onComponentSelected({ usageKey, blockType: getBlockType(usageKey) });
        }}
      >
        {intl.formatMessage(messages.componentPickerSingleSelect)}
      </Button>
    );
  }

  if (componentPickerMode === 'multiple') {
    const isChecked = selectedComponents.some((component) => component.usageKey === usageKey);
    const handleChange = () => {
      const selectedComponent = {
        usageKey,
        blockType: getBlockType(usageKey),
      };
      if (!isChecked) {
        addComponentToSelectedComponents(selectedComponent);
      } else {
        removeComponentFromSelectedComponents(selectedComponent);
      }
    };

    return (
      <Button
        variant="outline-primary"
        iconBefore={isChecked ? CheckBoxIcon : CheckBoxOutlineBlank}
        onClick={handleChange}
      >
        {intl.formatMessage(messages.componentPickerMultipleSelect)}
      </Button>
    );
  }

  // istanbul ignore next: this should never happen
  return null;
};

const ComponentActions = ({
  componentId,
  hasUnpublishedChanges,
}: {
  componentId: string,
  hasUnpublishedChanges: boolean,
}) => {
  const intl = useIntl();
  const { openComponentEditor } = useLibraryContext();
  const [isPublisherOpen, openPublisher, closePublisher] = useToggle(false);
  const canEdit = canEditComponent(componentId);

  const { sidebarItemInfo } = useSidebarContext();

  if (isPublisherOpen) {
    return (
      <ComponentPublisher
        handleClose={closePublisher}
        componentId={componentId}
      />
    );
  }

  return (
    <div className="d-flex flex-wrap">
      <Button
        {...(canEdit ? { onClick: () => openComponentEditor(componentId) } : { disabled: true })}
        variant="outline-primary"
        className="m-1 text-nowrap flex-grow-1"
      >
        {intl.formatMessage(messages.editComponentButtonTitle)}
      </Button>
      <div className="flex-grow-1">
        {!hasUnpublishedChanges ? (
          <div className="m-1">
            <PublishedChip />
          </div>
        ) : (
          <PublishDraftButton
            onClick={openPublisher}
          />
        )}
      </div>
      <div className="mt-2">
        <ComponentMenu usageKey={componentId} index={sidebarItemInfo?.index} />
      </div>
    </div>
  );
};

const ComponentInfo = () => {
  const intl = useIntl();
  const { readOnly } = useLibraryContext();

  const {
    sidebarTab,
    setSidebarTab,
    sidebarItemInfo,
    defaultTab,
    hiddenTabs,
    resetSidebarAction,
  } = useSidebarContext();

  const tab: ComponentInfoTab = (
    isComponentInfoTab(sidebarTab)
      ? sidebarTab
      : defaultTab.component
  );

  const handleTabChange = (newTab: ComponentInfoTab) => {
    resetSidebarAction();
    setSidebarTab(newTab);
  };

  const componentId = sidebarItemInfo?.id;
  // istanbul ignore if: this should never happen
  if (!componentId) {
    throw new Error('usageKey is required');
  }

  const { data: componentMetadata } = useLibraryBlockMetadata(componentId);
  const hasUnpublishedChanges = componentMetadata?.hasUnpublishedChanges || false;

  // TODO: refactor sidebar Tabs to handle rendering and disabledTabs in one place.
  const renderTab = React.useCallback((infoTab: ComponentInfoTab, component: React.ReactNode, title: string) => {
    if (hiddenTabs.includes(infoTab)) {
      // For some reason, returning anything other than empty list breaks the tab style
      return [];
    }
    return (
      <Tab eventKey={infoTab} title={title}>
        {component}
      </Tab>
    );
  }, [hiddenTabs, defaultTab.component]);

  return (
    <Stack>
      {!readOnly && (
        <ComponentActions
          componentId={componentId}
          hasUnpublishedChanges={hasUnpublishedChanges}
        />
      )}
      <AddComponentWidget />
      <Tabs
        variant="tabs"
        className="my-3 d-flex justify-content-around"
        defaultActiveKey={defaultTab.component}
        activeKey={tab}
        onSelect={handleTabChange}
      >
        {renderTab(COMPONENT_INFO_TABS.Preview, <ComponentPreview />, intl.formatMessage(messages.previewTabTitle))}
        {renderTab(COMPONENT_INFO_TABS.Manage, <ComponentManagement />, intl.formatMessage(messages.manageTabTitle))}
        {renderTab(COMPONENT_INFO_TABS.Usage, <ComponentUsageTab />, intl.formatMessage(messages.usageTabTitle))}
        {renderTab(COMPONENT_INFO_TABS.Details, <ComponentDetails />, intl.formatMessage(messages.detailsTabTitle))}
      </Tabs>
    </Stack>
  );
};

export default ComponentInfo;
