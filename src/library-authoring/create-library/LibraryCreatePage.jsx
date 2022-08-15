import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Prompt } from 'react-router-dom';
import {
  Button,
  Breadcrumb,
  Icon,
  StatefulButton,
  Alert,
  AlertModal,
  ActionRow,
} from '@edx/paragon';
import { Info } from '@edx/paragon/icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';

import {
  ROUTES,
  LIBRARY_TYPES,
  SUBMISSION_STATUS,
  libraryShape,
  truncateMessage,
  FormGroup,
  OrganizationDropdown,
  VALID_SLUG_ID_REGEX,
} from '../common';
import {
  createLibrary,
  libraryCreateInitialState,
  selectLibraryCreate,
  resetForm,
  fetchOrganizations,
} from './data';

import commonMessages from '../common/messages';
import messages from './messages';

export class LibraryCreatePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpenModal: false,
      allowLeave: true,
      lastLocation: null,
      confirmedNavigation: false,
      data: {
        title: '',
        org: '',
        slug: '',
        license: '',
      },
      errors: {},
    };
  }

  componentDidMount() {
    this.props.resetForm();
    this.props.fetchOrganizations();
  }

  componentDidUpdate(prevProps, prevState) {
    /* Redirect on submission success. */
    const { status, createdLibrary } = this.props;
    if (
      status !== prevProps.status
      && status === SUBMISSION_STATUS.SUBMITTED
      && createdLibrary !== prevProps.createdLibrary
      && createdLibrary !== null
    ) {
      if (createdLibrary.type === LIBRARY_TYPES.LEGACY) {
        this.setState({ allowLeave: true }, () => { // eslint-disable-line react/no-did-update-set-state
          window.location.href = createdLibrary.url;
        });
      } else if (Object.values(LIBRARY_TYPES).includes(createdLibrary.type)) {
        this.setState({ allowLeave: true }, () => { // eslint-disable-line react/no-did-update-set-state
          this.props.history.push(createdLibrary.url);
        });
      }
    }

    if (prevProps.status === SUBMISSION_STATUS.SUBMITTING && this.props.status === SUBMISSION_STATUS.FAILED) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

      // Update field errors after submission with error response
      if (this.props.errorFields) {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({
          errors: {
            ...this.props.errorFields,
            org: prevState.errors.org || this.props.errorFields?.org,
          },
        });
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
    }), () => {
      const isFormFilled = Object.keys(this.state.data).some(i => this.state.data[i]);
      this.setState({ allowLeave: !isFormFilled });
    });
  }

  onCancel = () => {
    this.props.resetForm();
    this.props.history.push(ROUTES.List.HOME);
  }

  onSubmit = (event) => {
    event.preventDefault();
    this.props.createLibrary({ data: { ...this.state.data, type: LIBRARY_TYPES.COMPLEX } });
  }

  getFieldError = (fieldName) => (fieldName in this.state.errors ? this.state.errors[fieldName] : null);

  handleOnBlur = (e) => {
    const { name, value } = e.target;

    this.validateInput(name, value, this.state.data);
  }

  handleOnChangeOrg = (value) => {
    this.setState(prevState => ({
      data: { ...prevState.data, org: value },
      errors: { ...prevState.errors, org: value ? '' : prevState.errors.org },
    }));
  }

  getSubmitButtonState = () => {
    const { status } = this.props;

    let state;
    if (status === SUBMISSION_STATUS.SUBMITTING) {
      state = 'pending';
    } else {
      state = 'enabled';
    }

    return state;
  }

  openModal = (location) => {
    this.setState({ isOpenModal: true, lastLocation: location });
  }

  closeModal = () => {
    this.setState({ isOpenModal: false });
  }

  handleClickBreadcrumbs = (event) => {
    if (!this.state.allowLeave) {
      event.preventDefault();
      const pathname = event.target.getAttribute('href');
      this.openModal({ pathname });
    }
  }

  handleBlockedNavigation = (nextLocation) => {
    const { confirmedNavigation, allowLeave } = this.state;
    if (!confirmedNavigation && !allowLeave) {
      this.openModal(nextLocation);
      return false;
    }

    return true;
  }

  handleConfirmNavigationClick = () => {
    const { lastLocation } = this.state;
    const { config } = this.context;

    this.closeModal();

    if (lastLocation) {
      this.setState({
        confirmedNavigation: true,
      }, () => {
        if (lastLocation.pathname === config.STUDIO_BASE_URL) {
          window.location.href = lastLocation.pathname;
        } else {
          this.props.history.push(lastLocation.pathname);
        }
      });
    }
  }

  validateInput(fieldName, value, data) {
    const { intl } = this.props;
    const { errors } = this.state;
    const slugRegex = new RegExp(VALID_SLUG_ID_REGEX);

    switch (fieldName) {
      case 'org':
        if (!value) {
          errors[fieldName] = intl.formatMessage(messages['library.form.field.error.empty']);
        } else if (value && !data.org) {
          errors[fieldName] = intl.formatMessage(messages['library.form.field.error.mismatch.org']);
        } else {
          errors[fieldName] = '';
        }
        break;
      case 'slug':
        if (!value) {
          errors[fieldName] = intl.formatMessage(messages['library.form.field.error.empty']);
        } else if (value && !value.match(slugRegex)) {
          errors[fieldName] = intl.formatMessage(messages['library.form.field.error.invalid.slug']);
        } else {
          errors[fieldName] = '';
        }
        break;
      default:
        if (!value) {
          errors[fieldName] = intl.formatMessage(messages['library.form.field.error.empty']);
        } else {
          errors[fieldName] = '';
        }
        break;
    }

    this.setState({ errors });
    return errors;
  }

  render() {
    const { intl, errorMessage, orgs } = this.props;
    const { data, isOpenModal, allowLeave } = this.state;
    const { config } = this.context;
    const errorTitle = !errorMessage && this.props.errorFields
      && intl.formatMessage(messages['library.form.generic.error.title']);
    const errorDescription = errorMessage || this.props.errorFields
      ? intl.formatMessage(messages['library.form.generic.error.description']) : '';

    return (
      <div className="container-fluid">
        <div className="library-create-wrapper">
          {errorDescription && (
            <Alert
              icon={Info}
              variant="danger"
              className="form-create-alert"
            >
              {errorTitle && <Alert.Heading>{errorTitle}</Alert.Heading>}
              <p>{truncateMessage(errorDescription)}</p>
            </Alert>
          )}
          <Breadcrumb
            activeLabel={intl.formatMessage(messages['library.form.breadcrumbs.current'])}
            clickHandler={this.handleClickBreadcrumbs}
            links={[
              { label: intl.formatMessage(messages['library.form.breadcrumbs.home']), url: config.STUDIO_BASE_URL },
              { label: intl.formatMessage(messages['library.form.breadcrumbs.list']), url: ROUTES.List.HOME },
            ]}
          />
          <div className="wrapper-mast wrapper">
            <header className="has-actions">
              <h2 className="page-header h2">{intl.formatMessage(messages['library.form.create.library'])}</h2>
            </header>
          </div>
          <div className="wrapper-content wrapper">
            <section className="content">
              <form onSubmit={this.onSubmit} className="form-create">
                <fieldset>
                  <ol className="list-input">
                    <li className="field">
                      <FormGroup
                        name="title"
                        type="text"
                        readOnly={false}
                        value={data.title}
                        controlClassName="has-value"
                        handleBlur={this.handleOnBlur}
                        handleChange={this.onValueChange}
                        errorMessage={this.getFieldError('title')}
                        floatingLabel={intl.formatMessage(messages['library.form.title.label'])}
                        placeholder={intl.formatMessage(messages['library.form.title.placeholder'])}
                        helpText={intl.formatMessage(messages['library.form.title.help'])}
                      />
                    </li>
                    <li className="field">
                      <OrganizationDropdown
                        disabled
                        type="text"
                        name="org"
                        intl={intl}
                        readOnly={false}
                        value={data.org}
                        options={orgs}
                        controlClassName="has-value"
                        handleBlur={this.handleOnBlur}
                        handleChange={this.handleOnChangeOrg}
                        floatingLabel={intl.formatMessage(messages['library.form.org.label'])}
                        placeholder={intl.formatMessage(messages['library.form.org.placeholder'])}
                        errorMessage={this.getFieldError('org')}
                        helpMessage={intl.formatMessage(messages['library.form.org.help'])}
                      />
                    </li>
                    <li className="field">
                      <FormGroup
                        name="slug"
                        type="text"
                        readOnly={false}
                        value={data.slug}
                        controlClassName="has-value"
                        handleBlur={this.handleOnBlur}
                        handleChange={this.onValueChange}
                        errorMessage={this.getFieldError('slug')}
                        floatingLabel={intl.formatMessage(messages['library.form.slug.label'])}
                        placeholder={intl.formatMessage(messages['library.form.slug.placeholder'])}
                        helpText={intl.formatMessage(messages['library.form.slug.help'])}
                      />
                    </li>
                  </ol>
                </fieldset>
                <div className="actions form-group">
                  <Button
                    size="md"
                    variant="tertiary"
                    onClick={this.onCancel}
                    className="mb-2 mb-sm-0 action btn-light"
                  >
                    {intl.formatMessage(commonMessages['library.common.forms.button.cancel'])}
                  </Button>
                  <StatefulButton
                    size="md"
                    type="submit"
                    variant="primary"
                    className="action btn-primary"
                    state={this.getSubmitButtonState()}
                    disabledStates={['disabled', 'pending']}
                    icons={{
                      pending: <Icon className="fa fa-spinner fa-spin" />,
                    }}
                    labels={{
                      disabled: intl.formatMessage(commonMessages['library.common.forms.button.create']),
                      enabled: intl.formatMessage(commonMessages['library.common.forms.button.create']),
                      pending: intl.formatMessage(commonMessages['library.common.forms.button.creating']),
                    }}
                  />
                </div>
              </form>
            </section>
          </div>
        </div>
        <Prompt when={!allowLeave} message={this.handleBlockedNavigation} />
        <AlertModal
          title={intl.formatMessage(messages['library.form.modal.title'])}
          isOpen={isOpenModal}
          footerNode={(
            <ActionRow>
              <Button variant="tertiary" size="md" onClick={this.closeModal}>
                {intl.formatMessage(commonMessages['library.common.forms.button.cancel'])}
              </Button>
              <Button variant="primary" size="md" onClick={this.handleConfirmNavigationClick}>
                {intl.formatMessage(commonMessages['library.common.forms.button.ok'])}
              </Button>
            </ActionRow>
          )}
        >
          {intl.formatMessage(messages['library.form.modal.description'])}
        </AlertModal>
      </div>
    );
  }
}

LibraryCreatePage.contextType = AppContext;

LibraryCreatePage.propTypes = {
  createdLibrary: libraryShape,
  createLibrary: PropTypes.func.isRequired,
  fetchOrganizations: PropTypes.func.isRequired,
  errorFields: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  errorMessage: PropTypes.string,
  orgs: PropTypes.arrayOf(PropTypes.string),
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  intl: intlShape.isRequired,
  resetForm: PropTypes.func.isRequired,
  status: PropTypes.oneOf(Object.values(SUBMISSION_STATUS)).isRequired,
};

LibraryCreatePage.defaultProps = libraryCreateInitialState;

export default connect(
  selectLibraryCreate,
  {
    createLibrary,
    fetchOrganizations,
    resetForm,
  },
)(injectIntl(withRouter(LibraryCreatePage)));
