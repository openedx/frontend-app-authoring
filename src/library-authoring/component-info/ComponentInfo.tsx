import { useEffect, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Tab,
  Tabs,
  Stack,
} from '@openedx/paragon';

import { SidebarAdditionalActions, useLibraryContext } from '../common/context';
import { ComponentMenu } from '../components';
import { canEditComponent } from '../components/ComponentEditorModal';
import ComponentDetails from './ComponentDetails';
import ComponentManagement from './ComponentManagement';
import ComponentPreview from './ComponentPreview';
import messages from './messages';
import { getBlockType } from '../../generic/key-utils';

const ComponentInfo = () => {
  const intl = useIntl();

  const {
    sidebarComponentInfo,
    readOnly,
    openComponentEditor,
    componentPickerMode,
    resetSidebarAdditionalActions,
  } = useLibraryContext();

  const jumpToCollections = sidebarComponentInfo?.additionalAction === SidebarAdditionalActions.JumpToAddCollections;
  // Show Manage tab if JumpToAddCollections action is set in sidebarComponentInfo
  const [tab, setTab] = useState(jumpToCollections ? 'manage' : 'preview');
  useEffect(() => {
    if (jumpToCollections) {
      setTab('manage');
    }
  }, [jumpToCollections]);

  useEffect(() => {
    // This is required to redo actions.
    if (tab !== 'manage') {
      resetSidebarAdditionalActions();
    }
  }, [tab]);

  const usageKey = sidebarComponentInfo?.id;
  // istanbul ignore if: this should never happen
  if (!usageKey) {
    throw new Error('usageKey is required');
  }

  const canEdit = canEditComponent(usageKey);

  const handleAddComponentToCourse = () => {
    window.parent.postMessage({
      usageKey,
      type: 'pickerComponentSelected',
      category: getBlockType(usageKey),
    }, '*');
  };

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
          <Button disabled variant="outline-primary" className="m-1 text-nowrap flex-grow-1">
            {intl.formatMessage(messages.publishComponentButtonTitle)}
          </Button>
          <ComponentMenu usageKey={usageKey} />
        </div>
      )}
      {componentPickerMode && (
        <Button variant="outline-primary" className="m-1 text-nowrap flex-grow-1" onClick={handleAddComponentToCourse}>
          {intl.formatMessage(messages.addComponentToCourse)}
        </Button>
      )}
      <Tabs
        variant="tabs"
        className="my-3 d-flex justify-content-around"
        activeKey={tab}
        onSelect={(k: string) => setTab(k)}
      >
        <Tab eventKey="preview" title={intl.formatMessage(messages.previewTabTitle)}>
          <ComponentPreview />
        </Tab>
        <Tab eventKey="manage" title={intl.formatMessage(messages.manageTabTitle)}>
          <ComponentManagement />
        </Tab>
        <Tab eventKey="details" title={intl.formatMessage(messages.detailsTabTitle)}>
          <ComponentDetails />
        </Tab>
      </Tabs>
    </Stack>
  );
};

export default ComponentInfo;
