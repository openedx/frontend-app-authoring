import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Icon,
  IconButton,
} from '@openedx/paragon';
import { MoreVert } from '@openedx/paragon/icons';

import { type CollectionHit } from '../../search-manager';
import messages from './messages';
import BaseComponentCard from './BaseComponentCard';

type CollectionCardProps = {
  collectionHit: CollectionHit,
};

const CollectionCard = ({ collectionHit } : CollectionCardProps) => {
  const intl = useIntl();

  const {
    type,
    formatted,
    tags,
  } = collectionHit;
  const { displayName = '', description = '' } = formatted;

  return (
    <BaseComponentCard
      type={type}
      displayName={displayName}
      description={description}
      tags={tags}
      actions={(
        <ActionRow>
          <IconButton
            src={MoreVert}
            iconAs={Icon}
            variant="primary"
            alt={intl.formatMessage(messages.collectionCardMenuAlt)}
          />
        </ActionRow>
      )}
      blockTypeDisplayName={intl.formatMessage(messages.collectionType)}
      openInfoSidebar={() => {}}
    />
  );
};

export default CollectionCard;
