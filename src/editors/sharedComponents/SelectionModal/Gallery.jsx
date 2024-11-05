import React from 'react';
import PropTypes from 'prop-types';

import { Spinner } from '@openedx/paragon';
import {
  FormattedMessage,
  useIntl,
} from '@edx/frontend-platform/i18n';

// SelectableBox in paragon has a bug where you can't change selection. So we override it
import SelectableBox from '../SelectableBox';
import messages from './messages';
import GalleryCard from './GalleryCard';
import GalleryLoadMoreButton from './GalleryLoadMoreButton';

const Gallery = ({
  galleryIsEmpty,
  searchIsEmpty,
  displayList,
  highlighted,
  onHighlightChange,
  emptyGalleryLabel,
  showIdsOnCards,
  height,
  isLoaded,
  isLibrary,
  thumbnailFallback,
  allowLazyLoad,
  fetchNextPage,
  assetCount,
}) => {
  const intl = useIntl();

  if (!isLoaded && !allowLazyLoad) {
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
    <div className="p-4 gallery bg-light-400" style={{ height, margin: '0 -1.5rem' }}>
      <SelectableBox.Set
        columns={1}
        name="images"
        onChange={onHighlightChange}
        type="radio"
        value={highlighted}
      >
        {displayList.map(asset => (
          <GalleryCard
            key={asset.id}
            asset={asset}
            showId={showIdsOnCards}
            thumbnailFallback={thumbnailFallback}
          />
        )) }
      </SelectableBox.Set>
      {(allowLazyLoad && !isLibrary) && (
        <GalleryLoadMoreButton
          {...{
            fetchNextPage,
            assetCount,
            displayListLength: displayList.length,
            isLoaded,
          }}
        />
      )}
    </div>
  );
};

Gallery.defaultProps = {
  highlighted: '',
  showIdsOnCards: false,
  height: '375px',
  show: true,
  thumbnailFallback: undefined,
  allowLazyLoad: false,
  fetchNextPage: null,
  assetCount: 0,
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
  isLibrary: PropTypes.bool,
  showIdsOnCards: PropTypes.bool,
  height: PropTypes.string,
  thumbnailFallback: PropTypes.element,
  allowLazyLoad: PropTypes.bool,
  fetchNextPage: PropTypes.func,
  assetCount: PropTypes.number,
};

export default Gallery;
