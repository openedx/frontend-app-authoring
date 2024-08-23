import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Tab,
  Tabs,
  Stack,
} from '@openedx/paragon';

import { ComponentMenu } from '../components';
import messages from './messages';

interface ComponentInfoProps {
  usageKey: string;
}

const ComponentInfo = ({ usageKey } : ComponentInfoProps) => {
  const intl = useIntl();

  return (
    <Stack>
      <Stack direction="horizontal" gap={1} className="d-flex justify-content-around">
        <Button disabled variant="outline-primary rounded-0">
          {intl.formatMessage(messages.editComponentButtonTitle)}
        </Button>
        <Button disabled variant="outline-primary rounded-0">
          {intl.formatMessage(messages.publishComponentButtonTitle)}
        </Button>
        <ComponentMenu usageKey={usageKey} />
      </Stack>
      <Tabs
        variant="tabs"
        className="my-3 d-flex justify-content-around"
        defaultActiveKey="preview"
      >
        <Tab eventKey="preview" title={intl.formatMessage(messages.previewTabTitle)}>
          Preview tab placeholder
        </Tab>
        <Tab eventKey="manage" title={intl.formatMessage(messages.manageTabTitle)}>
          Manage tab placeholder
        </Tab>
        <Tab eventKey="details" title={intl.formatMessage(messages.detailsTabTitle)}>
          Details tab placeholder
        </Tab>
      </Tabs>
    </Stack>
  );
};

export default ComponentInfo;
