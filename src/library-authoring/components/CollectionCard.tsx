import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Dropdown,
  Icon,
  IconButton,
} from '@openedx/paragon';
import { MoreVert } from '@openedx/paragon/icons';
import { Link } from 'react-router-dom';

import { type CollectionHit } from '../../search-manager';
import { useLibraryContext } from '../common/context';
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
  const {
    openCollectionInfoSidebar,
  } = useLibraryContext();

  const {
    type: componentType,
    formatted,
    tags,
    numChildren,
  } = collectionHit;
  const { displayName = '', description = '' } = formatted;

  return (
    <BaseComponentCard
      componentType={componentType}
      displayName={displayName}
      description={description}
      tags={tags}
      numChildren={numChildren}
      actions={(
        <ActionRow>
          <CollectionMenu collectionHit={collectionHit} />
        </ActionRow>
      )}
      openInfoSidebar={() => openCollectionInfoSidebar(collectionHit.blockId)}
    />
  );
};

export default CollectionCard;
