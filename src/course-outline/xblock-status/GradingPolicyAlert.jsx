import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Alert } from '@openedx/paragon';
import {
  WarningFilled as WarningIcon,
} from '@openedx/paragon/icons';

import messages from './messages';

const GradingPolicyAlert = ({
  graded,
  gradingType,
  courseGraders,
}) => {
  const intl = useIntl();

  let gradingPolicyMismatch = false;
  if (graded) {
    if (gradingType) {
      gradingPolicyMismatch = (
        courseGraders.filter((cg) => cg.toLowerCase() === gradingType.toLowerCase())
      ).length === 0;
    }
  }

  if (gradingPolicyMismatch) {
    return (
      <Alert className="mt-2 grading-mismatch-alert" variant="warning" icon={WarningIcon}>
        {intl.formatMessage(messages.gradingPolicyMismatchText, { gradingType })}
      </Alert>
    );
  }
  return null;
};

GradingPolicyAlert.defaultProps = {
  graded: false,
  gradingType: '',
  courseGraders: [],
};

GradingPolicyAlert.propTypes = {
  graded: PropTypes.bool,
  gradingType: PropTypes.string,
  courseGraders: PropTypes.arrayOf(PropTypes.string.isRequired),
};

export default GradingPolicyAlert;
