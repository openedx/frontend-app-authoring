import React from 'react';
import PropTypes from 'prop-types';
import { Button, Alert } from '@edx/paragon';
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
import messages from './messages';

class LibraryDetailPage extends React.Component {
  constructor(props) {
    super(props);
    this.addComponentRef = React.createRef();
    this.state = {
      newBlockType: 'html',
      newBlockSlug: '',
    };
  }

  componentDidMount() {
    const { libraryId } = this.props.match.params;
    this.props.fetchLibraryDetail({ libraryId });
  }

  handleCommitChanges = () => {
    this.props.commitLibraryChanges({ libraryId: this.props.library.id });
  }

  handleRevertChanges = () => {
    this.props.revertLibraryChanges({ libraryId: this.props.library.id });
  }

  handleChangeNewBlockType = (event) => {
    this.setState({ newBlockType: event.target.value });
  }

  handleChangeNewBlockSlug = (event) => {
    this.setState({ newBlockSlug: event.target.value });
  }

  handleAddNewBlock = (event) => {
    event.preventDefault();
    this.props.createLibraryBlock({
      data: {
        libraryId: this.props.library.id,
        block_type: this.state.newBlockType,
        definition_id: this.state.newBlockSlug,
      },
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
              <div className="row">
                {library.blocks && library.blocks.map((block) => (
                  <LibraryBlockCard key={block.id} block={block} libraryId={library.id} />
                ))}
              </div>
              <div ref={this.addComponentRef} className="add-xblock-component new-component-item adding">
                <div className="new-component">
                  <h5>{intl.formatMessage(messages['library.detail.add.new.component'])}</h5>
                  <form>
                    <div className="new-component-type row justify-content-center">
                      <div className="form-group add-xblock-component-button w-auto p-4">
                        <label htmlFor="newBlockType" className="mt-1 mb-4">
                          {intl.formatMessage(messages['library.detail.add.new.component.type'])}
                        </label>
                        <select
                          id="newBlockType"
                          className="form-control w-auto m-auto"
                          value={this.state.newBlockType}
                          onChange={this.handleChangeNewBlockType}
                        >
                          {library.blockTypes && library.blockTypes.map(blockType => (
                            <option value={blockType.block_type} key={blockType.block_type}>
                              {blockType.block_type} ({blockType.display_name})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group add-xblock-component-button w-auto p-4">
                        <label htmlFor="newBlockSlug" className="mt-1 mb-4">
                          {intl.formatMessage(messages['library.detail.add.new.component.slug'])}
                        </label>
                        <input
                          type="text"
                          className="form-control w-auto m-auto"
                          id="newBlockSlug"
                          placeholder={`${this.state.newBlockType}1`}
                          value={this.state.newBlockSlug}
                          onChange={this.handleChangeNewBlockSlug}
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={!this.state.newBlockType || !this.state.newBlockSlug}
                      className="btn btn-primary"
                      onClick={this.handleAddNewBlock}
                    >
                      {intl.formatMessage(messages['library.detail.add.new.component.button'])}
                    </button>
                  </form>
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

LibraryDetailPage.contextType = AppContext;

LibraryDetailPage.propTypes = {
  clearLibraryError: PropTypes.func.isRequired,
  commitLibraryChanges: PropTypes.func.isRequired,
  createLibraryBlock: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
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

LibraryDetailPage.defaultProps = libraryDetailInitialState;

export default connect(
  selectLibraryDetail,
  {
    clearLibraryError,
    createLibraryBlock,
    commitLibraryChanges,
    revertLibraryChanges,
    fetchLibraryDetail,
  },
)(injectIntl(LibraryDetailPage));
