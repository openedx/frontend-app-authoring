import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Stack,
  Tab,
  Tabs,
} from '@openedx/paragon';
import { Link, useMatch } from 'react-router-dom';

import type { CollectionHit } from '../../search-manager';
import type { ContentLibrary } from '../data/api';
import CollectionDetails from './CollectionDetails';
import messages from './messages';

interface CollectionInfoProps {
  library: ContentLibrary,
  collection: CollectionHit,
}

const CollectionInfo = ({ library, collection }: CollectionInfoProps) => {
  const intl = useIntl();
  const url = `/library/${library.id}/collection/${collection.blockId}/`;
  const urlMatch = useMatch(url);

  return (
    <Stack>
      {!urlMatch && (
        <div className="d-flex flex-wrap">
          <Button
            as={Link}
            to={`/library/${library.id}/collection/${collection.blockId}/`}
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
            key={collection.id} // This is necessary to force a re-render when the collection changes
            library={library}
            collection={collection}
          />
        </Tab>
      </Tabs>
    </Stack>
  );
};

export default CollectionInfo;
