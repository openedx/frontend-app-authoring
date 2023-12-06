import React from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Icon,
  Row,
  StatefulButton,
} from '@edx/paragon';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { SpinnerSimple } from '@edx/paragon/icons';

import { LoadingPage } from '@src/library-authoring/generic';
import {
  LOADING_STATUS,
  SUBMISSION_STATUS,
  libraryShape,
  truncateMessage,
  // LIBRARY_TYPES,
} from '@src/library-authoring/common';
import {
  fetchLibraryDetail,
} from '../author-library';
import {
  clearError,
  libraryEditInitialState,
  selectLibraryEdit,
  updateLibrary,
} from './data';
import messages from './messages';
import { LicenseFieldContainer } from '@src/library-authoring/common/LicenseField';
import { withNavigate, withParams } from '@src/library-authoring/utils/hoc';

class LibraryConfigurePage extends React.Component {
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
      const { libraryId } = this.props;
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
      this.props.navigate(this.props.library.url);
    }
  }

  componentWillUnmount() {
    this.props.clearError();
  }

  syncLibraryData = () => {
    const { library } = this.props;
    this.setState({
      data: {
        libraryId: library.id,
        title: library.title,
        description: library.description,
        // type: library.type,
        // allow_public_learning: library.allow_public_learning,
        // allow_public_read: library.allow_public_read,
        license: library.license,
      },
    });
  };

  hasFieldError = (fieldName) => {
    const { errorFields } = this.props;

    if (errorFields && (fieldName in errorFields)) {
      return true;
    }

    return false;
  };

  getFieldError = (fieldName) => {
    if (this.hasFieldError(fieldName)) {
      return this.props.errorFields[fieldName];
    }

    return null;
  };

  formIsValid = () => {
    const { data } = this.state;

    if (data.libraryId && data.title && data.description) {
      return true;
    }

    return false;
  };

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
  };

  handleDismissAlert = () => {
    this.props.clearError();
  };

  mockInputChange = (name) => (value) => this.handleValueChange({ target: { value, name, type: 'text' } });

  handleValueChange = (event) => {
    const el = event.target;
    this.setState(state => ({
      data: {
        ...state.data,
        [el.name]: el.type === 'checkbox' ? el.checked : el.value,
      },
    }));
  };

  handleSubmit = (event) => {
    event.preventDefault();
    this.props.updateLibrary({ data: this.state.data });
  };

  handleCancel = () => {
    this.props.navigate(this.props.library.url);
  };

  renderLoading() {
    const { intl } = this.props;

    return (
      <LoadingPage loadingMessage={intl.formatMessage(messages['library.edit.loading.message'])} />
    );
  }

  renderContent() {
    const { errorMessage, intl, library } = this.props;
    const { data } = this.state;

    // const validTypes = Object.values(LIBRARY_TYPES).filter((type) => type !== LIBRARY_TYPES.LEGACY);
    // const typeOptions = validTypes.map((value) => (
    //   <option value={value} key={`aoption-${value}`}>
    //     {intl.formatMessage(messages[`library.edit.type.label.${value}`])}
    //   </option>
    // ));

    return (
      <div className="library-edit-wrapper">
        <div className="wrapper-mast wrapper">
          <header className="mast has-actions has-navigation has-subtitle">
            <div className="page-header">
              <small className="subtitle">{intl.formatMessage(messages['library.edit.page.heading'])}</small>
              <h2 className="page-header-title">{library.title}</h2>
            </div>
          </header>
        </div>
        <div className="wrapper-content wrapper">
          <Row className="content">
            <Col xs={12} md={8} xl={9}>
              <article className="content-primary" role="main">
                {errorMessage
                && (
                  <Alert
                    variant="danger"
                    onClose={this.handleDismissAlert}
                    dismissible
                  >
                    {truncateMessage(errorMessage)}
                  </Alert>
                )}
                <Card>
                  <Form onSubmit={this.handleSubmit}>
                    <fieldset>
                      {['title', 'description'].map(name => (
                        <Card.Section>
                          <Form.Group
                            controlId={name}
                            isInvalid={this.hasFieldError(name)}
                            className="mb-0 mr-2"
                          >
                            <Form.Label className="large d-block" htmlFor={name}>
                              {intl.formatMessage(messages[`library.edit.${name}.label`])}
                            </Form.Label>
                            <Form.Control
                              name={name}
                              id={name}
                              type="text"
                              placeholder={intl.formatMessage(messages[`library.edit.${name}.placeholder`])}
                              defaultValue={data[name]}
                              onChange={this.handleValueChange}
                            />
                            <Form.Text className="form-text text-muted">
                              {intl.formatMessage(messages[`library.edit.${name}.help`])}
                            </Form.Text>
                            {this.hasFieldError(name) && (
                              <Form.Control.Feedback hasIcon={false} type="invalid">
                                {this.getFieldError(name)}
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </Card.Section>
                      ))}
                      {/* {data.libraryId && (
                        <Card.Section>
                          <Form.Group
                            for="type"
                            isInvalid={this.hasFieldError('type')}
                            className="mb-0 mr-2"
                          >
                            <label className="h6 d-block" htmlFor="type">
                              {intl.formatMessage(messages['library.edit.type.label'])}
                            </label>
                            <Form.Control
                              name="type"
                              as="select"
                              options={typeOptions}
                              defaultValue={data.type}
                              onChange={this.handleValueChange}
                            >
                              {typeOptions}
                            </Form.Control>
                            <Form.Text className="form-text text-muted">
                              {intl.formatMessage(messages['library.edit.type.help'])}
                            </Form.Text>
                            {this.hasFieldError('type') && (
                            <Form.Control.Feedback hasIcon={false} type="invalid">
                              {this.getFieldError('type')}
                            </Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </Card.Section>
                      ) } */}
                      {/* <Card.Section>
                        <Form.Group>
                          <Form.Check
                            type="switch"
                            id="allow_public_learning"
                            name="allow_public_learning"
                            label={intl.formatMessage(messages['library.edit.public_learning.label'])}
                            checked={data.allow_public_learning}
                            onChange={this.handleValueChange}
                            // className="coconut"
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
                      </Card.Section> */}
                      { /* Checking null here since we cache the initial value. */ }
                      {(data.license !== null) && (
                        <Card.Section>
                          <LicenseFieldContainer
                            value={data.license}
                            updateValue={this.mockInputChange('license')}
                          />
                        </Card.Section>
                      )}
                    </fieldset>
                    <div className="actions form-group">
                      <Card.Section>
                        <Button
                          variant="tertiary"
                          className="action ml-n1"
                          onClick={this.handleCancel}
                        >
                          {intl.formatMessage(messages['library.edit.button.cancel'])}
                        </Button>
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
                            pending: <Icon src={SpinnerSimple} className="fa fa-spinner fa-spin" />,
                          }}
                          disabledStates={['disabled', 'pending']}
                          className="action"
                        />
                      </Card.Section>
                    </div>
                  </Form>
                </Card>
              </article>
            </Col>
            <Col xs={12} md={4} xl={3}>
              <aside className="content-supplementary">
                <div className="bit small">
                  <h4>{intl.formatMessage(messages['library.edit.aside.title'])}</h4>
                  <p>{intl.formatMessage(messages['library.edit.aside.text'])}</p>
                  <ul className="list-actions list-unstyled">
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
            </Col>
          </Row>
        </div>
      </div>
    );
  }

  render() {
    const { loadingStatus } = this.props;

    let content;
    if (loadingStatus === LOADING_STATUS.LOADING || loadingStatus === LOADING_STATUS.STANDBY) {
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

LibraryConfigurePage.contextType = AppContext;

LibraryConfigurePage.propTypes = {
  clearError: PropTypes.func.isRequired,
  errorFields: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  errorMessage: PropTypes.string,
  fetchLibraryDetail: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  library: libraryShape,
  libraryId: PropTypes.string.isRequired,
  loadingStatus: PropTypes.oneOf(Object.values(LOADING_STATUS)).isRequired,
  submissionStatus: PropTypes.oneOf(Object.values(SUBMISSION_STATUS)).isRequired,
  updateLibrary: PropTypes.func.isRequired,
};

LibraryConfigurePage.defaultProps = libraryEditInitialState;

export default connect(
  selectLibraryEdit,
  {
    clearError,
    fetchLibraryDetail,
    updateLibrary,
  },
)(injectIntl(withNavigate(withParams((LibraryConfigurePage)))));
