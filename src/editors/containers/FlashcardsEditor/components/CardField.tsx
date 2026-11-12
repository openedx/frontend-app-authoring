import { useContext, useId } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Form } from '@openedx/paragon';

import { default as uploadWidgetMessages } from '@src/editors/sharedComponents/UploadWidget/messages';
import messages from '@src/editors/containers/FlashcardsEditor/messages';
import { CardSideType, FlashcardsState, ImageSettings } from '@src/editors/containers/FlashcardsEditor/types';
import { useFormikContext } from 'formik';
import { CardImage } from './CardImage';
import { UploadWidget } from '@src/editors/sharedComponents/UploadWidget';
import { FlashcardsEditorContext } from '@src/editors/containers/FlashcardsEditor/context';

const ACCEPTED_IMAGES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

const fieldMessages = {
  term: {
    label: messages.termLabel,
    placeholder: messages.enterYourTerm,
    required: messages.termValidationError,
  },
  definition: {
    label: messages.definitionLabel,
    placeholder: messages.enterYourDefinition,
    required: messages.definitionValidationError,
  },
} as const;

interface CardFieldProps {
  field: CardSideType;
  index: number;
  onOpenSettings: (imageSettings: ImageSettings) => void;
}

/** One text field of a card, the term or the definition, with its image and length count. */
const CardField = ({
  field,
  index,
  onOpenSettings,
}: CardFieldProps) => {
  const id = useId();

  const intl = useIntl();
  const text = fieldMessages[field];

  const { isLibrary, blockId } = useContext(FlashcardsEditorContext);
  const { values, setFieldValue } = useFormikContext<FlashcardsState>();
  const card = values.cards[index];

  return (
    <div
      className={`d-flex flex-column align-items-start align-self-stretch p-4 text-primary-500 font-weight-bold`}
    >
      <Form.Label htmlFor={id} className="mb-2">
        {intl.formatMessage(text.label)}
      </Form.Label>
      {card[field].image.url !== '' && (
        <CardImage
          url={card[field].image.url}
          altText={card[field].image.alt || card[field].text}
          index={index}
          imageType={field}
          onOpenSettings={() => {
            onOpenSettings({
              index,
              cardSide: field,
              altText: card[field].image.alt,
              url: card[field].image.url,
            });
          }}
          onRemove={async () => {
            await setFieldValue(`cards.${index}.${field}.image.url`, '');
            await setFieldValue(`cards.${index}.${field}.image.alt`, '');
          }}
        />
      )}
      <div className="d-flex flex-column w-100">
        <UploadWidget
          messages={{
            ...uploadWidgetMessages,
            courseFileHint: messages.courseFileHint,
            libraryFileHint: messages.libraryFileHint,
          }}
          supportedFileFormats={ACCEPTED_IMAGES}
          urlFieldName={`cards.${index}.${field}.image.url`}
          label={intl.formatMessage(messages.addImageLabel)}
          blockId={blockId}
          isLibrary={isLibrary}
          id="pdf-url"
        />
        <Form.Control
          id={id}
          placeholder={intl.formatMessage(text.placeholder)}
          value={card[field].text}
          onChange={(e) => setFieldValue(`cards.${index}.${field}.text`, e.target.value)}
        />
      </div>
    </div>
  );
};

export default CardField;
