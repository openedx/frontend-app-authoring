import type { ReactNode } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Form, Icon, IconButton } from '@openedx/paragon';

import messages from '@src/editors/containers/FlashcardsEditor/messages';
import PictureIcon from './PictureIcon';

// The block's limit on either text field of a card.
// This is not enforced on the backend.
// TODO: determine if a limit is desirable or not, and make the frontend and backend consistent.
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
  field: 'term' | 'definition';
  index: number;
  value: string;
  onChange: (value: string) => void;
  /** The field's current image, if it has one. */
  image: ReactNode;
  /** Adds or replaces the field's image. */
  onClickUpload: () => void;
}

/** One text field of a card, the term or the definition, with its image and length count. */
const CardField = ({
  field,
  index,
  value,
  onChange,
  image,
  onClickUpload,
}: CardFieldProps) => {
  const intl = useIntl();
  const text = fieldMessages[field];
  const id = `${field}|${index}`;
  return (
    <div
      className={`d-flex flex-column align-items-start align-self-stretch p-4 text-primary-500 font-weight-bold`}
    >
      <Form.Label htmlFor={id} className="mb-2">
        {intl.formatMessage(text.label)}
      </Form.Label>
      {image}
      <div className="d-flex flex-column align-items-start align-self-stretch">
        <div className="d-flex align-items-start align-self-stretch text-gray-500">
          <Form.Control
            className="d-flex flex-column align-items-start align-self-stretch"
            id={id}
            placeholder={intl.formatMessage(text.placeholder)}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ borderRadius: 0 }}
            maxLength={MAX_FIELD_LENGTH}
          />
          <IconButton
            src={PictureIcon}
            iconAs={Icon}
            alt={intl.formatMessage(messages.addImageLabel)}
            variant="dark"
            onClick={onClickUpload}
          />
        </div>
        <div className="d-flex justify-content-between align-items-center align-self-stretch mr-5">
          <small className="text-muted mr-1">
            {value.length}/{MAX_FIELD_LENGTH}
          </small>
        </div>
      </div>
    </div>
  );
};

export default CardField;
