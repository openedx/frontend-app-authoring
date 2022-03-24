import React from 'react';
import PropTypes from 'prop-types';

import {
  Scrollable, SelectableBox, Spinner,
} from '@edx/paragon';

import GalleryCard from './GalleryCard';

export const Gallery = ({
  loading,
  displayList,
  highlighted,
  onHighlightChange,
}) => {
  if (loading) {
    return <Spinner animation="border" className="mie-3" screenReaderText="loading" />;
  }
  return (
    <Scrollable className="gallery bg-gray-100" style={{ height: '375px' }}>
      <div className="p-4">
        <SelectableBox.Set
          columns={1}
          name="images"
          onChange={onHighlightChange}
          type="radio"
          value={highlighted}
        >
          {displayList.map(img => <GalleryCard img={img} />)}
        </SelectableBox.Set>
      </div>
    </Scrollable>
  );
};

Gallery.defaultProps = {
  loading: false,
};
Gallery.propTypes = {
  loading: PropTypes.bool,
  displayList: PropTypes.arrayOf(PropTypes.object).isRequired,
  highlighted: PropTypes.string.isRequired,
  onHighlightChange: PropTypes.func.isRequired,
};

export default Gallery;
