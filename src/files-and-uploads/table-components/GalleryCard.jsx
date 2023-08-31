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
    <Card className={className} data-testid={`grid-card-${original.id}`}>
      <Card.Header
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
              openDeleteConfirmation={() => handleOpenDeleteConfirmation([{ original }])}
            />
          </ActionRow>
        )}
      />
      <Card.Section>
        <div className="row align-items-center justify-content-center m-0">
          {original.thumbnail ? (
            <Image src={src} style={{ height: '76px', width: '135.71px' }} className="border rounded p-1" />
          ) : (
            <div className="row border justify-content-center align-items-center rounded m-0" style={{ height: '76px', width: '135.71px' }}>
              <Icon src={src} style={{ height: '48px', width: '48px' }} />
            </div>
          )}
        </div>
        <div style={{ wordBreak: 'break-word' }}>
          <Truncate lines={1} className="font-weight-bold small mt-3">
            {original.displayName}
          </Truncate>
        </div>
      </Card.Section>
      <Card.Footer>
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
  handleLockedAsset: PropTypes.func.isRequired,
  handleOpenDeleteConfirmation: PropTypes.func.isRequired,
  handleOpenAssetInfo: PropTypes.func.isRequired,
};

export default GalleryCard;
