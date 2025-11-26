import BaseCard from '../components/BaseCard';

interface PlaceHolderCardProps {
  blockType: string;
  displayName: string;
  description?: string;
}

const PlaceholderCard = ({ blockType, displayName, description }: PlaceHolderCardProps) => {
  const truncatedDescription = description ? `${description.substring(0, 40) }...` : undefined;
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
