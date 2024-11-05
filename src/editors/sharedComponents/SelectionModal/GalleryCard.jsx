import React from 'react';
import PropTypes from 'prop-types';

import {
  Badge,
  Image,
  Truncate,
} from '@openedx/paragon';
import { FormattedMessage, FormattedDate, FormattedTime } from '@edx/frontend-platform/i18n';

// SelectableBox in paragon has a bug where you can't change selection. So we override it
import SelectableBox from '../SelectableBox';
import messages from './messages';
import { formatDuration } from '../../utils';
import LanguageNamesWidget from '../../containers/VideoEditor/components/VideoSettingsModal/components/VideoPreviewWidget/LanguageNamesWidget';

const GalleryCard = ({
  asset,
  thumbnailFallback,
}) => {
  const [thumbnailError, setThumbnailError] = React.useState(false);
  return (
    <SelectableBox
      className="card bg-white shadow-none border-0 py-0"
      key={asset.externalUrl}
      type="radio"
      value={asset.id}
    >
      <div className="card-div d-flex flex-row flex-nowrap align-items-center">
        <div
          className="position-relative"
          style={{
            width: '200px',
            height: '100px',
          }}
        >
          {(thumbnailError && thumbnailFallback) ? (
            <div style={{ width: '200px', height: '100px' }}>
              { thumbnailFallback }
            </div>
          ) : (
            <Image
              style={{ border: 'none', width: '200px', height: '100px' }}
              src={asset.externalUrl}
              onError={thumbnailFallback && (() => setThumbnailError(true))}
            />
          )}
          { asset.statusMessage && asset.statusBadgeVariant && (
            <Badge variant={asset.statusBadgeVariant} style={{ position: 'absolute', left: '6px', top: '6px' }}>
              <FormattedMessage {...asset.statusMessage} />
            </Badge>
          )}
          { asset.duration >= 0 && (
            <Badge
              variant="dark"
              style={{
                position: 'absolute',
                right: '6px',
                bottom: '6px',
                backgroundColor: 'black',
              }}
            >
              {formatDuration(asset.duration)}
            </Badge>
          )}
        </div>
        <div className="card-text px-3 py-2" style={{ marginTop: '10px' }}>
          <h3 className="text-primary-500">
            <Truncate>{asset.displayName}</Truncate>
          </h3>
          { asset.transcripts && (
            <div style={{ margin: '0 0 5px 0' }}>
              <LanguageNamesWidget
                transcripts={asset.transcripts}
              />
            </div>
          )}
          {asset.dateAdded && (
          <p className="text-gray-500" style={{ fontSize: '11px' }}>
            <FormattedMessage
              {...messages.addedDate}
              values={{
                date: <FormattedDate value={asset.dateAdded} />,
                time: <FormattedTime value={asset.dateAdded} />,
              }}
            />
          </p>
          )}
        </div>
      </div>
    </SelectableBox>
  );
};

GalleryCard.defaultProps = {
  thumbnailFallback: undefined,
};
GalleryCard.propTypes = {
  asset: PropTypes.shape({
    contentType: PropTypes.string,
    displayName: PropTypes.string,
    externalUrl: PropTypes.string,
    id: PropTypes.string,
    dateAdded: PropTypes.oneOfType([PropTypes.number, PropTypes.instanceOf(Date)]),
    locked: PropTypes.bool,
    portableUrl: PropTypes.string,
    thumbnail: PropTypes.string,
    url: PropTypes.string,
    duration: PropTypes.number,
    status: PropTypes.string,
    statusMessage: PropTypes.objectOf(PropTypes.string),
    statusBadgeVariant: PropTypes.string,
    transcripts: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  thumbnailFallback: PropTypes.element,
};

export default GalleryCard;
