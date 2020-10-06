import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Alert,
  ValidationFormGroup,
  Input,
  Form,
} from '@edx/paragon';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import { LoadingPage } from '../../generic';
import { LOADING_STATUS, libraryShape, truncateErrorMessage } from '../common';
import {
  clearLibraryError,
  createLibraryBlock,
  commitLibraryChanges,
  fetchLibraryDetail,
  libraryDetailInitialState,
  revertLibraryChanges,
  selectLibraryDetail,
} from './data';
import LibraryBlockCard from './LibraryBlockCard';
import commonMessages from '../common/messages';
import messages from './messages';

class LibraryPage extends React.Component {
  constructor(props) {
    super(props);
    this.addComponentRef = React.createRef();
    this.state = {
      data: {
        block_type: 'html',
        definition_id: '',
      },
    };
  }

  componentDidMount() {
    const { libraryId } = this.props.match.params;
    this.props.fetchLibraryDetail({ libraryId });
  }

  componentDidUpdate(prevProps) {
    const oldBlockTypes = (prevProps.library && prevProps.library.blockTypes) || [];
    const newBlockTypes = (this.props.library && this.props.library.blockTypes) || [];
    // Identity check is good enough here. In all current scenarios it should have the same effect as deep equality
    // checking. Might change this if we suddenly allow switching libraries in place from this page.
    if ((oldBlockTypes !== newBlockTypes) && newBlockTypes.length) {
      this.updateBlockDefault();
    }
  }

  handleCommitChanges = () => {
    this.props.commitLibraryChanges({ libraryId: this.props.library.id });
  }

