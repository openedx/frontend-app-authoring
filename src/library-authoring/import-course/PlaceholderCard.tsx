import { useIntl } from '@edx/frontend-platform/i18n';
import BaseCard from '../components/BaseCard';
import messages from './messages';

interface PlaceHolderCardProps {
  blockType: string;
  displayName: string;
  description?: string;
}

const PlaceholderCard = ({ blockType, displayName, description }: PlaceHolderCardProps) => {
  const intl = useIntl();
  const defaultDescription = intl.formatMessage(messages.placeholderCardDescription);
  const truncatedDescription = description ? `${description.substring(0, 40) }...` : defaultDescription;
  /* istanbul ignore next */
  return (
    <BaseCard
      itemType={blockType}
      displayName={displayName}
      description={truncatedDescription}
      tags={{}}
      numChildren={0}
      actions={null}
      hasUnpublishedChanges={false}
      onSelect={() => null}
      selected={false}
      isPlaceholder
    />
  );
};

export default PlaceholderCard;
