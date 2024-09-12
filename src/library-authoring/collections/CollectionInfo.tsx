import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Tab,
  Tabs,
  Stack,
} from '@openedx/paragon';

import messages from './messages';
import { useCollection } from '../data/apiHooks';
import Loading from '../../generic/Loading';

interface CollectionInfoProps {
  collectionId: string;
  libraryId: string;
}

const CollectionInfo = ({ libraryId, collectionId } : CollectionInfoProps) => {
  const intl = useIntl();
  const { data: collectionData, isLoading: isCollectionLoading } = useCollection(libraryId, collectionId);

  if (isCollectionLoading) {
    return <Loading />;
  }

  return (
    <Stack>
      <div className="d-flex flex-wrap">
        {collectionData?.title}
      </div>
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
    </Stack>
  );
};

export default CollectionInfo;
