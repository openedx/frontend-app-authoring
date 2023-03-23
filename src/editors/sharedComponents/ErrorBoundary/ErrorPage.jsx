import React from 'react';
import PropTypes from 'prop-types';
import {
  Button, Container, Row, Col,
} from '@edx/paragon';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import messages from './messages';

/**
 * An error page that displays a generic message for unexpected errors.  Also contains a "Try
 * Again" button to refresh the page.
 */
export const ErrorPage = ({
  message,
  // injected
  intl,
}) => (
  <Container fluid className="py-5 justify-content-center align-items-start text-center">
    <Row>
      <Col>
        <p className="text-muted">
          {intl.formatMessage(messages.unexpectedError)}
        </p>
        {message && (
          <div role="alert" className="my-4">
            <p>{message}</p>
          </div>
        )}
        <Button onClick={global.location.reload()}>
          {intl.formatMessage(messages.unexpectedErrorButtonLabel)}
        </Button>
      </Col>
    </Row>
  </Container>
);

ErrorPage.propTypes = {
  message: PropTypes.string,
  // injected
  intl: intlShape.isRequired,
};

ErrorPage.defaultProps = {
  message: null,
};

export default injectIntl(ErrorPage);
