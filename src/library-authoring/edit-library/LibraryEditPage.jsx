import React from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Button,
  Form,
  Icon,
  Input,
  StatefulButton,
  ValidationFormGroup,
} from '@edx/paragon';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';

import { LoadingPage } from '../../generic';
import {
  LOADING_STATUS,
  SUBMISSION_STATUS,
  libraryShape,
  truncateErrorMessage,
  LIBRARY_TYPES,
} from '../common';
import {
  fetchLibraryDetail,
} from '../library-detail';
import {
  clearError,
  libraryEditInitialState,
  selectLibraryEdit,
  updateLibrary,
} from './data';
import messages from './messages';
import { LicenseFieldContainer } from '../common/LicenseField';

class LibraryEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        libraryId: null,
        title: '',
        description: '',
        type: null,
        allow_public_learning: false,
        allow_public_read: false,
        license: null,
      },
    };
  }

  componentDidMount() {
    if (this.props.library === null) {
      const { libraryId } = this.props.match.params;
      this.props.fetchLibraryDetail({ libraryId });
    } else {
      this.syncLibraryData();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.library !== prevProps.library) {
      this.syncLibraryData();
    }

    if (
      this.props.submissionStatus !== prevProps.submissionStatus
      && this.props.submissionStatus === SUBMISSION_STATUS.SUBMITTED
    ) {
      this.props.history.push(this.props.library.url);
    }
  }

  syncLibraryData = () => {
    const { library } = this.props;
    this.setState({
      data: {
        libraryId: library.id,
        title: library.title,
        description: library.description,
        type: library.type,
        allow_public_learning: library.allow_public_learning,
        allow_public_read: library.allow_public_read,
        license: library.license,
      },
    });
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

    if (data.libraryId && data.title && data.description) {
      return true;
    }

    return false;
  }

  getSubmitButtonState = () => {
    const { submissionStatus } = this.props;

    let state;
    if (submissionStatus === SUBMISSION_STATUS.SUBMITTING) {
      state = 'pending';
    } else if (this.formIsValid()) {
      state = 'enabled';
    } else {
      state = 'disabled';
    }

    return state;
  }

  handleDismissAlert = () => {
    this.props.clearError();
  }

  mockInputChange = (name) => (value) => this.handleValueChange({ target: { value, name, type: 'text' } })

  handleValueChange = (event) => {
    const el = event.target;
    this.setState(state => ({
      data: {
        ...state.data,
        [el.name]: el.type === 'checkbox' ? el.checked : el.value,
      },
    }));
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.props.updateLibrary({ data: this.state.data });
  }

  componentWillUnmount = () => {
    this.props.clearError();
  }

  handleCancel = () => {
    this.props.history.push(this.props.library.url);
  }

  renderLoading() {
    const { intl } = this.props;

    return (
      <LoadingPage loadingMessage={intl.formatMessage(messages['library.edit.loading.message'])} />
    );
  }

  renderContent() {
    const { errorMessage, intl, library } = this.props;
    const { data } = this.state;

    const validTypes = Object.values(LIBRARY_TYPES).filter((type) => type !== LIBRARY_TYPES.LEGACY);
    const typeOptions = validTypes.map((value) => (
      { value, label: intl.formatMessage(messages[`library.edit.type.label.${value}`]) }
    ));

    return (
      <div className="library-edit-wrapper">
        <div className="wrapper-mast wrapper">
          <header className="mast has-actions has-navigation has-subtitle">
            <div className="page-header">
              <small className="subtitle">{intl.formatMessage(messages['library.edit.page.heading'])}</small>
              <h1 className="page-header-title">{library.title}</h1>
            </div>
          </header>
        </div>
        <div className="wrapper-content wrapper">
          <section className="content">
            <article className="content-primary" role="main">
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
              <Form onSubmit={this.handleSubmit} className="form-create">
                <fieldset>
                  <ol className="list-input">
                    <li className="field">
                      <ValidationFormGroup
                        for="title"
                        helpText={intl.formatMessage(messages['library.edit.title.help'])}
                        invalid={this.hasFieldError('title')}
                        invalidMessage={this.getFieldError('title')}
                        className="mb-0 mr-2"
                      >
                        <label className="h6 d-block" htmlFor="title">
                          {intl.formatMessage(messages['library.edit.title.label'])}
                        </label>
                        <Input
                          name="title"
                          id="title"
                          type="text"
                          placeholder={intl.formatMessage(messages['library.edit.title.placeholder'])}
                          defaultValue={data.title}
                          onChange={this.handleValueChange}
                        />
                      </ValidationFormGroup>
                    </li>
                    <li className="field">
                      <ValidationFormGroup
                        for="description"
                        helpText={intl.formatMessage(messages['library.edit.description.help'])}
                        invalid={this.hasFieldError('description')}
                        invalidMessage={this.getFieldError('description')}
                        className="mb-0 mr-2"
                      >
                        <label className="h6 d-block" htmlFor="description">
                          {intl.formatMessage(messages['library.edit.description.label'])}
                        </label>
                        <Input
                          name="description"
                          id="description"
                          type="textarea"
                          placeholder={intl.formatMessage(messages['library.edit.description.placeholder'])}
                          defaultValue={data.description}
                          onChange={this.handleValueChange}
                        />
                      </ValidationFormGroup>
                    </li>
                    <li className="field">
                      {data.libraryId && (
                        <ValidationFormGroup
                          for="type"
                          helpText={intl.formatMessage(messages['library.edit.type.help'])}
                          invalid={this.hasFieldError('type')}
                          invalidMessage={this.getFieldError('type')}
                          className="mb-0 mr-2"
                        >
                          <label className="h6 d-block" htmlFor="type">
                            {intl.formatMessage(messages['library.edit.type.label'])}
                          </label>
                          <Input
                            name="type"
                            type="select"
                            options={typeOptions}
                            defaultValue={data.type}
                            onChange={this.handleValueChange}
                          />
                        </ValidationFormGroup>
                      ) }
                    </li>
                    <li className="field">
                      <Form.Group>
                        <Form.Check
                          type="switch"
                          id="allow_public_learning"
                          name="allow_public_learning"
                          label={intl.formatMessage(messages['library.edit.public_learning.label'])}
                          checked={data.allow_public_learning}
                          onChange={this.handleValueChange}
                          className="coconut"
                        />
                        <Form.Check
                          type="switch"
                          id="allow_public_read"
                          name="allow_public_read"
                          label={intl.formatMessage(messages['library.edit.public_read.label'])}
                          checked={data.allow_public_read}
                          onChange={this.handleValueChange}
                        />
                      </Form.Group>
                    </li>
                    <li className="field">
                      { /* Checking null here since we cache the initial value. */ }
                      {(data.license !== null) && (
                        <LicenseFieldContainer
                          value={data.license}
                          updateValue={this.mockInputChange('license')}
                        />
                      )}
                    </li>
                  </ol>
                </fieldset>
                <div className="actions form-group">
                  <StatefulButton
                    variant="primary"
                    type="submit"
                    state={this.getSubmitButtonState()}
                    labels={{
                      disabled: intl.formatMessage(messages['library.edit.button.submit']),
                      enabled: intl.formatMessage(messages['library.edit.button.submit']),
                      pending: intl.formatMessage(messages['library.edit.button.submitting']),
                    }}
                    icons={{
                      pending: <Icon className="fa fa-spinner fa-spin" />,
                    }}
                    disabledStates={['disabled', 'pending']}
                    className="action"
                  />
                  <Button
                    variant="light"
                    className="action"
                    onClick={this.handleCancel}
                  >
                    {intl.formatMessage(messages['library.edit.button.cancel'])}
                  </Button>
                </div>
              </Form>
            </article>
            <aside className="content-supplementary">
              <div className="bit">
                <h3 className="title title-3">{intl.formatMessage(messages['library.edit.aside.title'])}</h3>
                <p>{intl.formatMessage(messages['library.edit.aside.text'])}</p>
                <ul className="list-actions">
                  <li className="action-item">
                    <a
                      href="http://edx.readthedocs.io/projects/open-edx-building-and-running-a-course/en/latest/course_components/libraries.html"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {intl.formatMessage(messages['library.edit.aside.help.link'])}
                    </a>
                  </li>
                </ul>
              </div>
            </aside>
          </section>
        </div>
      </div>
    );
  }

  render() {
    const { loadingStatus } = this.props;

    let content;
    if (loadingStatus === LOADING_STATUS.LOADING) {
      content = this.renderLoading();
    } else {
      content = this.renderContent();
    }

    return (
      <div className="container-fluid">
        {content}
      </div>
    );
  }
}

LibraryEditPage.contextType = AppContext;

LibraryEditPage.propTypes = {
  clearError: PropTypes.func.isRequired,
  errorFields: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  errorMessage: PropTypes.string,
  fetchLibraryDetail: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  intl: intlShape.isRequired,
  library: libraryShape,
  match: PropTypes.shape({
    params: PropTypes.shape({
      libraryId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  loadingStatus: PropTypes.oneOf(Object.values(LOADING_STATUS)).isRequired,
  submissionStatus: PropTypes.oneOf(Object.values(SUBMISSION_STATUS)).isRequired,
  updateLibrary: PropTypes.func.isRequired,
};

LibraryEditPage.defaultProps = libraryEditInitialState;

export default connect(
  selectLibraryEdit,
  {
    clearError,
    fetchLibraryDetail,
    updateLibrary,
  },
)(injectIntl(withRouter(LibraryEditPage)));
