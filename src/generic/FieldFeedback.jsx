import React from 'react';
import PropTypes from 'prop-types';
import { Form, TransitionReplace } from '@openedx/paragon';

const FieldFeedback = ({
  feedbackClasses,
  transitionClasses,
  errorCondition,
  feedbackCondition,
  feedbackMessage,
  errorMessage,
}) => (
  <>
    <TransitionReplace className={transitionClasses}>
      {feedbackCondition ? (
        <React.Fragment key="open1">
          <Form.Control.Feedback type="default" hasIcon={false} key={`${feedbackMessage}-feedback`}>
            <div className={`small ${feedbackClasses}`}>{feedbackMessage}</div>
          </Form.Control.Feedback>
        </React.Fragment>
      ) : <React.Fragment key="close1" />}
    </TransitionReplace>

    <TransitionReplace>
      {errorCondition ? (
        <React.Fragment key="open">
          <Form.Control.Feedback type="invalid" hasIcon={false} key={`${errorMessage}-feedback`}>
            <div className={`small ${feedbackClasses}`}>{errorMessage}</div>
          </Form.Control.Feedback>
        </React.Fragment>
      ) : <React.Fragment key="close" />}
    </TransitionReplace>
  </>
);

FieldFeedback.propTypes = {
  errorCondition: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  feedbackMessage: PropTypes.string,
  feedbackCondition: PropTypes.bool,
  feedbackClasses: PropTypes.string,
  transitionClasses: PropTypes.string,
};

FieldFeedback.defaultProps = {
  feedbackClasses: '',
  transitionClasses: '',
  feedbackMessage: '',
  feedbackCondition: false,
  errorMessage: '',
};

export default React.memo(FieldFeedback);
