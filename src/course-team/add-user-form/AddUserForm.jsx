import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Form,
  ActionRow,
} from '@openedx/paragon';
import { Formik } from 'formik';

import messages from './messages';
import FormikControl from '../../generic/FormikControl';
import { EXAMPLE_USER_EMAIL } from '../constants';

const AddUserForm = ({ onSubmit, onCancel }) => {
  const intl = useIntl();

  return (
    <div className="add-user-form" data-testid="add-user-form">
      <Formik
        initialValues={{ email: '' }}
        onSubmit={onSubmit}
        validateOnBlur
      >
        {({ handleSubmit, values }) => (
          <>
            <Form.Group size="sm" className="form-field">
              <h3 className="form-title">{intl.formatMessage(messages.formTitle)}</h3>
              <Form.Label size="sm" className="form-label font-weight-bold">
                {intl.formatMessage(messages.formLabel)}
              </Form.Label>
              <FormikControl
                name="email"
                value={values.email}
                placeholder={intl.formatMessage(messages.formPlaceholder, { email: EXAMPLE_USER_EMAIL })}
              />
              <Form.Control.Feedback className="form-helper-text">
                {intl.formatMessage(messages.formHelperText)}
              </Form.Control.Feedback>
            </Form.Group>
            <ActionRow>
              <Button variant="tertiary" size="sm" onClick={onCancel}>
                {intl.formatMessage(messages.cancelButton)}
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!values.email.length}
                type="submit"
              >
                {intl.formatMessage(messages.addUserButton)}
              </Button>
            </ActionRow>
          </>
        )}
      </Formik>
    </div>
  );
};

AddUserForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default AddUserForm;
