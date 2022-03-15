import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { Button, Image } from '@edx/paragon';
import { thunkActions } from '../../../data/redux';
import BaseModal from './BaseModal';
import * as module from './SelectImageModal';

export const hooks = {
  imageList: ({ fetchImages }) => {
    const [images, setImages] = React.useState([]);
    React.useEffect(() => {
      fetchImages({ onSuccess: setImages });
    }, []);
    return images;
  },
  onSelectClick: ({ setSelection, images }) => () => setSelection(images[0]),
};

export const SelectImageModal = ({
  fetchImages,
  isOpen,
  close,
  setSelection,
}) => {
  const images = module.hooks.imageList({ fetchImages });
  const onSelectClick = module.hooks.onSelectClick({
    setSelection,
    images,
  });

  return (
    <BaseModal
      isOpen={isOpen}
      close={close}
      title="Add an image"
      confirmAction={<Button variant="primary" onClick={onSelectClick}>Next</Button>}
    >
      {/* Content selection */}
      {images.map(
        img => (
          <div key={img.externalUrl}>
            <Image style={{ width: '100px', height: '100px' }} src={img.externalUrl} />
          </div>
        ),
      )}
    </BaseModal>
  );
};

SelectImageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  setSelection: PropTypes.func.isRequired,
  // redux
  fetchImages: PropTypes.func.isRequired,
};

export const mapStateToProps = () => ({});
export const mapDispatchToProps = {
  fetchImages: thunkActions.app.fetchImages,
};

export default connect(mapStateToProps, mapDispatchToProps)(SelectImageModal);
