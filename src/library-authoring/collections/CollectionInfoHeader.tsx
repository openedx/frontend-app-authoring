import { Collection } from '../data/api';

interface CollectionInfoHeaderProps {
  collection?: Collection;
}

const CollectionInfoHeader = ({ collection } : CollectionInfoHeaderProps) => (
  <div className="d-flex flex-wrap">
    {collection?.title}
  </div>
);

export default CollectionInfoHeader;
