import React from 'react';
import PropTypes from 'prop-types';

import {
  Scrollable, SelectableBox, Spinner,
} from '@openedx/paragon';

import {
  FormattedMessage,
  useIntl,
} from '@edx/frontend-platform/i18n';

import messages from './messages';
import GalleryCard from './GalleryCard';

export const Gallery = ({
  galleryIsEmpty,
  searchIsEmpty,
  displayList,
  highlighted,
  onHighlightChange,
  emptyGalleryLabel,
  showIdsOnCards,
  height,
  isLoaded,
  thumbnailFallback,
}) => {
  const intl = useIntl();
  if (!isLoaded) {
    return (
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }}
      >
        <Spinner
          animation="border"
          className="mie-3"
          screenReaderText={intl.formatMessage(messages.loading)}
        />
      </div>
    );
  }
  if (galleryIsEmpty) {
    return (
      <div className="gallery p-4 bg-light-400" style={{ height, margin: '0 -1.5rem' }}>
        <FormattedMessage {...emptyGalleryLabel} />
      </div>
    );
  }
  if (searchIsEmpty) {
    return (
      <div className="gallery p-4 bg-light-400" style={{ height, margin: '0 -1.5rem' }}>
        <FormattedMessage {...messages.emptySearchLabel} />
      </div>
    );
  }
  return (
    <Scrollable className="gallery bg-light-400" style={{ height, margin: '0 -1.5rem' }}>
      <div className="p-4">
        <SelectableBox.Set
          columns={1}
          name="images"
          onChange={onHighlightChange}
          type="radio"
          value={highlighted}
        >
          { displayList.map(asset => (
            <GalleryCard
              key={asset.id}
              asset={asset}
              showId={showIdsOnCards}
              thumbnailFallback={thumbnailFallback}
            />
          )) }
        </SelectableBox.Set>
      </div>
    </Scrollable>
  );
};

Gallery.defaultProps = {
  highlighted: '',
  showIdsOnCards: false,
  height: '375px',
  show: true,
  thumbnailFallback: undefined,
};
Gallery.propTypes = {
  show: PropTypes.bool,
  isLoaded: PropTypes.bool.isRequired,
  galleryIsEmpty: PropTypes.bool.isRequired,
  searchIsEmpty: PropTypes.bool.isRequired,
  displayList: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  highlighted: PropTypes.string,
  onHighlightChange: PropTypes.func.isRequired,
  emptyGalleryLabel: PropTypes.shape({}).isRequired,
  showIdsOnCards: PropTypes.bool,
  height: PropTypes.string,
  thumbnailFallback: PropTypes.element,
};

export default Gallery;
