import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Form,
  Tab,
  Tabs,
  Stack,
} from '@openedx/paragon';

import { useLibraryContext } from '../common/context';
import { ComponentMenu } from '../components';
import { canEditComponent } from '../components/ComponentEditorModal';
import ComponentDetails from './ComponentDetails';
import ComponentManagement from './ComponentManagement';
import ComponentPreview from './ComponentPreview';
import messages from './messages';
import { getBlockType } from '../../generic/key-utils';

const AddComponentWidget = () => {
  const intl = useIntl();

  const {
    sidebarComponentUsageKey: usageKey,
    componentPickerMode,
    onComponentSelected,
    addComponentToSelectedComponents,
    removeComponentFromSelectedComponents,
    selectedComponents,
  } = useLibraryContext();

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
        {intl.formatMessage(messages.addComponentToCourse)}
      </Button>
    );
  }

  if (componentPickerMode === 'multiple') {
    const handleChange = (event) => {
      const selectedComponent = {
        usageKey,
        blockType: getBlockType(usageKey),
      };
      if (event.target.checked) {
        addComponentToSelectedComponents(selectedComponent);
      } else {
        removeComponentFromSelectedComponents(selectedComponent);
      }
    };

    const isChecked = selectedComponents.some((component) => component.usageKey === usageKey);
    return (
      <Form.Checkbox checked={isChecked} onChange={handleChange}>
        {intl.formatMessage(messages.addComponentToCourse)}
      </Form.Checkbox>
    );
  }

  return null;
};

const ComponentInfo = () => {
  const intl = useIntl();

  const {
    sidebarComponentUsageKey: usageKey,
    readOnly,
    openComponentEditor,
  } = useLibraryContext();

  // istanbul ignore if: this should never happen
  if (!usageKey) {
    throw new Error('usageKey is required');
  }

  const canEdit = canEditComponent(usageKey);

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
      <AddComponentWidget />
      <Tabs
        variant="tabs"
        className="my-3 d-flex justify-content-around"
        defaultActiveKey="preview"
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
