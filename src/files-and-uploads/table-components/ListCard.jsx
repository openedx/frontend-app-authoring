import React from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow,
  Icon,
  Card,
  useToggle,
  Chip,
  Truncate,
} from '@edx/paragon';
import {
  MoreVert,
} from '@edx/paragon/icons';
import FileMenu from '../FileMenu';
import FileInfo from '../FileInfo';
import { getIcon } from '../data/utils';

const ListCard = ({
  className,
  original,
  handleBulkDelete,
  handleLockedAsset,
}) => {
  const [isAssetInfoOpen, openAssetInfo, closeAssetinfo] = useToggle(false);
  const deleteAsset = () => {
    handleBulkDelete([{ original }]);
  };
  const lockAsset = () => {
    const { locked } = original;
    handleLockedAsset(original.id, !locked);
  };
  const icon = getIcon({
    thumbnail: original.thumbnail,
    externalUrl: original.externalUrl,
    wrapperType: original.wrapperType,
  });

  return (
    <>
      <Card
        className={className}
        orientation="horizontal"
        data-testid={`list-card-${original.id}`}
      >
        <div className="p-3">
          {original.thumbnail ? (
            <Card.ImageCap src={original.externalUrl} />
          ) : (
            <Icon src={icon} style={{ height: '48px', width: '48px' }} />
          )}
        </div>
        <Card.Body>
          <Card.Section>
            <Truncate lines={1} className="font-weight-bold small mt-3">
              {original.displayName}
            </Truncate>
            <Chip className="mt-3">
              {original.wrapperType}
            </Chip>
          </Card.Section>
        </Card.Body>
        <Card.Footer>
          <ActionRow>
            <FileMenu
              externalUrl={original.externalUrl}
              handleDelete={deleteAsset}
              handleLock={lockAsset}
              locked={original.locked}
              openAssetInfo={openAssetInfo}
              portableUrl={original.portableUrl}
              iconSrc={MoreVert}
              id={original.id}
            />
          </ActionRow>
        </Card.Footer>
      </Card>
      <FileInfo
        asset={original}
        onClose={closeAssetinfo}
        isOpen={isAssetInfoOpen}
        handleLockedAsset={handleLockedAsset}
      />
    </>
  );
};

ListCard.defaultProps = {
  className: null,
};
ListCard.propTypes = {
  className: PropTypes.string,
  original: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    wrapperType: PropTypes.string.isRequired,
    locked: PropTypes.bool.isRequired,
    externalUrl: PropTypes.string.isRequired,
    thumbnail: PropTypes.string,
    id: PropTypes.string.isRequired,
    portableUrl: PropTypes.string.isRequired,
  }).isRequired,
  handleLockedAsset: PropTypes.func.isRequired,
  handleBulkDelete: PropTypes.func.isRequired,
};

export default ListCard;
