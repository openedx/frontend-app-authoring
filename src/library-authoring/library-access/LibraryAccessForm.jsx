/*
Form for adding a new Library user.
 */
import {
  Button, Card, Icon, Input, Row, StatefulButton, ValidationFormGroup,
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
const LibraryAccessForm = (
  {
    intl, onSubmit, setShowAdd, hasFieldError, getFieldError, data,
    onValueChange, submitButtonState,
  },
) => (
  <>
    <Row className="mb-2">
      <form className="col-12" onSubmit={onSubmit}>
        <Card>
          <Card.Body>
            <div className="form-create">
              <Card.Title>{intl.formatMessage(messages['library.access.form.title'])}</Card.Title>
              <fieldset>
                <ol className="list-input">
                  <li className="field">
                    <ValidationFormGroup
                      for="title"
                      helpText={intl.formatMessage(messages['library.access.form.email.help'])}
                      invalid={hasFieldError('email')}
                      invalidMessage={getFieldError('email')}
                      className="mb-0 mr-2"
                    >
                      <label className="h6 d-block" htmlFor="email">
                        {intl.formatMessage(messages['library.access.form.email.label'])}
                      </label>
                      <Input
                        name="email"
                        id="email"
                        type="text"
                        placeholder={intl.formatMessage(messages['library.access.form.email.placeholder'])}
                        value={data.email}
                        onChange={onValueChange}
                      />
                    </ValidationFormGroup>
                  </li>
                </ol>
              </fieldset>
            </div>
          </Card.Body>
        </Card>
        <Card className="mb-5">
          <Card.Body>
            <StatefulButton
              variant="primary"
              type="submit"
              size="lg"
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
              className="font-weight-bold text-uppercase"
            />
            <Button size="lg" variant="secondary" className="mx-3 font-weight-bold text-uppercase" onClick={() => setShowAdd(false)}>
              {intl.formatMessage(commonMessages['library.common.forms.button.cancel'])}
            </Button>
          </Card.Body>
        </Card>
      </form>
    </Row>
  </>
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
const LibraryAccessFormContainer = (
  props,
) => {
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

export default connect(
  selectLibraryAccess,
  {
    clearAccessErrors,
    addUser,
  },
)(injectIntl(LibraryAccessFormContainer));