  handleRevertChanges = () => {
    this.props.revertLibraryChanges({ libraryId: this.props.library.id });
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

  hasFieldError = (fieldName) => {
    const { errorFields } = this.props;
    return !!(errorFields && (fieldName in errorFields));
  }

  getFieldError = (fieldName) => {
    if (this.hasFieldError(fieldName)) {
      return this.props.errorFields[fieldName];
    }
    return null;
  }


  handleAddNewBlock = (event) => {
    event.preventDefault();
    this.props.createLibraryBlock({
      libraryId: this.props.library.id,
      data: this.state.data,
    });
  }

  handleDismissAlert = () => {
    this.props.clearLibraryError();
  }

  scrollToAddComponent = () => {
    if (this.addComponentRef) {
      this.addComponentRef.current.scrollIntoView({
        behaviour: 'smooth',
      });
    }
  }

  updateBlockDefault() {
    // The default block type is 'html', but this will break the form if we're in a video or problem library.
    // In the case we're in one of those, the server should only return one valid block type, which we can then set.
    const { library } = this.props;
    const currentBlockValid = !!library.blockTypes.filter((type) => type.block_type === this.state.newBlockType).length;
    if (library.blockTypes.length && !currentBlockValid) {
      this.setState({ newBlockType: library.blockTypes[0].block_type });
    }
  }

  renderLoading() {
    const { intl } = this.props;

    return (
      <LoadingPage loadingMessage={intl.formatMessage(messages['library.detail.loading.message'])} />
    );
  }

  renderContent() {
    const { errorMessage, intl, library } = this.props;

    const hasChanges = library.has_unpublished_changes || library.has_unpublished_deletes;

    return (
      <div className="library-detail-wrapper">
        <div className="wrapper-mast wrapper">
          <header className="mast has-actions has-navigation has-subtitle">
            <div className="page-header">
              <small className="subtitle">{intl.formatMessage(messages['library.detail.page.heading'])}</small>
              <h1 className="page-header-title">{library.title}</h1>
            </div>
            <nav className="nav-actions">
              <ul>
                <li className="nav-item">
                  <Button
                    variant="success"
                    onClick={this.scrollToAddComponent}
                  >
                    <FontAwesomeIcon icon={faPlus} className="pr-3 icon-inline" />
                    {intl.formatMessage(messages['library.detail.new.component'])}
                  </Button>
                </li>
              </ul>
            </nav>
          </header>
        </div>
        <div className="wrapper-content wrapper">
          <section className="content">
            <article className="content-primary" role="main">
              {(errorMessage !== null)
              && (
              <Alert
                variant="danger"
                onClose={this.handleDismissAlert}
                dismissible
              >
                {truncateErrorMessage(errorMessage || intl.formatMessage(commonMessages['library.server.error.generic']))}
              </Alert>
              )}
              <div className="row">
                {library.blocks && library.blocks.map((block) => (
                  <LibraryBlockCard key={block.id} block={block} libraryId={library.id} />
                ))}
              </div>
              <div ref={this.addComponentRef} className="add-xblock-component new-component-item adding">
                <div className="new-component">
                  <h5>{intl.formatMessage(messages['library.detail.add.new.component'])}</h5>
                  <Form onSubmit={this.handleAddNewBlock}>
                    <fieldset>
                      <div className="new-component-type row justify-content-center">
                        <div className="form-group add-xblock-component-button w-auto p-4">
                          <ValidationFormGroup
                            for="block_type"
                            invalid={this.hasFieldError('block_type')}
                            invalidMessage={this.getFieldError('block_type')}
                          >
                            <label htmlFor="block_type" className="mt-1 mb-4">
                              {intl.formatMessage(messages['library.detail.add.new.component.type'])}
                            </label>
                            <Input
                              name="block_type"
                              type="select"
                              defaultValue={this.state.data.block_type}
                              onChange={this.onValueChange}
                              options={library.blockTypes && library.blockTypes.map(blockType => (
                                { value: blockType.block_type, label: blockType.display_name }
                              ))}
                            />
                          </ValidationFormGroup>
                        </div>
                        <div className="form-group add-xblock-component-button w-auto p-4">
                          <ValidationFormGroup
                            for="definition_id"
                            invalid={this.hasFieldError('definition_id')}
                            invalidMessage={this.getFieldError('definition_id')}
                          >
                            <label htmlFor="newBlockSlug" className="mt-1 mb-4">
                              {intl.formatMessage(messages['library.detail.add.new.component.slug'])}
                            </label>
                          </ValidationFormGroup>
                          <Input
                            type="text"
                            name="definition_id"
                            placeholder={`${this.state.data.block_type}1`}
                            value={this.state.data.definition_id}
                            onChange={this.onValueChange}
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={!this.state.data.block_type || !this.state.data.definition_id}
                        className="btn btn-primary"
                        onClick={this.handleAddNewBlock}
                      >
                        {intl.formatMessage(messages['library.detail.add.new.component.button'])}
                      </button>
                    </fieldset>
                  </Form>
                </div>
              </div>
            </article>
            <aside className="content-supplementary">
              <div className="bit">
                <h3 className="title title-3">{intl.formatMessage(messages['library.detail.aside.title'])}</h3>
                <p>{intl.formatMessage(messages['library.detail.aside.text.1'])}</p>
                <p>{intl.formatMessage(messages['library.detail.aside.text.2'])}</p>
                <ul className="list-actions">
                  <li className="action-item">
                    <a
                      href="http://edx.readthedocs.io/projects/open-edx-building-and-running-a-course/en/latest/course_components/libraries.html"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {intl.formatMessage(messages['library.detail.aside.help.link'])}
                    </a>
                  </li>
                </ul>
              </div>
              <div id="publish-unit" className="window">
                <div className={`bit-publishing ${hasChanges && 'has-warnings'}`}>
                  <h3 className="bar-mod-title pub-status">
                    {intl.formatMessage(messages[`library.detail.aside.${hasChanges ? 'draft' : 'published'}`])}
                  </h3>
                  <div className="wrapper-pub-actions bar-mod-actions">
                    <ul className="action-list list-unstyled">
                      <li className="action-item">
                        <Button
                          variant="primary"
                          className="w-100 p-2 btn-lg"
                          onClick={this.handleCommitChanges}
                          disabled={!hasChanges}
                          aria-disabled={!hasChanges}
                        >
                          <strong>{intl.formatMessage(messages['library.detail.aside.publish'])}</strong>
                        </Button>
                      </li>
                      <li className="action-item text-right">
                        <Button
                          variant="link"
                          className="d-inline-block"
                          onClick={this.handleRevertChanges}
                          disabled={!hasChanges}
                          aria-disabled={!hasChanges}
                        >
                          {intl.formatMessage(messages['library.detail.aside.discard'])}
                        </Button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </div>
    );
  }

  render() {
    const { status } = this.props;

    let content;
    if (status === LOADING_STATUS.LOADING) {
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

LibraryPage.contextType = AppContext;

LibraryPage.propTypes = {
  clearLibraryError: PropTypes.func.isRequired,
  commitLibraryChanges: PropTypes.func.isRequired,
  createLibraryBlock: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  errorFields: PropTypes.shape({
    block_type: PropTypes.arrayOf(PropTypes.string),
    definition_id: PropTypes.arrayOf(PropTypes.string),
  }), // eslint-disable-line react/forbid-prop-types
  fetchLibraryDetail: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  library: libraryShape,
  match: PropTypes.shape({
    params: PropTypes.shape({
      libraryId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  revertLibraryChanges: PropTypes.func.isRequired,
  status: PropTypes.oneOf(Object.values(LOADING_STATUS)).isRequired,
};

LibraryPage.defaultProps = libraryDetailInitialState;

export default connect(
  selectLibraryDetail,
  {
    clearLibraryError,
    createLibraryBlock,
    commitLibraryChanges,
    revertLibraryChanges,
    fetchLibraryDetail,
  },
)(injectIntl(LibraryPage));
