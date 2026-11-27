import { useIntl } from '@edx/frontend-platform/i18n';
import { Col, Row } from '@openedx/paragon';

import messages from '@src/editors/containers/MatchingEditor/messages';
import { Pair } from '@src/editors/containers/MatchingEditor/types';

/** The one-line summary a collapsed card shows in its heading. */
export const PairPreview = ({ pair }: { pair: Pair; }) => {
  const intl = useIntl();
  return (
    <Row className="w-100 mr-2">
      <Col className="d-inline-flex align-items-center text-truncate">
        {pair.left.text !== ''
          ? pair.left.text
          : <span className="text-gray">{intl.formatMessage(messages.noTextLabel)}</span>}
      </Col>
      <Col className="d-inline-flex align-items-center text-truncate border-left">
        {pair.right.text !== ''
          ? pair.right.text
          : <span className="text-gray">{intl.formatMessage(messages.noTextLabel)}</span>}
      </Col>
    </Row>
  );
};
