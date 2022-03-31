import React from 'react';
import PropTypes from 'prop-types';
import { Button, Image } from '@edx/paragon';
import { ArrowBackIos } from '@edx/paragon/icons';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import BaseModal from '../BaseModal';

import AltTextControls from './AltTextControls';
import DimensionControls from './DimensionControls';
import hooks from './hooks';
import messages from './messages';
import './index.scss';

/**
 * Modal display wrapping the dimension and alt-text controls for image tags
 * inserted into the TextEditor TinyMCE context.
 * Provides a thumbnail and populates dimension and alt-text controls.
 * @param {bool} isOpen - is the modal open?
 * @param {func} close - close the modal
 * @param {obj} selection - current image selection object
 * @param {func} saveToEditor - save the current settings to the editor
 * @param {func} returnToSelection - return to image selection
 */
export const ImageSettingsModal = ({
  isOpen,
  close,
  selection,
  saveToEditor,
  returnToSelection,
  // inject
  intl,
}) => {
  const dimensions = hooks.dimensions();
  const altText = hooks.altText();
  const onSaveClick = hooks.onSaveClick({
    saveToEditor,
    dimensions: dimensions.value,
    altText: altText.value,
    isDecorative: altText.isDecorative,
  });
  return (
    <BaseModal
      title={intl.formatMessage(messages.titleLabel)}
      close={close}
      isOpen={isOpen}
      confirmAction={(
        <Button
          variant="primary"
          onClick={onSaveClick}
          disabled={hooks.isSaveDisabled(altText)}
        >
          <FormattedMessage {...messages.saveButtonLabel} />
        </Button>
      )}
    >
      <Button
        onClick={returnToSelection}
        variant="link"
        size="inline"
        iconBefore={ArrowBackIos}
      >
        <FormattedMessage {...messages.replaceImageButtonLabel} />
      </Button>
      <br />
      <div className="d-flex flex-row m-2 img-settings-form-container">
        <div className="img-settings-thumbnail-container">
          <Image
            className="img-settings-thumbnail"
            onLoad={dimensions.onImgLoad(selection)}
            src={selection.externalUrl}
          />
        </div>
        <hr className="h-100 bg-primary-200 m-0" />
        <div className="img-settings-form-controls">
          <DimensionControls {...dimensions} />
          <AltTextControls {...altText} />
        </div>
      </div>
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
  // inject
  intl: intlShape.isRequired,
};
export default injectIntl(ImageSettingsModal);
