import { useContext, useId } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Form } from '@openedx/paragon';

import { default as uploadWidgetMessages } from '@src/editors/sharedComponents/UploadWidget/messages';
import messages from '@src/editors/containers/FlashcardsEditor/messages';
import { CardSideType, FlashcardsState } from '../types';
import { useFormikContext } from 'formik';
import { CardImage } from './CardImage';
import { UploadWidget } from '@src/editors/sharedComponents/UploadWidget';
import { FlashcardsEditorContext } from '../context';

// The block's limit on either text field of a card.
// This is not enforced on the backend.
// TODO: determine if a limit is desirable or not, and make the frontend and backend consistent.
export const MAX_FIELD_LENGTH = 120;

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
}

/** One text field of a card, the term or the definition, with its image and length count. */
const CardField = ({
  field,
  index,
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
          onOpenSettings={() => {/* TODO */}}
          onRemove={async () => {
            await setFieldValue(`cards.${index}.${field}.image.url`, '');
            await setFieldValue(`cards.${index}.${field}.image.alt`, '');
          }}
        />
      )}
      <div className="d-flex flex-column align-items-start align-self-stretch">
        <div className="d-flex align-items-start align-self-stretch text-gray-500">
          <Form.Control
            className="d-flex flex-column align-items-start align-self-stretch"
            id={id}
            placeholder={intl.formatMessage(text.placeholder)}
            value={card[field].text}
            onChange={(e) => setFieldValue(`cards.${index}.${field}.text`, e.target.value)}
            style={{ borderRadius: 0 }}
            maxLength={MAX_FIELD_LENGTH}
          />
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
        </div>
        <div className="d-flex justify-content-between align-items-center align-self-stretch mr-5">
          <small className="text-muted mr-1">
            {card[field].image.url.length}/{MAX_FIELD_LENGTH}
          </small>
        </div>
      </div>
    </div>
  );
};

export default CardField;
