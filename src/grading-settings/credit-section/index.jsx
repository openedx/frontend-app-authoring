import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Form } from '@openedx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './messages';

const CreditSection = ({
  intl, eligibleGrade, setShowSavePrompt, minimumGradeCredit, setGradingData, setShowSuccessAlert,
}) => {
  const [errorEffort, setErrorEffort] = useState(false);

  const handleCreditChange = (e) => {
    const { value } = e.target;

    setGradingData(prevData => ({
      ...prevData,
      minimumGradeCredit: value / 100,
    }));

    if (value <= eligibleGrade) {
      setErrorEffort(true);
      setShowSavePrompt(false);
      return;
    }

    setShowSavePrompt(true);
    setErrorEffort(false);
    setShowSuccessAlert(false);
  };

  return (
    <Form.Group
      className={classNames('form-group-custom w-50', {
        'form-group-custom_isInvalid': errorEffort,
      })}
    >
      <Form.Label className="grading-label">
        {intl.formatMessage(messages.creditEligibilityLabel)}
      </Form.Label>
      <Form.Control
        data-testid="minimum-grade-credit-input"
        type="number"
        min={0}
        value={Math.round(parseFloat(minimumGradeCredit) * 100) || ''}
        name="minimum_grade_credit"
        onChange={handleCreditChange}
      />
      <Form.Control.Feedback className="grading-description">
        {intl.formatMessage(messages.creditEligibilityDescription)}
      </Form.Control.Feedback>
      {errorEffort && (
        <Form.Control.Feedback className="feedback-error" type="invalid">
          {intl.formatMessage(messages.creditEligibilityErrorMsg)} {eligibleGrade}.
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

CreditSection.propTypes = {
  intl: intlShape.isRequired,
  eligibleGrade: PropTypes.number.isRequired,
  setShowSavePrompt: PropTypes.func.isRequired,
  setGradingData: PropTypes.func.isRequired,
  setShowSuccessAlert: PropTypes.func.isRequired,
  minimumGradeCredit: PropTypes.number.isRequired,
};

export default injectIntl(CreditSection);
