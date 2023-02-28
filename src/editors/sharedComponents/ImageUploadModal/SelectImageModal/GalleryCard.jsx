import React from 'react';
import PropTypes from 'prop-types';

import { Image, SelectableBox } from '@edx/paragon';
import { FormattedMessage, FormattedDate, FormattedTime } from '@edx/frontend-platform/i18n';

import messages from './messages';

export const GalleryCard = ({
  img,
}) => (
  <SelectableBox className="card bg-white" key={img.externalUrl} type="radio" value={img.id}>
    <div className="card-div d-flex flex-row flex-nowrap">
      <Image
        style={{ width: '100px', height: '100px' }}
        src={img.externalUrl}
      />
      <div className="img-text p-3">
        <h3>{img.displayName}</h3>
        <p>
          <FormattedMessage
            {...messages.addedDate}
            values={{
              date: <FormattedDate value={img.dateAdded} />,
              time: <FormattedTime value={img.dateAdded} />,
            }}
          />
        </p>
      </div>
    </div>
  </SelectableBox>
);

GalleryCard.propTypes = {
  img: PropTypes.shape({
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
};

export default GalleryCard;
