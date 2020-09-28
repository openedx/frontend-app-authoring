import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import {
  Button, Icon, Input, StatefulButton, Alert, ValidationFormGroup,
} from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import {
  LIBRARY_TYPES,
  SUBMISSION_STATUS,
  libraryShape,
  truncateErrorMessage,
} from '../common';
import {
  clearFormError,
  createLibrary,
  libraryCreateInitialState,
  resetForm,
  selectLibraryCreate,
} from './data';

import commonMessages from '../common/messages';
import messages from './messages';

class LibraryCreateForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: {
        title: '',
        org: '',
        slug: '',
        type: LIBRARY_TYPES.COMPLEX,
      },
    };
  }

  componentDidMount() {
    this.props.resetForm();
  }

  componentDidUpdate(prevProps) {
    /* Redirect on submission success. */
    const { status, createdLibrary } = this.props;
    if (
      status !== prevProps.status
      && status === SUBMISSION_STATUS.SUBMITTED
      && createdLibrary !== prevProps.createdLibrary
      && createdLibrary !== null
    ) {
      if (createdLibrary.type === LIBRARY_TYPES.COMPLEX) {
        this.props.history.push(createdLibrary.url);
      } else if (createdLibrary.type === LIBRARY_TYPES.LEGACY) {
        window.location.href = createdLibrary.url;
      }
    }
  }

  onValueChange = (event) => {
    const { name, value } = event.target;
    this.setState(state => ({
      data: {
        ...state.data,
        [name]: value,
      },
    }));
  }

  onCancel = () => {
    this.props.resetForm();
    this.props.hideForm();
  }

  onSubmit = (event) => {
    event.preventDefault();
    this.props.createLibrary({ data: this.state.data });
  }

  hasFieldError = (fieldName) => {
    const { errorFields } = this.props;

    if (errorFields && (fieldName in errorFields)) {
      return true;
    }

    return false;
  }

  getFieldError = (fieldName) => {
    if (this.hasFieldError(fieldName)) {
      return this.props.errorFields[fieldName];
    }

    return null;
  }

  formIsValid = () => {
    const { data } = this.state;

    if (data.title && data.org && data.slug) {
      return true;
    }

    return false;
  }

  getSubmitButtonState = () => {
    const { status } = this.props;

    let state;
    if (status === SUBMISSION_STATUS.SUBMITTING) {
      state = 'pending';
    } else if (this.formIsValid()) {
      state = 'enabled';
    } else {
      state = 'disabled';
    }

    return state;
  }

  handleDismissAlert = () => {
    this.props.clearFormError();
  }

  render() {
    const { intl, errorMessage } = this.props;
    const { data } = this.state;

    return (
      <form onSubmit={this.onSubmit} className="form-create">
        <h3 className="title">{intl.formatMessage(messages['library.form.create.library'])}</h3>
        <fieldset>
          {errorMessage
          && (
          <Alert
            variant="danger"
            onClose={this.handleDismissAlert}
            dismissible
          >
            {truncateErrorMessage(errorMessage)}
          </Alert>
          )}
          <ol className="list-input">
            <li className="field">
              <ValidationFormGroup
                for="title"
                helpText={intl.formatMessage(messages['library.form.title.help'])}
                invalid={this.hasFieldError('title')}
                invalidMessage={this.getFieldError('title')}
                className="mb-0 mr-2"
              >
                <label className="h6 d-block" htmlFor="title">
                  {intl.formatMessage(messages['library.form.title.label'])}
                </label>
                <Input
                  name="title"
                  id="title"
                  type="text"
                  placeholder={intl.formatMessage(messages['library.form.title.placeholder'])}
                  defaultValue={data.title}
                  onChange={this.onValueChange}
                />
              </ValidationFormGroup>
            </li>
            <li className="field">
              <ValidationFormGroup
                for="org"
                helpText={intl.formatMessage(messages['library.form.org.help'])}
                invalid={this.hasFieldError('org')}
                invalidMessage={this.getFieldError('org')}
                className="mb-0 mr-2"
              >
                <label className="h6 d-block" htmlFor="org">
                  {intl.formatMessage(messages['library.form.org.label'])}
                </label>
                <Input
                  name="org"
                  id="org"
                  type="text"
                  placeholder={intl.formatMessage(messages['library.form.org.placeholder'])}
                  value={data.org}
                  onChange={this.onValueChange}
                />
              </ValidationFormGroup>
            </li>
            <li className="field">
              <ValidationFormGroup
                for="slug"
                helpText={intl.formatMessage(messages['library.form.slug.help'])}
                invalid={this.hasFieldError('slug')}
                invalidMessage={this.getFieldError('slug')}
                className="mb-0 mr-2"
              >
                <label className="h6 d-block" htmlFor="slug">
                  {intl.formatMessage(messages['library.form.slug.label'])}
                </label>
                <Input
                  name="slug"
                  id="slug"
                  type="text"
                  placeholder={intl.formatMessage(messages['library.form.slug.placeholder'])}
                  value={data.slug}
                  onChange={this.onValueChange}
                />
              </ValidationFormGroup>
            </li>
            <li className="field">
              <ValidationFormGroup
                for="type"
                helpText={intl.formatMessage(messages['library.form.type.help'])}
                invalid={this.hasFieldError('type')}
                invalidMessage={this.getFieldError('type')}
                className="mb-0 mr-2"
              >
                <label className="h6 d-block" htmlFor="type">
                  {intl.formatMessage(messages['library.form.type.label'])}
                </label>
                <Input
                  name="type"
                  id="type"
                  type="select"
                  value={data.type}
                  options={Object.values(LIBRARY_TYPES).map(value => ({
                    value,
                    label: intl.formatMessage(messages[`library.form.type.label.${value}`]),
                  }))}
                  onChange={this.onValueChange}
                />
              </ValidationFormGroup>
            </li>
          </ol>
        </fieldset>
        <div className="actions form-group">
          <StatefulButton
            state={this.getSubmitButtonState()}
            labels={{
              disabled: intl.formatMessage(commonMessages['library.common.forms.button.submit']),
              enabled: intl.formatMessage(commonMessages['library.common.forms.button.submit']),
              pending: intl.formatMessage(commonMessages['library.common.forms.button.submitting']),
            }}
            icons={{
              pending: <Icon className="fa fa-spinner fa-spin" />,
            }}
            disabledStates={['disabled', 'pending']}
            className="action btn-primary"
            type="submit"
          />
          <Button
            className="action btn-light"
            onClick={this.onCancel}
          >
            {intl.formatMessage(commonMessages['library.common.forms.button.cancel'])}
          </Button>
        </div>
      </form>
    );
  }
}

LibraryCreateForm.propTypes = {
  clearFormError: PropTypes.func.isRequired,
  createdLibrary: libraryShape,
  createLibrary: PropTypes.func.isRequired,
  errorFields: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  errorMessage: PropTypes.string,
  hideForm: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  intl: intlShape.isRequired,
  resetForm: PropTypes.func.isRequired,
  status: PropTypes.oneOf(Object.values(SUBMISSION_STATUS)).isRequired,
};

LibraryCreateForm.defaultProps = libraryCreateInitialState;

export default connect(
  selectLibraryCreate,
  {
    clearFormError,
    createLibrary,
    resetForm,
  },
)(injectIntl(withRouter(LibraryCreateForm)));
