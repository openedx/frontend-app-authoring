import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Tab,
  Tabs,
} from '@openedx/paragon';

import messages from './messages';

const CollectionInfo = () => {
  const intl = useIntl();

  return (
    <Tabs
      variant="tabs"
      className="my-3 d-flex justify-content-around"
      defaultActiveKey="manage"
    >
      <Tab eventKey="manage" title={intl.formatMessage(messages.manageTabTitle)}>
        Manage tab placeholder
      </Tab>
      <Tab eventKey="details" title={intl.formatMessage(messages.detailsTabTitle)}>
        Details tab placeholder
      </Tab>
    </Tabs>
  );
};

export default CollectionInfo;
