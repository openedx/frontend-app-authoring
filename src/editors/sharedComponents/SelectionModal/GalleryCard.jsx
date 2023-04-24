import React from 'react';
import PropTypes from 'prop-types';

import {
  Badge,
  Image,
  SelectableBox,
} from '@edx/paragon';
import { FormattedMessage, FormattedDate, FormattedTime } from '@edx/frontend-platform/i18n';

import messages from './messages';
import { formatDuration } from '../../utils';
import LanguageNamesWidget from '../../containers/VideoEditor/components/VideoSettingsModal/components/VideoPreviewWidget/LanguageNamesWidget';

export const GalleryCard = ({
  asset,
}) => (
  <SelectableBox
    className="card bg-white"
    key={asset.externalUrl}
    type="radio"
    value={asset.id}
    style={{
      padding: '10px 20px',
      border: 'none',
      boxShadow: 'none',
    }}
  >
    <div className="card-div d-flex flex-row flex-nowrap">
      <div style={{
        position: 'relative',
        width: '200px',
        height: '100px',
        margin: '18px 0 0 0',
      }}
      >
        <Image
          style={{ border: 'none', width: '200px', height: '100px' }}
          src={asset.externalUrl}
        />
        { asset.status && asset.statusBadgeVariant && (
          <Badge variant={asset.statusBadgeVariant} style={{ position: 'absolute', left: '6px', top: '6px' }}>
            {asset.status}
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
      <div className="card-text p-3" style={{ marginTop: '10px' }}>
        <h3 className="text-primary-500">{asset.displayName}</h3>
        { asset.transcripts && (
          <div style={{ margin: '0 0 5px 0' }}>
            <LanguageNamesWidget
              transcripts={asset.transcripts}
            />
          </div>
        )}
        <p className="text-gray-500" style={{ fontSize: '11px' }}>
          <FormattedMessage
            {...messages.addedDate}
            values={{
              date: <FormattedDate value={asset.dateAdded} />,
              time: <FormattedTime value={asset.dateAdded} />,
            }}
          />
        </p>
      </div>
    </div>
  </SelectableBox>
);

GalleryCard.propTypes = {
  asset: PropTypes.shape({
    contentType: PropTypes.string,
    displayName: PropTypes.string,
    externalUrl: PropTypes.string,
    id: PropTypes.string,
    dateAdded: PropTypes.number,
    locked: PropTypes.bool,
    portableUrl: PropTypes.string,
    thumbnail: PropTypes.string,
    url: PropTypes.string,
    duration: PropTypes.number,
    status: PropTypes.string,
    statusBadgeVariant: PropTypes.string,
    transcripts: PropTypes.array,
  }).isRequired,
};

export default GalleryCard;
