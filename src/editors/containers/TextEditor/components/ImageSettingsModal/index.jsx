import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Form,
  Image,
} from '@edx/paragon';

import BaseModal from '../BaseModal';
import * as module from '.';

export const hooks = {
  dimensions: () => {
    const [baseDimensions, setBaseDimensions] = React.useState(null);
    const [dimensions, setDimensions] = React.useState(null);
    const initialize = ({ height, width }) => {
      setBaseDimensions({ height, width });
      setDimensions({ height, width });
    };
    const reset = () => setDimensions(baseDimensions);
    const setWidth = (width) => setDimensions({ ...dimensions, width });
    const setHeight = (height) => setDimensions({ ...dimensions, height });
    return {
      value: dimensions,
      initialize,
      reset,
      setHeight,
      setWidth,
    };
  },
  altText: (savedText) => {
    const [altText, setAltText] = React.useState(savedText || '');
    const [isDecorative, setIsDecorative] = React.useState(false);
    return {
      value: altText,
      set: setAltText,
      isDecorative,
      setIsDecorative,
    };
  },
  onImgLoad: (initializeDimensions, selection) => ({ target: img }) => {
    initializeDimensions({
      height: selection.height ? selection.height : img.naturalHeight,
      width: selection.width ? selection.width : img.naturalWidth,
    });
  },
  onInputChange: (handleValue) => (e) => handleValue(e.target.value),
  onCheckboxChange: (handleValue) => (e) => handleValue(e.target.checked),
  onSave: ({
    saveToEditor,
    dimensions,
    altText,
    isDecorative,
  }) => saveToEditor({
    dimensions,
    altText,
    isDecorative,
  }),
};

export const ImageSettingsModal = ({
  isOpen,
  close,
  selection,
  saveToEditor,
  returnToSelection,
}) => {
  const dimensions = module.hooks.dimensions();
  const altText = module.hooks.altText(selection.altText);
  const onImgLoad = module.hooks.onImgLoad(dimensions.initialize, selection);
  const onSaveClick = () => module.hooks.onSave({
    saveToEditor,
    dimensions: dimensions.value,
    altText: altText.value,
    isDecorative: altText.isDecorative,
  });
  return (
    <BaseModal
      title="Image Settings"
      close={close}
      isOpen={isOpen}
      confirmAction={(
        <Button variant="primary" onClick={onSaveClick}>
          Save
        </Button>
      )}
    >
      <Button onClick={returnToSelection} variant="link" size="inline">
        Select another image
      </Button>
      <br />
      <Image
        style={{ maxWidth: '200px', maxHeight: '200px' }}
        onLoad={onImgLoad}
        src={selection.externalUrl}
      />
      { dimensions.value && (
        <Form.Group>
          <Form.Label>Image Dimensions</Form.Label>
          <Form.Control
            type="number"
            value={dimensions.value.width}
            min={0}
            onChange={module.hooks.onInputChange(dimensions.setWidth)}
            floatingLabel="Width"
          />
          <Form.Control
            type="number"
            value={dimensions.value.height}
            min={0}
            onChange={module.hooks.onInputChange(dimensions.setHeight)}
            floatingLabel="Height"
          />
        </Form.Group>
      )}
      <Form.Group>
        <Form.Label>Accessibility</Form.Label>
        <Form.Control
          type="input"
          value={altText.value}
          disabled={altText.isDecorative}
          onChange={module.hooks.onInputChange(altText.set)}
          floatingLabel="Alt Text"
        />
        <Form.Checkbox
          checked={altText.isDecorative}
          onChange={module.hooks.onCheckboxChange(altText.setIsDecorative)}
        >
          This image is decorative (no alt text required).
        </Form.Checkbox>
      </Form.Group>
    </BaseModal>
  );
};

ImageSettingsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  selection: PropTypes.shape({
    url: PropTypes.string,
    externalUrl: PropTypes.string,
    altText: PropTypes.bool,
  }).isRequired,
  saveToEditor: PropTypes.func.isRequired,
  returnToSelection: PropTypes.func.isRequired,
};
export default ImageSettingsModal;
