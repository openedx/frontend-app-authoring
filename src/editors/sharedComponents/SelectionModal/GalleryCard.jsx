import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Icon,
  Image,
  SelectableBox,
} from '@edx/paragon';
import { FormattedMessage, FormattedDate, FormattedTime } from '@edx/frontend-platform/i18n';
import { Link } from '@edx/paragon/icons';

import messages from './messages';

export const GalleryCard = ({
  asset,
  showId,
}) => (
  <SelectableBox className="card bg-white" key={asset.externalUrl} type="radio" value={asset.id}>
    <div className="card-div d-flex flex-row flex-nowrap">
      <Image
        style={{ width: '100px', height: '100px' }}
        src={asset.externalUrl}
      />
      <div className="img-text p-3">
        <h3>{asset.displayName}</h3>
        { showId && (
          <p>
            <Button variant="link" size="inline" onClick={() => { /* TODO */ }}>
              <Icon src={Link} /> {asset.id}
            </Button>
          </p>
        )}
        <p>
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

GalleryCard.defaultProps = {
  showId: false,
};

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
  }).isRequired,
  showId: PropTypes.bool,
};

export default GalleryCard;
