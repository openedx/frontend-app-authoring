import React from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow,
  Icon,
  Card,
  Chip,
  Truncate,
  Image,
} from '@edx/paragon';
import {
  MoreVert,
} from '@edx/paragon/icons';
import FileMenu from '../FileMenu';
import { getSrc } from '../data/utils';

const GalleryCard = ({
  className,
  original,
  handleBulkDownload,
  handleLockedAsset,
  handleOpenDeleteConfirmation,
  handleOpenAssetInfo,
}) => {
  const lockAsset = () => {
    const { locked } = original;
    handleLockedAsset(original.id, !locked);
  };
  const src = getSrc({
    thumbnail: original.thumbnail,
    wrapperType: original.wrapperType,
  });

  return (
    <Card className={`${className} w-100 gallery-card`} data-testid={`grid-card-${original.id}`}>
      <Card.Header
        className="pr-0 pt-2 pb-2"
        actions={(
          <ActionRow>
            <FileMenu
              externalUrl={original.externalUrl}
              handleLock={lockAsset}
              locked={original.locked}
              openAssetInfo={() => handleOpenAssetInfo(original)}
              portableUrl={original.portableUrl}
              iconSrc={MoreVert}
              id={original.id}
              onDownload={() => handleBulkDownload(
                [{ original: { id: original.id, displayName: original.displayName } }],
              )}
              openDeleteConfirmation={() => handleOpenDeleteConfirmation([{ original }])}
            />
          </ActionRow>
        )}
      />
      <Card.Section className="pr-3 pl-3 pt-0 pb-0">
        <div
          className="row align-items-center justify-content-center m-0 thumbnail-container border rounded p-1"
        >
          {original.thumbnail ? (
            <Image src={src} className="w-auto mw-100 mh-100 thumbnail-image" />
          ) : (
            <div className="row justify-content-center align-items-center m-0">
              <Icon src={src} style={{ height: '48px', width: '48px' }} />
            </div>
          )}
        </div>
        <div style={{ wordBreak: 'break-word' }}>
          <Truncate lines={1} className="font-weight-bold mt-2 picture-title">
            {original.displayName}
          </Truncate>
        </div>
      </Card.Section>
      <Card.Footer className="p-3 pt-4">
        <Chip>
          {original.wrapperType}
        </Chip>
      </Card.Footer>
    </Card>
  );
};

GalleryCard.defaultProps = {
  className: null,
};
GalleryCard.propTypes = {
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
  handleBulkDownload: PropTypes.func.isRequired,
  handleLockedAsset: PropTypes.func.isRequired,
  handleOpenDeleteConfirmation: PropTypes.func.isRequired,
  handleOpenAssetInfo: PropTypes.func.isRequired,
};

export default GalleryCard;
