import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Form, Stack } from '@openedx/paragon';

import messages from './messages';

const GradeRequirements = ({
  errorEffort,
  entranceExamMinimumScorePct,
  onChange,
}) => (
  <Form.Group
    className={classNames('form-group-custom', {
      'form-group-custom_isInvalid': errorEffort,
    })}
  >
    <Form.Label>
      <FormattedMessage {...messages.requirementsEntranceCollapseLabel} />
    </Form.Label>
    <Stack direction="horizontal" className="w-25">
      <Form.Control
        type="number"
        min={1}
        max={100}
        value={entranceExamMinimumScorePct}
        onChange={(e) => onChange(e.target.value, 'entranceExamMinimumScorePct')}
        trailingElement="%"
      />
    </Stack>
    {errorEffort && (
      <Form.Control.Feedback className="feedback-error">
        {errorEffort}
      </Form.Control.Feedback>
    )}
    <Form.Control.Feedback>
      <FormattedMessage {...messages.requirementsEntranceCollapseHelpText} />
    </Form.Control.Feedback>
  </Form.Group>
);

GradeRequirements.defaultProps = {
  errorEffort: '',
  entranceExamMinimumScorePct: '',
};

GradeRequirements.propTypes = {
  errorEffort: PropTypes.string,
  entranceExamMinimumScorePct: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default GradeRequirements;
