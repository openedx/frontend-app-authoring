import BaseCard from "../components/BaseCard";

interface PlaceHolderCardProps {
  blockType: string;
  displayName: string;
}

const PlaceholderCard = ({ blockType, displayName }: PlaceHolderCardProps) => {
  return (
    <BaseCard
      itemType={blockType}
      displayName={displayName}
      preview={null}
      tags={{}}
      numChildren={0}
      actions={null}
      hasUnpublishedChanges={false}
      onSelect={() => null}
      selected={false}
      isPlaceholder
    />
  )
};

export default PlaceholderCard;
