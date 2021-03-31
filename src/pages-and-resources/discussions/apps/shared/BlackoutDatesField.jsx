import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Form } from '@edx/paragon';
import messages from './messages';

export const blackoutDatesRegex = /^\[(\[("[0-9]{4}-(0[1-9]|1[0-2])-[0-3][0-9](T([0-1][0-9]|2[0-3]):([0-5][0-9])){0,1}"),("[0-9]{4}-(0[1-9]|1[0-2])-[0-3][0-9](T([0-1][0-9]|2[0-3]):([0-5][0-9])){0,1}")\](,){0,1})+\]$/;

function BlackoutDatesField({
  onBlur,
  onChange,
  intl,
  values,
  errors,
}) {
  return (
    <>
      <h5 className="mb-3">{intl.formatMessage(messages.blackoutDates)}</h5>
      <Form.Group
        controlId="blackoutDates"
      >
        <Form.Control
          value={values.blackoutDates}
          onChange={onChange}
          onBlur={onBlur}
          floatingLabel={intl.formatMessage(messages.blackoutDatesLabel)}
        />
        {errors.blackoutDates && (
          <Form.Control.Feedback type="invalid">
            {errors.blackoutDates}
          </Form.Control.Feedback>
        )}
        <Form.Text muted>
          {intl.formatMessage(messages.blackoutDatesHelp)}
        </Form.Text>
      </Form.Group>
    </>
  );
}

BlackoutDatesField.propTypes = {
  onBlur: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  values: PropTypes.shape({
    blackoutDates: PropTypes.string,
  }).isRequired,
  errors: PropTypes.shape({
    blackoutDates: PropTypes.string,
  }).isRequired,
};

export default injectIntl(BlackoutDatesField);
