import React from 'react';
import { Button, Form, Image } from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import BaseModal from '@src/editors/sharedComponents/BaseModal';
import ErrorAlert from '@src/editors/sharedComponents/ErrorAlerts/ErrorAlert';
import messages from '../messages';
import type { ImageData } from '../types';
import './GameImageSettingsModal.scss';

/**
 * Alt-text state for one image. Mounted fresh per image (the parent keys this
 * component), so it starts from that image and needs no re-sync on open. The
 * image editors' shared alt-text hook reads Formik context, which this editor
 * does not use. An empty saved alt text is the "decorative" choice.
 */
const useAltText = (savedText: string) => {
  const [value, setValue] = React.useState(savedText);
  const [isDecorative, setIsDecorative] = React.useState(savedText === '');
  const [showError, setShowError] = React.useState(false);

  return {
    value,
    setValue: (next: string) => {
      setValue(next);
      if (next) { setShowError(false); }
    },
    isDecorative,
    setIsDecorative: (next: boolean) => {
      setIsDecorative(next);
      if (next) { setShowError(false); }
    },
    error: {
      show: showError,
      set: () => setShowError(true),
      dismiss: () => setShowError(false),
    },
  };
};

interface Props {
  /** The image being edited. The modal is open for as long as it is mounted. */
  imageData: ImageData;
  /** Close without saving (Cancel, the close icon). */
  close: () => void;
  /** Save callback, given the updated alt text. The parent closes the modal. */
  onSave: (result: { altText: string; isDecorative: boolean; }) => void;
  /** Blocks Save while the editor itself is saving, so a change cannot be lost. */
  isSaveDisabled?: boolean;
}

/**
 * Simplified image settings modal for game editor flashcards
 * Only includes alt-text controls, excludes width/height dimensions
 */
const GameImageSettingsModal = ({
  close,
  imageData,
  onSave,
  isSaveDisabled = false,
}: Props) => {
  const intl = useIntl();
  const altText = useAltText(imageData.altText || '');

  const handleSave = () => {
    if (!altText.isDecorative && !altText.value?.trim()) {
      altText.error.set();
      return;
    }

    onSave({
      altText: altText.isDecorative ? '' : altText.value,
      isDecorative: altText.isDecorative,
    });
  };

  return (
    <BaseModal
      close={close}
      confirmAction={
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isSaveDisabled}
        >
          <FormattedMessage {...messages.saveButtonLabel} />
        </Button>
      }
      isOpen
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
          <Form.Group className="mb-1">
            <Form.Checkbox
              checked={altText.isDecorative}
              className="mt-2.5 decorative-control-label"
              onChange={(e) => altText.setIsDecorative(e.target.checked)}
            >
              <Form.Label>
                <FormattedMessage {...messages.decorativeAltTextLabel} />
              </Form.Label>
            </Form.Checkbox>
          </Form.Group>
          <Form.Group>
            <Form.Control
              disabled={altText.isDecorative}
              floatingLabel={intl.formatMessage(messages.altTextLabel)}
              isInvalid={altText.error.show}
              onChange={(e) => altText.setValue(e.target.value)}
              type="input"
              value={altText.value}
            />
          </Form.Group>
        </div>
      </div>
    </BaseModal>
  );
};

export default GameImageSettingsModal;
