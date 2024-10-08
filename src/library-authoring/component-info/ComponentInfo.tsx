import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Tab,
  Tabs,
  Stack,
} from '@openedx/paragon';

import { ComponentMenu } from '../components';
import ComponentDetails from './ComponentDetails';
import ComponentManagement from './ComponentManagement';
import ComponentPreview from './ComponentPreview';
import messages from './messages';
import { canEditComponent } from '../components/ComponentEditorModal';
import { useLibraryContext } from '../common/context';
import { useContentLibrary } from '../data/apiHooks';

interface ComponentInfoProps {
  usageKey: string;
}

const ComponentInfo = ({ usageKey }: ComponentInfoProps) => {
  const intl = useIntl();
  const { libraryId, openComponentEditor } = useLibraryContext();
  const { data: libraryData } = useContentLibrary(libraryId);
  const canEdit = libraryData?.canEditLibrary && canEditComponent(usageKey);

  return (
    <Stack>
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
      <Tabs
        variant="tabs"
        className="my-3 d-flex justify-content-around"
        defaultActiveKey="preview"
      >
        <Tab eventKey="preview" title={intl.formatMessage(messages.previewTabTitle)}>
          <ComponentPreview usageKey={usageKey} />
        </Tab>
        <Tab eventKey="manage" title={intl.formatMessage(messages.manageTabTitle)}>
          <ComponentManagement usageKey={usageKey} />
        </Tab>
        <Tab eventKey="details" title={intl.formatMessage(messages.detailsTabTitle)}>
          <ComponentDetails usageKey={usageKey} />
        </Tab>
      </Tabs>
    </Stack>
  );
};

export default ComponentInfo;
