import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Form, TransitionReplace } from '@edx/paragon';
import FormSwitchGroup from '../../../../../generic/FormSwitchGroup';
import messages from './messages';
import AppConfigFormDivider from './AppConfigFormDivider';

function DivisionByGroupFields({
  onBlur,
  onChange,
  intl,
  values,
}) {
  return (
    <>
      <h5 className="text-gray-500">{intl.formatMessage(messages.divisionByGroup)}</h5>

      <FormSwitchGroup
        onChange={onChange}
        className="mt-3"
        onBlur={onBlur}
        id="divideByCohorts"
        checked={values.divideByCohorts}
        label={intl.formatMessage(messages.divideByCohortsLabel)}
        helpText={intl.formatMessage(messages.divideByCohortsHelp)}
      />
      <TransitionReplace>
        {values.divideByCohorts ? (
          <React.Fragment key="open">
            <AppConfigFormDivider />
            <FormSwitchGroup
              onChange={onChange}
              onBlur={onBlur}
              className="ml-4 mt-3"
              id="divideCourseWideTopics"
              checked={values.divideCourseWideTopics}
              label={intl.formatMessage(messages.divideCourseWideTopicsLabel)}
              helpText={intl.formatMessage(messages.divideCourseWideTopicsHelp)}
            />
            <Form.Group className="ml-4">
              <Form.Check
                id="divideGeneralTopic"
                onChange={onChange}
                onBlur={onBlur}
                checked={values.divideGeneralTopic}
                label={intl.formatMessage(messages.divideGeneralTopic)}
              />
              <Form.Check
                id="divideQuestionsForTAsTopic"
                onChange={onChange}
                onBlur={onBlur}
                checked={values.divideQuestionsForTAsTopic}
                label={intl.formatMessage(messages.divideQuestionsForTAsTopic)}
              />
            </Form.Group>
          </React.Fragment>
        ) : <React.Fragment key="closed" />}
      </TransitionReplace>
    </>
  );
}

DivisionByGroupFields.propTypes = {
  onBlur: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  values: PropTypes.shape({
    divideByCohorts: PropTypes.bool,
    divideCourseWideTopics: PropTypes.bool,
    divideGeneralTopic: PropTypes.bool,
    divideQuestionsForTAsTopic: PropTypes.bool,
  }).isRequired,
};

export default injectIntl(DivisionByGroupFields);
