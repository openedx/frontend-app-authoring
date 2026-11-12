import { Button, Form, Image } from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import BaseModal from '@src/editors/sharedComponents/BaseModal';
import messages from '@src/editors/containers/FlashcardsEditor/messages';
import { FlashcardsState, ImageSettings } from '@src/editors/containers/FlashcardsEditor/types';
import { useState } from 'react';
import { useFormikContext } from 'formik';

interface FlashcardsImageSettingsModalProps {
  imageSettings: ImageSettings;
  onClose: () => void;
}

/**
 * Simplified image settings modal for editor flashcards
 * Only includes alt text controls, excludes width/height dimensions
 *
 * NOTE: alt text is optional here, because the image alt text defaults to the term or definition text.
 */
export const FlashcardsImageSettingsModal = ({ imageSettings, onClose }: FlashcardsImageSettingsModalProps) => {
  const intl = useIntl();
  const { setFieldValue } = useFormikContext<FlashcardsState>();
  const [altText, setAltText] = useState(imageSettings?.altText || '');

  console.debug('XXX imageSettings in FlashcardsImageSettingsModal', imageSettings);

  return (
    <BaseModal
      close={onClose}
      confirmAction={
        <Button
          variant="primary"
          onClick={async () => {
            await setFieldValue(`cards.${imageSettings.index}.${imageSettings.cardSide}.image.alt`, altText);
            onClose();
          }}
        >
          <FormattedMessage {...messages.saveButtonLabel} />
        </Button>
      }
      isOpen
      title={intl.formatMessage(messages.imageSettingsTitle)}
    >
      <div className="d-flex flex-row m-2">
        <div className="d-flex align-items-center justify-content-center" style={{ width: '250px' }}>
          <Image
            style={{ maxWidth: '250px', maxHeight: '250px', objectFit: 'contain' }}
            src={imageSettings.url}
          />
        </div>
        <div className="flex-grow-1 ml-3" style={{ minWidth: '375px' }}>
          <Form.Group>
            <Form.Control
              floatingLabel={intl.formatMessage(messages.altTextLabel)}
              onChange={(e) => setAltText(e.target.value)}
              type="input"
              value={altText}
            />
          </Form.Group>
        </div>
      </div>
    </BaseModal>
  );
};
