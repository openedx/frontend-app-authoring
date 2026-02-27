import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Image } from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import BaseModal from '../../sharedComponents/BaseModal';
import AltTextControls from '../../sharedComponents/ImageUploadModal/ImageSettingsModal/AltTextControls';
import ErrorAlert from '../../sharedComponents/ErrorAlerts/ErrorAlert';
import * as hooks from '../../sharedComponents/ImageUploadModal/ImageSettingsModal/hooks';
import messages from './messages';
import './GameImageSettingsModal.scss';

/**
 * Simplified image settings modal for game editor flashcards
 * Only includes alt-text controls, excludes width/height dimensions
 * @param {bool} isOpen - is the modal open?
 * @param {func} close - close the modal
 * @param {obj} imageData - current image data object with url and altText
 * @param {func} onSave - save callback with updated alt text
 */
const GameImageSettingsModal = ({
  close,
  isOpen,
  imageData,
  onSave,
}) => {
  const intl = useIntl();
  const altText = hooks.altTextHooks(imageData?.altText || '');

  useEffect(() => {
    if (imageData && isOpen) {
      altText.setValue(imageData.altText || '');
      altText.setIsDecorative(!imageData.altText || imageData.altText === '');
    }
  }, [imageData?.altText, imageData?.url, isOpen]);

  const handleSave = () => {
    if (!altText.isDecorative && !altText.value?.trim()) {
      altText.error.set();
      return;
    }

    onSave({
      altText: altText.isDecorative ? '' : altText.value,
      isDecorative: altText.isDecorative,
    });
    close();
  };

  if (!imageData) {
    return null;
  }

  return (
    <BaseModal
      close={close}
      confirmAction={(
        <Button
          variant="primary"
          onClick={handleSave}
        >
          <FormattedMessage {...messages.saveButtonLabel} />
        </Button>
      )}
      isOpen={isOpen}
      title={intl.formatMessage(messages.imageSettingsTitle)}
    >
      <ErrorAlert
        dismissError={altText.error.dismiss}
        hideHeading
        isError={altText.error.show}
      >
        <FormattedMessage {...messages.altTextError} />
      </ErrorAlert>
      <div className="d-flex flex-row m-2 game-img-settings-container">
        <div className="game-img-thumbnail-container">
          <Image
            className="game-img-thumbnail"
            src={imageData.url}
            alt={imageData.altText || ''}
          />
        </div>
        <hr className="h-100 bg-primary-200 m-0 mx-3" />
        <div className="game-img-settings-controls">
          <AltTextControls {...altText} />
        </div>
      </div>
    </BaseModal>
  );
};

GameImageSettingsModal.propTypes = {
  close: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  imageData: PropTypes.shape({
    url: PropTypes.string.isRequired,
    altText: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
};

GameImageSettingsModal.defaultProps = {
  imageData: null,
};

export default GameImageSettingsModal;
