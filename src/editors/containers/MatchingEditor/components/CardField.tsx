import { useIntl } from '@edx/frontend-platform/i18n';
import { Container, Form } from '@openedx/paragon';

import messages from '@src/editors/containers/MatchingEditor/messages';
import { CardSideType, MatchingState } from '@src/editors/containers/MatchingEditor/types';
import { useFormikContext } from 'formik';

interface CardFieldProps {
  side: CardSideType;
  index: number;
}

/** One text field of a card, one of a pair of cards for matching. */
const CardField = ({
  side,
  index,
}: CardFieldProps) => {
  const intl = useIntl();

  const { values, setFieldValue } = useFormikContext<MatchingState>();
  const pair = values.pairs[index];

  return (
    <Container fluid className="px-4">
      <Form.Group>
        <Form.Label>
          <h4 className="mt-4">
            {intl.formatMessage(side == 'left' ? messages.leftCardLabel : messages.rightCardLabel)}
          </h4>
        </Form.Label>
        <Form.Control
          placeholder={intl.formatMessage(messages.startTypingHere)}
          as="textarea"
          autoResize={true}
          value={pair[side].text}
          onChange={(e) => setFieldValue(`pairs.${index}.${side}.text`, e.target.value)}
        />
      </Form.Group>
    </Container>
  );
};

export default CardField;
