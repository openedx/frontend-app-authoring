import type { ReactNode } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Form, Stack } from '@openedx/paragon';

import type { FieldError, TextField } from '@src/editors/containers/GamesEditor/gameContent';
import messages from '@src/editors/containers/GamesEditor/messages';

/** The block's limit on either text field of a card. */
export const MAX_FIELD_LENGTH = 120;

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
  field: TextField;
  /** The card's id: every deck may render a card at the same position. */
  cardId: string;
  value: string;
  error: FieldError | undefined;
  onChange: (value: string) => void;
  /** Flashcards carry images; matching cards are text only. */
  withImages: boolean;
  /** The field's current image, if it has one. */
  image: ReactNode;
  /** Adds or replaces the field's image; absent on matching cards. */
  uploadButton: ReactNode;
}

/** One text field of a card, the term or the definition, with its image and length count. */
const CardField = ({
  field,
  cardId,
  value,
  error,
  onChange,
  withImages,
  image,
  uploadButton,
}: CardFieldProps) => {
  const intl = useIntl();
  const text = fieldMessages[field];
  const id = `${field}|${cardId}`;
  return (
    <Stack
      direction="vertical"
      gap={3}
      className={`card-${field} align-items-start align-self-stretch p-4 text-primary-500 font-weight-bold`}
    >
      <Form.Label htmlFor={id} className="mb-0">
        {intl.formatMessage(text.label)}
      </Form.Label>
      {image}
      <div className={`${field}-input-area d-flex flex-column align-items-start align-self-stretch`}>
        <div className="card-input-line d-flex align-items-start align-self-stretch text-gray-500">
          <Form.Control
            className="d-flex flex-column align-items-start align-self-stretch"
            id={id}
            placeholder={intl.formatMessage(text.placeholder)}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ borderRadius: 0 }}
            maxLength={MAX_FIELD_LENGTH}
            isInvalid={!!error}
          />
          {uploadButton}
        </div>
        <div
          className={`d-flex justify-content-between align-items-center align-self-stretch ${withImages ? 'mr-5' : ''}`}
        >
          <span>
            {error && (
              <Form.Control.Feedback type="invalid" hasIcon={false}>
                {intl.formatMessage(error === 'imageWithoutText' ? messages.imageWithoutTextError : text.required)}
              </Form.Control.Feedback>
            )}
          </span>
          <small className="text-muted mr-1">
            {value.length}/{MAX_FIELD_LENGTH}
          </small>
        </div>
      </div>
    </Stack>
  );
};

export default CardField;
