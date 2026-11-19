import { useContext, useId } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Container, Form } from '@openedx/paragon';

import { default as uploadWidgetMessages } from '@src/editors/sharedComponents/UploadWidget/messages';
import messages from '@src/editors/containers/FlashcardsEditor/messages';
import { CardSideType, FlashcardsState } from '@src/editors/containers/FlashcardsEditor/types';
import { useFormikContext } from 'formik';
import { CardImage } from './CardImage';
import { UploadWidget } from '@src/editors/sharedComponents/UploadWidget';
import { FlashcardsEditorContext } from '@src/editors/containers/FlashcardsEditor/context';

const ACCEPTED_IMAGES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

interface CardFieldProps {
  field: CardSideType;
  index: number;
}

/** One text field of a card, the front or the back, with its image and length count. */
const CardField = ({
  field,
  index,
}: CardFieldProps) => {
  const uploadWidgetId = useId();
  const intl = useIntl();

  const { isLibrary, blockId } = useContext(FlashcardsEditorContext);
  const { values, setFieldValue } = useFormikContext<FlashcardsState>();
  const card = values.cards[index];

  return (
    <Container fluid className="px-4">
      <h3 className="mt-4">
        {intl.formatMessage(field == 'front' ? messages.frontOfCardLabel : messages.backOfCardLabel)}
      </h3>
      <Form.Group>
        <Form.Label>{intl.formatMessage(messages.textFieldLabel)}</Form.Label>
        <Form.Control
          placeholder={intl.formatMessage(messages.startTypingHere)}
          as="textarea"
          autoResize={true}
          value={card[field].text}
          onChange={(e) => setFieldValue(`cards.${index}.${field}.text`, e.target.value)}
        />
      </Form.Group>
      <UploadWidget
        className="p-0"
        messages={{
          ...uploadWidgetMessages,
          courseFileHint: messages.courseFileHint,
          libraryFileHint: messages.libraryFileHint,
        }}
        supportedFileFormats={ACCEPTED_IMAGES}
        urlFieldName={`cards.${index}.${field}.image.url`}
        label={intl.formatMessage(messages.imageFieldLabel)}
        blockId={blockId}
        isLibrary={isLibrary}
        id={uploadWidgetId}
      />
      {card[field].image.url !== '' && (
        <CardImage
          url={card[field].image.url}
          index={index}
          field={field}
          onRemove={async () => {
            await setFieldValue(`cards.${index}.${field}.image.url`, '');
            await setFieldValue(`cards.${index}.${field}.image.alt`, '');
          }}
        />
      )}
    </Container>
  );
};

export default CardField;
