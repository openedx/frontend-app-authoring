import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Row, Col, Form } from '@openedx/paragon';
import { DeleteOutline } from '@openedx/paragon/icons';

import messages from '@src/editors/containers/FlashcardsEditor/messages';
import { CardSideType, FlashcardsState } from '@src/editors/containers/FlashcardsEditor/types';
import { useContext } from 'react';
import { FlashcardsEditorContext } from '@src/editors/containers/FlashcardsEditor/context';
import { useFormikContext } from 'formik';

interface CardImageProps {
  url: string;
  index: number;
  field: CardSideType;
  onRemove: () => void;
}

/** A card's image, which opens its settings when activated, and its Remove button. */
export const CardImage = ({
  url,
  index,
  field,
  onRemove,
}: CardImageProps) => {
  const intl = useIntl();
  const { staticRootUrl } = useContext(FlashcardsEditorContext);
  const { values, setFieldValue } = useFormikContext<FlashcardsState>();

  return (
    <Row>
      <Col xs={12} sm={4} className="d-flex justify-content-center align-items-center">
        <img
          className="py-4"
          style={{ maxHeight: '200px', maxWidth: '100%' }}
          src={staticRootUrl + url}
          alt={values.cards[index][field].image.alt}
        />
      </Col>
      <Col xs={12} sm={8}>
        <Form.Group>
          <Form.Label>{intl.formatMessage(messages.altTextLabel)}</Form.Label>
          <Form.Control
            placeholder={intl.formatMessage(messages.altTextPlaceholder)}
            as="textarea"
            autoResize={true}
            value={values.cards[index][field].image.alt}
            onChange={(e) => setFieldValue(`cards.${index}.${field}.image.alt`, e.target.value)}
          />
        </Form.Group>
        <Button
          className="p-0"
          iconBefore={DeleteOutline}
          onClick={onRemove}
          variant="link"
        >
          {intl.formatMessage(messages.removeImageLabel)}
        </Button>
      </Col>
    </Row>
  );
};
