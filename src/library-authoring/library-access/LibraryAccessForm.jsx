/*
Form for adding a new Library user.
 */
import {
  Button, Card, Icon, Row, StatefulButton, Form,
} from '@edx/paragon';
import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { LIBRARY_ACCESS, libraryShape, SUBMISSION_STATUS } from '../common/data';
import messages from './messages';
import commonMessages from '../common/messages';
import {
  addUser, clearAccessErrors, libraryAccessInitialState, selectLibraryAccess,
} from './data';

/**
 * LibraryAccessForm:
 * Template component for the form used to add a new user to a library.
 */
const LibraryAccessForm = ({
  intl, onSubmit, setShowAdd, hasFieldError, getFieldError, data,
  onValueChange, submitButtonState,
}) => (
  <Row className="mb-4">
    <form className="col-12" onSubmit={onSubmit}>
      <Card>
        <Card.Header
          title={intl.formatMessage(messages['library.access.form.title'])}
        />
        <Card.Section>
          <div className="form-create">
            <fieldset>
              <ol className="list-input list-unstyled">
                <li className="field">
                  <Form.Group
                    controlId="email"
                    isInvalid={hasFieldError('email')}
                    className="mb-0 mr-2"
                  >
                    <Form.Label className="large d-block" htmlFor="email">
                      {intl.formatMessage(messages['library.access.form.email.label'])}
                    </Form.Label>
                    <Form.Control
                      name="email"
                      id="email"
                      type="text"
                      placeholder={intl.formatMessage(messages['library.access.form.email.placeholder'])}
                      value={data.email}
                      onChange={onValueChange}
                    />
                    <Form.Text className="form-text text-muted">
                      {intl.formatMessage(messages['library.access.form.email.help'])}
                    </Form.Text>
                    {hasFieldError('email') && (
                    <Form.Control.Feedback hasIcon={false} type="invalid">
                      {getFieldError('email')}
                    </Form.Control.Feedback>
                    )}
                  </Form.Group>
                </li>
              </ol>
            </fieldset>
          </div>
        </Card.Section>
        <Card.Section className="pt-0">
          <Button size="sm" variant="tertiary" onClick={() => setShowAdd(false)}>
            {intl.formatMessage(commonMessages['library.common.forms.button.cancel'])}
          </Button>
          <StatefulButton
            variant="primary"
            type="submit"
            size="sm"
            state={submitButtonState}
            labels={{
              disabled: intl.formatMessage(commonMessages['library.common.forms.button.submit']),
              enabled: intl.formatMessage(commonMessages['library.common.forms.button.submit']),
              pending: intl.formatMessage(commonMessages['library.common.forms.button.submitting']),
            }}
            icons={{
              pending: <Icon className="fa fa-spinner fa-spin" />,
            }}
            disabledStates={['disabled', 'pending']}
          />
        </Card.Section>
      </Card>
    </form>
  </Row>
);

LibraryAccessForm.propTypes = {
  intl: intlShape.isRequired,
  data: PropTypes.shape({
    email: PropTypes.string, access_level: PropTypes.string,
  }).isRequired,
  onValueChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  setShowAdd: PropTypes.func.isRequired,
  hasFieldError: PropTypes.func.isRequired,
  getFieldError: PropTypes.func.isRequired,
  submitButtonState: PropTypes.string.isRequired,
};

const initialFormState = () => ({
  email: '',
  access_level: LIBRARY_ACCESS.READ,
});

/**
 * LibraryAccessFormContainer:
 * Container for the LibraryAccessForm. This wraps LibraryAccessForm
 * and handles state for it, and manages the API call for adding a
 * new user to a library team.
 */
const LibraryAccessFormContainer = (props) => {
  const [data, setData] = useState({
    email: '',
    access_level: LIBRARY_ACCESS.READ,
  });

  const onSubmit = useCallback((event) => {
    event.preventDefault();
    props.addUser({ libraryId: props.library.id, data }).then(() => {
      setData(initialFormState());
    }).catch(() => undefined);
  }, [props, data]);

  const onValueChange = useCallback((event) => {
    const { name, value } = event.target;
    setData(current => (
      {
        ...current,
        [name]: value,
      }
    ));
  }, [setData]);

  const hasFieldError = (fieldName) => !!(props.errorFields && (fieldName in props.errorFields));

  const getFieldError = (fieldName) => {
    if (hasFieldError(fieldName)) {
      return props.errorFields[fieldName];
    }
    return null;
  };

  let submitButtonState;
  if (props.submissionStatus === SUBMISSION_STATUS.SUBMITTING) {
    submitButtonState = 'pending';
  } else if (data.email.match(/.+@.+[.].+/)) {
    submitButtonState = 'enabled';
  } else {
    submitButtonState = 'disabled';
  }

  return (
    <LibraryAccessForm
      intl={props.intl}
      library={props.library}
      data={data}
      submitButtonState={submitButtonState}
      clearAccessErrors={props.clearAccessErrors}
      hasFieldError={hasFieldError}
      getFieldError={getFieldError}
      onValueChange={onValueChange}
      onSubmit={onSubmit}
      setShowAdd={props.setShowAdd}
    />
  );
};

LibraryAccessFormContainer.defaultProps = libraryAccessInitialState;

LibraryAccessFormContainer.propTypes = {
  intl: intlShape.isRequired,
  library: libraryShape.isRequired,
  clearAccessErrors: PropTypes.func.isRequired,
  addUser: PropTypes.func.isRequired,
  setShowAdd: PropTypes.func.isRequired,
  submissionStatus: PropTypes.oneOf(Object.values(SUBMISSION_STATUS)).isRequired,
  errorFields: PropTypes.shape({
    email: PropTypes.string,
  }),
};

export const RawLibraryAccessFormContainer = LibraryAccessFormContainer;

export default connect(
  selectLibraryAccess,
  {
    clearAccessErrors,
    addUser,
  },
)(injectIntl(LibraryAccessFormContainer));
