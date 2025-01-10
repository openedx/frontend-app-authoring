import React, { useEffect } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Tab,
  Tabs,
  Stack,
} from '@openedx/paragon';
import {
  CheckBoxIcon,
  CheckBoxOutlineBlank,
} from '@openedx/paragon/icons';

import { useComponentPickerContext } from '../common/context/ComponentPickerContext';
import { useLibraryContext } from '../common/context/LibraryContext';
import {
  type ComponentInfoTab,
  COMPONENT_INFO_TABS,
  SidebarActions,
  isComponentInfoTab,
  useSidebarContext,
} from '../common/context/SidebarContext';
import ComponentMenu from '../components';
import { canEditComponent } from '../components/ComponentEditorModal';
import ComponentDetails from './ComponentDetails';
import ComponentManagement from './ComponentManagement';
import ComponentPreview from './ComponentPreview';
import messages from './messages';
import { getBlockType } from '../../generic/key-utils';
import { useLibraryBlockMetadata, usePublishComponent } from '../data/apiHooks';
import { ToastContext } from '../../generic/toast-context';

const AddComponentWidget = () => {
  const intl = useIntl();

  const { sidebarComponentInfo } = useSidebarContext();

  const {
    componentPickerMode,
    onComponentSelected,
    addComponentToSelectedComponents,
    removeComponentFromSelectedComponents,
    selectedComponents,
  } = useComponentPickerContext();

  const usageKey = sidebarComponentInfo?.id;

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

const ComponentInfo = () => {
  const intl = useIntl();

  const { readOnly, openComponentEditor } = useLibraryContext();
  const {
    sidebarTab,
    setSidebarTab,
    sidebarComponentInfo,
    sidebarAction,
  } = useSidebarContext();

  const jumpToCollections = sidebarAction === SidebarActions.JumpToAddCollections;

  const tab: ComponentInfoTab = (
    isComponentInfoTab(sidebarTab)
      ? sidebarTab
      : COMPONENT_INFO_TABS.Preview
  );

  useEffect(() => {
    // Show Manage tab if JumpToAddCollections action is set in sidebarComponentInfo
    if (jumpToCollections) {
      setSidebarTab(COMPONENT_INFO_TABS.Manage);
    }
  }, [jumpToCollections, setSidebarTab]);

  const usageKey = sidebarComponentInfo?.id;
  // istanbul ignore if: this should never happen
  if (!usageKey) {
    throw new Error('usageKey is required');
  }

  const canEdit = canEditComponent(usageKey);

  const publishComponent = usePublishComponent(usageKey);
  const { data: componentMetadata } = useLibraryBlockMetadata(usageKey);
  // Only can be published when the component has been modified after the last published date.
  const canPublish = (new Date(componentMetadata?.modified ?? 0)) > (new Date(componentMetadata?.lastPublished ?? 0));
  const { showToast } = React.useContext(ToastContext);

  const publish = React.useCallback(() => {
    publishComponent.mutateAsync()
      .then(() => {
        showToast(intl.formatMessage(messages.publishSuccessMsg));
      }).catch(() => {
        showToast(intl.formatMessage(messages.publishErrorMsg));
      });
  }, [publishComponent, showToast, intl]);

  return (
    <Stack>
      {!readOnly && (
        <div className="d-flex flex-wrap">
          <Button
            {...(canEdit ? { onClick: () => openComponentEditor(usageKey) } : { disabled: true })}
            variant="outline-primary"
            className="m-1 text-nowrap flex-grow-1"
          >
            {intl.formatMessage(messages.editComponentButtonTitle)}
          </Button>
          <Button disabled={publishComponent.isLoading || !canPublish} onClick={publish} variant="outline-primary" className="m-1 text-nowrap flex-grow-1">
            {intl.formatMessage(messages.publishComponentButtonTitle)}
          </Button>
          <ComponentMenu usageKey={usageKey} />
        </div>
      )}
      <AddComponentWidget />
      <Tabs
        variant="tabs"
        className="my-3 d-flex justify-content-around"
        defaultActiveKey={COMPONENT_INFO_TABS.Preview}
        activeKey={tab}
        onSelect={setSidebarTab}
      >
        <Tab eventKey={COMPONENT_INFO_TABS.Preview} title={intl.formatMessage(messages.previewTabTitle)}>
          <ComponentPreview />
        </Tab>
        <Tab eventKey={COMPONENT_INFO_TABS.Manage} title={intl.formatMessage(messages.manageTabTitle)}>
          <ComponentManagement />
        </Tab>
        <Tab eventKey={COMPONENT_INFO_TABS.Details} title={intl.formatMessage(messages.detailsTabTitle)}>
          <ComponentDetails />
        </Tab>
      </Tabs>
    </Stack>
  );
};

export default ComponentInfo;
