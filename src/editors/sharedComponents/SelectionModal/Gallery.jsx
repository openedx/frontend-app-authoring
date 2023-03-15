import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
  Scrollable, SelectableBox, Spinner,
} from '@edx/paragon';

import {
  FormattedMessage,
  injectIntl,
  intlShape,
  MessageDescriptor,
} from '@edx/frontend-platform/i18n';

import { selectors } from '../../data/redux';
import { RequestKeys } from '../../data/constants/requests';

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
  // injected
  intl,
  // redux
  isLoaded,
}) => {
  if (!isLoaded) {
    return (
      <Spinner
        animation="border"
        className="mie-3"
        screenReaderText={intl.formatMessage(messages.loading)}
      />
    );
  }
  if (galleryIsEmpty) {
    return (
      <div className="gallery p-4 bg-gray-100" style={{ height }}>
        <FormattedMessage {...emptyGalleryLabel} />
      </div>
    );
  }
  if (searchIsEmpty) {
    return (
      <div className="gallery p-4 bg-gray-100" style={{ height }}>
        <FormattedMessage {...messages.emptySearchLabel} />
      </div>
    );
  }
  return (
    <Scrollable className="gallery bg-gray-100" style={{ height }}>
      <div className="p-4">
        <SelectableBox.Set
          columns={1}
          name="images"
          onChange={onHighlightChange}
          type="radio"
          value={highlighted}
        >
          { displayList.map(asset => <GalleryCard key={asset.id} asset={asset} showId={showIdsOnCards} />) }
        </SelectableBox.Set>
      </div>
    </Scrollable>
  );
};

Gallery.defaultProps = {
  highlighted: '',
  showIdsOnCards: false,
  height: '375px',
  emptyGalleryLabel: null,
};
Gallery.propTypes = {
  galleryIsEmpty: PropTypes.bool.isRequired,
  searchIsEmpty: PropTypes.bool.isRequired,
  displayList: PropTypes.arrayOf(PropTypes.object).isRequired,
  highlighted: PropTypes.string,
  onHighlightChange: PropTypes.func.isRequired,
  emptyGalleryLabel: MessageDescriptor,
  showIdsOnCards: PropTypes.bool,
  height: PropTypes.string,
  // injected
  intl: intlShape.isRequired,
  // redux
  isLoaded: PropTypes.bool.isRequired,
};

const requestKey = RequestKeys.fetchAssets;
export const mapStateToProps = (state) => ({
  isLoaded: selectors.requests.isFinished(state, { requestKey }),
});

export const mapDispatchToProps = {};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(Gallery));
