import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Tab,
  Tabs,
  Stack,
} from '@openedx/paragon';

import { ComponentMenu } from '../components';
import ComponentManagement from './ComponentManagement';
import messages from './messages';

interface ComponentInfoProps {
  usageKey: string;
}

const ComponentInfo = ({ usageKey } : ComponentInfoProps) => {
  const intl = useIntl();

  return (
    <Stack>
      <div className="d-flex flex-wrap">
        <Button disabled variant="outline-primary" className="m-1 text-nowrap flex-grow-1">
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
          Preview tab placeholder
        </Tab>
        <Tab eventKey="manage" title={intl.formatMessage(messages.manageTabTitle)}>
          <ComponentManagement usageKey={usageKey} />
        </Tab>
        <Tab eventKey="details" title={intl.formatMessage(messages.detailsTabTitle)}>
          Details tab placeholder
        </Tab>
      </Tabs>
    </Stack>
  );
};

export default ComponentInfo;
