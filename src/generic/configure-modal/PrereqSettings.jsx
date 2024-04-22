import React from 'react';
import PropTypes from 'prop-types';
import { Form } from '@openedx/paragon';
import { FormattedMessage, injectIntl, useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';

import FormikControl from '../FormikControl';

const PrereqSettings = ({
  values,
  setFieldValue,
  prereqs,
}) => {
  const intl = useIntl();
  const {
    isPrereq,
    prereqUsageKey,
    prereqMinScore,
    prereqMinCompletion,
  } = values;

  if (isPrereq === null || isPrereq === undefined) {
    return null;
  }

  const handleSelectChange = (e) => {
    setFieldValue('prereqUsageKey', e.target.value);
  };

  const prereqSelectionForm = () => (
    <>
      <h5 className="mt-4 text-gray-700"><FormattedMessage {...messages.limitAccessTitle} /></h5>
      <hr />
      <Form>
        <Form.Text><FormattedMessage {...messages.limitAccessDescription} /></Form.Text>
        <Form.Group controlId="prereqForm.select">
          <Form.Label>
            {intl.formatMessage(messages.prerequisiteSelectLabel)}
          </Form.Label>
          <Form.Control
            as="select"
            defaultValue={prereqUsageKey}
            onChange={handleSelectChange}
            role="combobox"
          >
            <option value="">
              {intl.formatMessage(messages.noPrerequisiteOption)}
            </option>
            {prereqs.map((prereqOption) => (
              <option
                key={prereqOption.blockUsageKey}
                value={prereqOption.blockUsageKey}
              >
                {prereqOption.blockDisplayName}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        {prereqUsageKey && (
          <>
            <FormikControl
              name="prereqMinScore"
              value={prereqMinScore}
              label={<Form.Label>{intl.formatMessage(messages.minScoreLabel)}</Form.Label>}
              controlClassName="text-right"
              controlClasses="w-7rem"
              type="number"
              trailingElement="%"
            />
            <FormikControl
              name="prereqMinCompletion"
              value={prereqMinCompletion}
              label={<Form.Label>{intl.formatMessage(messages.minCompletionLabel)}</Form.Label>}
              controlClassName="text-right"
              controlClasses="w-7rem"
              type="number"
              trailingElement="%"
            />
          </>
        )}
      </Form>
    </>
  );

  const handleCheckboxChange = e => setFieldValue('isPrereq', e.target.checked);

  return (
    <>
      {prereqs.length > 0 && prereqSelectionForm()}
      <h5 className="mt-4 text-gray-700"><FormattedMessage {...messages.prereqTitle} /></h5>
      <hr />
      <Form.Checkbox checked={isPrereq} onChange={handleCheckboxChange}>
        <FormattedMessage {...messages.prereqCheckboxLabel} />
      </Form.Checkbox>
    </>
  );
};

PrereqSettings.defaultProps = {
  prereqs: [],
};

PrereqSettings.propTypes = {
  values: PropTypes.shape({
    isPrereq: PropTypes.bool,
    prereqUsageKey: PropTypes.string,
    prereqMinScore: PropTypes.number,
    prereqMinCompletion: PropTypes.number,
  }).isRequired,
  prereqs: PropTypes.arrayOf(PropTypes.shape({
    blockUsageKey: PropTypes.string.isRequired,
    blockDisplayName: PropTypes.string.isRequired,
  })),
  setFieldValue: PropTypes.func.isRequired,
};

export default injectIntl(PrereqSettings);
