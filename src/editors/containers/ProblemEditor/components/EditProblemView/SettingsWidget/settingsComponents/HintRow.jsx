import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Col, Container, Form, Icon, IconButton, Row,
} from '@edx/paragon';
import { Delete } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import messages from '../messages';

export const HintRow = ({
  value,
  handleChange,
  handleDelete,
  // inject
  intl,
}) => (
  <Container fluid>
    <Row>
      <Col xs={10}>
        <Form.Group>
          <Form.Control
            value={value}
            onChange={handleChange}
            floatingLabel={intl.formatMessage(messages.hintInputLabel)}
          />
        </Form.Group>
      </Col>

      <Col xs={2}>
        <IconButton
          src={Delete}
          iconAs={Icon}
          alt={intl.formatMessage(messages.settingsDeleteIconAltText)}
          onClick={handleDelete}
          variant="secondary"
        />
      </Col>
    </Row>
  </Container>
);

HintRow.propTypes = {
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(HintRow);
