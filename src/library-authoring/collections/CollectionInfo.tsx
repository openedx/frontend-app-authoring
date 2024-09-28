import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Stack,
  Tab,
  Tabs,
} from '@openedx/paragon';
import { Link, useMatch } from 'react-router-dom';

import type { ContentLibrary } from '../data/api';
import CollectionDetails from './CollectionDetails';
import messages from './messages';

interface CollectionInfoProps {
  library: ContentLibrary,
  collectionId: string,
}

const CollectionInfo = ({ library, collectionId }: CollectionInfoProps) => {
  const intl = useIntl();
  const url = `/library/${library.id}/collection/${collectionId}/`;
  const urlMatch = useMatch(url);

  return (
    <Stack>
      {!urlMatch && (
        <div className="d-flex flex-wrap">
          <Button
            as={Link}
            to={url}
            variant="outline-primary"
            className="m-1 text-nowrap flex-grow-1"
            disabled={!!urlMatch}
          >
            {intl.formatMessage(messages.openCollectionButton)}
          </Button>
        </div>
      )}
      <Tabs
        variant="tabs"
        className="my-3 d-flex justify-content-around"
        defaultActiveKey="manage"
      >
        <Tab eventKey="manage" title={intl.formatMessage(messages.manageTabTitle)}>
          Manage tab placeholder
        </Tab>
        <Tab eventKey="details" title={intl.formatMessage(messages.detailsTabTitle)}>
          <CollectionDetails
            library={library}
            collectionId={collectionId}
          />
        </Tab>
      </Tabs>
    </Stack>
  );
};

export default CollectionInfo;
