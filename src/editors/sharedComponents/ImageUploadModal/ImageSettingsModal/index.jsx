import React from 'react';
import PropTypes from 'prop-types';

import { Button, Image } from '@openedx/paragon';
import { ArrowBackIos } from '@openedx/paragon/icons';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import './index.scss';
import * as hooks from './hooks';
import messages from './messages';
import BaseModal from '../../BaseModal';
import AltTextControls from './AltTextControls';
import DimensionControls from './DimensionControls';
import ErrorAlert from '../../ErrorAlerts/ErrorAlert';

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
const ImageSettingsModal = ({
  close,
  isOpen,
  returnToSelection,
  saveToEditor,
  selection,
  // inject
  intl,
}) => {
  const altText = hooks.altTextHooks(selection.altText);
  const dimensions = hooks.dimensionHooks(altText);
  const onSaveClick = hooks.onSaveClick({
    altText,
    dimensions: dimensions.value,
    isDecorative: altText.isDecorative,
    saveToEditor,
  });
  return (
    <BaseModal
      close={close}
      confirmAction={(
        <Button
          variant="primary"
          onClick={onSaveClick}
        >
          <FormattedMessage {...messages.saveButtonLabel} />
        </Button>
      )}
      isOpen={isOpen}
      title={intl.formatMessage(messages.titleLabel)}
    >
      <ErrorAlert
        dismissError={altText.error.dismiss}
        hideHeading
        isError={altText.error.show}
      >
        <FormattedMessage {...messages.altTextError} />
      </ErrorAlert>
      <Button
        iconBefore={ArrowBackIos}
        onClick={returnToSelection}
        size="inline"
        variant="link"
      >
        <FormattedMessage {...messages.replaceImageButtonLabel} />
      </Button>
      <br />
      <div className="d-flex flex-row m-2 img-settings-form-container">
        <div className="img-settings-thumbnail-container">
          <Image
            className="img-settings-thumbnail"
            onError={dimensions.onImgLoad(selection)}
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
  close: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  returnToSelection: PropTypes.func.isRequired,
  saveToEditor: PropTypes.func.isRequired,
  selection: PropTypes.shape({
    altText: PropTypes.string,
    externalUrl: PropTypes.string,
    url: PropTypes.string,
  }).isRequired,
  // inject
  intl: intlShape.isRequired,
};
export const ImageSettingsModalInternal = ImageSettingsModal; // For testing only
export default injectIntl(ImageSettingsModal);
