import React from 'react';
import { Col } from '@edx/paragon';
import PropTypes from 'prop-types';

const LoadingPage = ({ loadingMessage }) => (
  <Col
    xs={12}
    className="justify-content-center d-flex"
    style={{
      height: '50vh',
    }}
  >
    <div className="spinner-border text-primary text-center align-self-center" role="status">
      {loadingMessage && (
        <span className="sr-only">
          {loadingMessage}
        </span>
      )}
    </div>
  </Col>
);

LoadingPage.propTypes = {
  loadingMessage: PropTypes.string.isRequired,
};

export const LoadGuard = ({ condition, children, loadingMessage }) => (
  <>
    {condition && children()}
    {condition || <LoadingPage loadingMessage={loadingMessage} />}
  </>
);

export default LoadingPage;

LoadGuard.propTypes = {
  loadingMessage: PropTypes.string.isRequired,
  children: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  condition: PropTypes.any.isRequired,
};
