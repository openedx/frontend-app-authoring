import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Button, Container, Row, Col,
} from '@openedx/paragon';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import messages from './messages';
import { isLibraryV1Key } from '../../../generic/key-utils';
import { navigateTo } from '../../hooks';
import { selectors } from '../../data/redux';

/**
 * An error page that displays a generic message for unexpected errors.  Also contains a "Try
 * Again" button to refresh the page.
 */
const ErrorPage = ({
  message,
  studioEndpointUrl,
  learningContextId,
  // redux
  unitData,
  // injected
  intl,
}) => {
  const outlineType = isLibraryV1Key(learningContextId) ? 'library' : 'course';
  const outlineUrl = `${studioEndpointUrl}/${outlineType}/${learningContextId}`;
  const unitUrl = unitData?.data ? `${studioEndpointUrl}/container/${unitData?.data.ancestors[0].id}` : null;

  return (
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
          <Row className="justify-content-center">
            {learningContextId && (unitUrl && outlineType !== 'library' ? (
              <Button className="mr-2" variant="outline-primary" onClick={() => navigateTo(unitUrl)}>
                {intl.formatMessage(messages.returnToUnitPageLabel)}
              </Button>
            ) : (
              <Button className="mr-2" variant="outline-primary" onClick={() => navigateTo(outlineUrl)}>
                {intl.formatMessage(messages.returnToOutlineLabel, { outlineType })}
              </Button>
            ))}
            <Button className="ml-2" onClick={() => global.location.reload()}>
              {intl.formatMessage(messages.unexpectedErrorButtonLabel)}
            </Button>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

ErrorPage.propTypes = {
  message: PropTypes.string,
  learningContextId: PropTypes.string.isRequired,
  studioEndpointUrl: PropTypes.string.isRequired,
  // redux
  unitData: PropTypes.shape({
    data: PropTypes.shape({
      ancestors: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string,
        }),
      ),
    }),
  }),
  // injected
  intl: intlShape.isRequired,
};

ErrorPage.defaultProps = {
  message: null,
  unitData: null,
};

export const mapStateToProps = (state) => ({
  unitData: selectors.app.unitUrl(state),
});

export const ErrorPageInternal = ErrorPage; // For testing only
export default injectIntl(connect(mapStateToProps)(ErrorPage));
