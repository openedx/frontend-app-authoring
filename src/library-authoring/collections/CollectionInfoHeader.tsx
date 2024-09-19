import { type CollectionHit } from '../../search-manager/data/api';

interface CollectionInfoHeaderProps {
  collection?: CollectionHit;
}

const CollectionInfoHeader = ({ collection } : CollectionInfoHeaderProps) => (
  <div className="d-flex flex-wrap">
    {collection?.displayName}
  </div>
);

export default CollectionInfoHeader;
