import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Tab,
  Tabs,
  Stack,
} from '@openedx/paragon';
import { Link } from 'react-router-dom';

import { getEditUrl } from '../components/utils';
import { ComponentMenu } from '../components';
import messages from './messages';

interface ComponentInfoProps {
  usageKey: string;
}

const ComponentInfo = ({ usageKey } : ComponentInfoProps) => {
  const intl = useIntl();
  const editUrl = getEditUrl(usageKey);

  return (
    <Stack>
      <div className="d-flex flex-wrap">
        {
          editUrl ? (
            <Button as={Link} to={editUrl} variant="outline-primary" className="m-1 text-nowrap flex-grow-1">
              {intl.formatMessage(messages.editComponentButtonTitle)}
            </Button>
          ) : (
            <Button disabled variant="outline-primary" className="m-1 text-nowrap flex-grow-1">
              {intl.formatMessage(messages.editComponentButtonTitle)}
            </Button>
          )
        }
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
