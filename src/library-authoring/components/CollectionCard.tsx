import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Dropdown,
  Icon,
  IconButton,
} from '@openedx/paragon';
import { MoreVert } from '@openedx/paragon/icons';
import { useContext } from 'react';
import { Link } from 'react-router-dom';

import { type CollectionHit } from '../../search-manager';
import { LibraryContext } from '../common/context';
import BaseComponentCard from './BaseComponentCard';
import messages from './messages';

export const CollectionMenu = ({ collectionHit }: { collectionHit: CollectionHit }) => {
  const intl = useIntl();

  return (
    <Dropdown id="collection-card-dropdown" onClick={(e) => e.stopPropagation()}>
      <Dropdown.Toggle
        id="collection-card-menu-toggle"
        as={IconButton}
        src={MoreVert}
        iconAs={Icon}
        variant="primary"
        alt={intl.formatMessage(messages.collectionCardMenuAlt)}
        data-testid="collection-card-menu-toggle"
      />
      <Dropdown.Menu>
        <Dropdown.Item
          as={Link}
          to={`/library/${collectionHit.contextKey}/collection/${collectionHit.blockId}/`}
        >
          <FormattedMessage {...messages.menuOpen} />
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

type CollectionCardProps = {
  collectionHit: CollectionHit,
};

const CollectionCard = ({ collectionHit }: CollectionCardProps) => {
  const intl = useIntl();
  const {
    openCollectionInfoSidebar,
  } = useContext(LibraryContext);

  const {
    type,
    formatted,
    tags,
    numChildren,
  } = collectionHit;
  const { displayName = '', description = '' } = formatted;
  const blockTypeDisplayName = numChildren ? intl.formatMessage(
    messages.collectionTypeWithCount,
    { numChildren },
  ) : intl.formatMessage(messages.collectionType);

  return (
    <BaseComponentCard
      type={type}
      displayName={displayName}
      description={description}
      tags={tags}
      actions={(
        <ActionRow>
          <CollectionMenu collectionHit={collectionHit} />
        </ActionRow>
      )}
      blockTypeDisplayName={blockTypeDisplayName}
      openInfoSidebar={() => openCollectionInfoSidebar(collectionHit.blockId)}
    />
  );
};

export default CollectionCard;
