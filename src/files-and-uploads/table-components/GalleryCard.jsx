import React from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow,
  Icon,
  Card,
  Chip,
  Truncate,
} from '@edx/paragon';
import { ClosedCaption } from '@edx/paragon/icons';
import FileMenu from '../FileMenu';
import FileThumbnail from '../FileThumbnail';

const GalleryCard = ({
  className,
  original,
  handleBulkDownload,
  handleLockedFile,
  handleOpenDeleteConfirmation,
  handleOpenFileInfo,
  thumbnailPreview,
}) => {
  const lockFile = () => {
    const { locked, id } = original;
    handleLockedFile(id, !locked);
  };

  return (
    <Card className={className} data-testid={`grid-card-${original.id}`}>
      <Card.Header
        actions={(
          <ActionRow>
            <FileMenu
              externalUrl={original.externalUrl}
              handleLock={lockFile}
              locked={original.locked}
              openAssetInfo={() => handleOpenFileInfo(original)}
              portableUrl={original.portableUrl}
              id={original.id}
              wrapperType={original.wrapperType}
              onDownload={() => handleBulkDownload(
                [{ original: { id: original.id, displayName: original.displayName } }],
              )}
              openDeleteConfirmation={() => handleOpenDeleteConfirmation([{ original }])}
            />
          </ActionRow>
        )}
      />
      <Card.Section>
        <div className="row align-items-center justify-content-center m-0">
          <FileThumbnail
            thumbnail={original.thumbnail}
            wrapperType={original.wrapperType}
            externalUrl={original.externalUrl}
            displayName={original.displayName}
            id={original.id}
            status={original.status}
            imageSize={{ height: '76px', width: '135.71px' }}
            thumbnailPreview={thumbnailPreview}
          />
        </div>
        <div style={{ wordBreak: 'break-word' }}>
          <Truncate lines={1} className="font-weight-bold small mt-3">
            {original.displayName}
          </Truncate>
        </div>
      </Card.Section>
      <Card.Footer className="row m-0 flex-row-reverse justify-content-between align-items-center">
        <Chip>
          {original.wrapperType}
        </Chip>
        {original.transcripts?.length > 0 && <Icon size="lg" src={ClosedCaption} className="m-0 text-primary-500" />}
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
    locked: PropTypes.bool,
    externalUrl: PropTypes.string,
    thumbnail: PropTypes.string,
    id: PropTypes.string.isRequired,
    portableUrl: PropTypes.string,
    status: PropTypes.string,
    transcripts: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  handleBulkDownload: PropTypes.func.isRequired,
  handleLockedFile: PropTypes.func.isRequired,
  handleOpenDeleteConfirmation: PropTypes.func.isRequired,
  handleOpenFileInfo: PropTypes.func.isRequired,
  thumbnailPreview: PropTypes.func.isRequired,
};

export default GalleryCard;
