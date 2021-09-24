import React from 'react';
import PropTypes from 'prop-types';
import { Form, TransitionReplace } from '@edx/paragon';

function FormikFieldFeedback({
  renderCondition,
  feedback,
  type,
  hasIcon,
  feedbackClasses,
  transitionClasses,
}) {
  return (
    <TransitionReplace className={transitionClasses}>
      {renderCondition ? (
        <React.Fragment key="open">
          <Form.Control.Feedback type={type} hasIcon={hasIcon} key={`${feedback}-feedback`}>
            <div className={`small ${feedbackClasses}`}>{feedback}</div>
          </Form.Control.Feedback>
        </React.Fragment>
      ) : (
        <React.Fragment key="close" />
      )}
    </TransitionReplace>
  );
}

FormikFieldFeedback.propTypes = {
  feedback: PropTypes.string.isRequired,
  type: PropTypes.string,
  renderCondition: PropTypes.bool.isRequired,
  hasIcon: PropTypes.bool,
  feedbackClasses: PropTypes.string,
  transitionClasses: PropTypes.string,
};

FormikFieldFeedback.defaultProps = {
  type: 'default',
  hasIcon: false,
  feedbackClasses: '',
  transitionClasses: '',
};

export default FormikFieldFeedback;
