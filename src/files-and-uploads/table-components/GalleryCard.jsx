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
  AudioFile,
  Terminal,
  // FolderZip,
  InsertDriveFile,
} from '@edx/paragon/icons';
import FileMenu from '../FileMenu';
import FileInfo from '../FileInfo';

const GalleryCard = ({
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
  const getIcon = () => {
    if (original.thumbnail) {
      return original.externalUrl;
    }
    switch (original.wrapperType) {
    case 'document':
      return InsertDriveFile;
    case 'code':
      return Terminal;
    case 'audio':
      return AudioFile;
    default:
      return InsertDriveFile;
    }
  };

  return (
    <>
      <Card className={className}>
        <Card.Header
          actions={(
            <ActionRow>
              <FileMenu
                externalUrl={original.externalUrl}
                handleDelete={deleteAsset}
                handleLock={lockAsset}
                locked={original.locked}
                openAssetInfo={openAssetInfo}
                portableUrl={original.portableUrl}
                iconSrc={MoreVert}
              />
            </ActionRow>
          )}
        />
        <Card.Section>
          {original.thumbnail ? (
            <Card.ImageCap src={original.externalUrl} />
          ) : (
            <Icon src={getIcon()} style={{ height: '48px', width: '48px' }} />
          )}
          <Truncate lines={1} className="font-weight-bold small mt-3">
            {original.displayName}
          </Truncate>
        </Card.Section>
        <Card.Footer>
          <Chip>
            {original.wrapperType}
          </Chip>
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

GalleryCard.propTypes = {
  className: PropTypes.string.isRequired,
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

export default GalleryCard;
