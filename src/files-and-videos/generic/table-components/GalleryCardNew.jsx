import React from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow,
  Icon,
  Card,
  Chip,
  Truncate,
} from '@openedx/paragon';
import { ClosedCaption } from '@openedx/paragon/icons';
import FileMenu from '../FileMenu';
import FileThumbnail from '../ThumbnailPreview';

const GalleryCardNew = ({
  className,
  original,
  handleBulkDownload,
  handleLockFile,
  handleOpenDeleteConfirmation,
  handleOpenFileInfo,
  thumbnailPreview,
  fileType,
}) => {
  const lockFile = () => {
    const { locked, id } = original;
    handleLockFile(id, !locked);
  };

  return (
    <Card className={`${className} gallery-card ted-card`} data-testid={`grid-card-${original.id}`}>
      {/* <Card.Header
        className="pr-0 pt-2 pb-2"
        actions={(
          <ActionRow>
            <FileMenu
              externalUrl={original.externalUrl}
              handleLock={lockFile}
              locked={original.locked}
              openAssetInfo={() => handleOpenFileInfo(original)}
              portableUrl={original.portableUrl}
              id={original.id}
              fileType={fileType}
              onDownload={() => handleBulkDownload([{
                original: {
                  id: original.id,
                  displayName:
                  original.displayName,
                  downloadLink: original?.downloadLink,
                },
              }])}
              openDeleteConfirmation={() => handleOpenDeleteConfirmation([{ original }])}
            />
          </ActionRow>
        )}
      /> */}
      <Card.Section className="pt-1 files-card-section">
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <div style={{ wordBreak: 'break-word', marginRight: '1.25rem' }}>
            <Truncate lines={1} className="font-weight-bold picture-title">
              {original.displayName}
            </Truncate>
          </div>
          <div style={{ marginRight: '-1rem' }}>
            <ActionRow>
              <FileMenu
                externalUrl={original.externalUrl}
                handleLock={lockFile}
                locked={original.locked}
                openAssetInfo={() => handleOpenFileInfo(original)}
                portableUrl={original.portableUrl}
                id={original.id}
                fileType={fileType}
                onDownload={() => handleBulkDownload([{
                  original: {
                    id: original.id,
                    displayName:
                  original.displayName,
                    downloadLink: original?.downloadLink,
                  },
                }])}
                openDeleteConfirmation={() => handleOpenDeleteConfirmation([{ original }])}
              />
            </ActionRow>
          </div>
        </div>
        <div className="row align-items-center justify-content-center m-0">
          <FileThumbnail
            thumbnail={original.thumbnail}
            wrapperType={original.wrapperType}
            externalUrl={original.externalUrl}
            displayName={original.displayName}
            id={original.id}
            status={original.status}
            // imageSize={{ height: '76px', width: '135.71px' }}
            imageSize={{ height: '118px', width: '180px' }}
            // imageSize
            thumbnailPreview={thumbnailPreview}
          />
        </div>
      </Card.Section>
      {/* <Card.Footer className="p-3 pt-4 row m-0 flex-row-reverse justify-content-between align-items-center">
        <Chip>
          {original.wrapperType}
        </Chip>
        {original.transcripts?.length > 0 && <Icon size="lg" src={ClosedCaption} className="m-0 text-primary-500" />}
      </Card.Footer> */}
    </Card>
  );
};

GalleryCardNew.defaultProps = {
  className: null,
};
GalleryCardNew.propTypes = {
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
    downloadLink: PropTypes.string,
  }).isRequired,
  handleBulkDownload: PropTypes.func.isRequired,
  handleLockFile: PropTypes.func.isRequired,
  handleOpenDeleteConfirmation: PropTypes.func.isRequired,
  handleOpenFileInfo: PropTypes.func.isRequired,
  thumbnailPreview: PropTypes.func.isRequired,
  fileType: PropTypes.string.isRequired,
};

export default GalleryCardNew;
