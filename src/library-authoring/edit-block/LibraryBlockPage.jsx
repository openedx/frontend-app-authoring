import React from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  ActionRow,
  Alert,
  Button,
  Card,
  Col,
  Container,
  Row,
  Spinner,
} from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import { AppContext } from '@edx/frontend-platform/react';

import {
  BLOCK_TYPE_EDIT_DENYLIST,
  libraryBlockShape,
  libraryShape,
  LOADING_STATUS,
  ROUTES,
  truncateMessage,
  XBLOCK_VIEW_SYSTEM,
  getXBlockHandlerUrl, fetchable, PAGE_TYPE,
} from '../common';
import {
  commitLibraryChanges,
  fetchLibraryDetail,
  revertLibraryChanges,
} from '../author-library';
import {
  clearLibraryBlockError,
  deleteLibraryBlock,
  deleteLibraryBlockAsset,
  fetchLibraryBlockAssets,
  fetchLibraryBlockMetadata,
  fetchLibraryBlockOlx,
  fetchLibraryBlockView,
  libraryBlockInitialState,
  selectLibraryBlock,
  setLibraryBlockError,
  setLibraryBlockOlx,
  uploadLibraryBlockAssets,
  focusBlock, initializeBlock,
} from './data';
import { LibraryBlock } from './LibraryBlock';
import LibraryBlockAssets from './LibraryBlockAssets';
import LibraryBlockOlx from './LibraryBlockOlx';

import messages from './messages';

import { blockViewShape } from './data/shapes';
import { withNavigate, withParams, withPath } from '../utils/hoc';

class LibraryBlockPage extends React.Component {
  componentDidMount() {
    this.loadData();
    /* This is required if the user reached the page directly. */
    if (this.props.library === null) {
      const { libraryId } = this.props;
      this.props.fetchLibraryDetail({ libraryId });
    }
    this.props.initializeBlock(this.props.blockId);
  }

  componentDidUpdate(prevProps) {
    if (this.props.path !== prevProps.path) {
      this.loadData();
    }
  }

  get isEditable() {
    const { metadata } = this.props;
    return metadata !== null && !BLOCK_TYPE_EDIT_DENYLIST.includes(this.props.metadata.block_type);
  }

  /**
   * Helper method which gets a "secure handler URL" from the LMS/Studio
   * A "secure handler URL" is a URL that the XBlock runtime can use even from
   * within its sandboxed IFrame. (The IFrame is considered a different origin,
   * and normally, cross-origin handler requests would be blocked).
   *
   * @param usageKey The usage key of the XBlock whose handlers you want to call.
   */
  getHandlerUrl = async (usageKey) => {
    const viewSystem = (
      this.props.path === ROUTES.Block.Learn
        ? XBLOCK_VIEW_SYSTEM.LMS
        : XBLOCK_VIEW_SYSTEM.Studio
    );
    return getXBlockHandlerUrl(usageKey, viewSystem, 'handler_name');
  };

  handleBlockNotification = (event) => {
    if (
      event.eventType === 'cancel'
      || (event.eventType === 'save' && event.state === 'end')
    ) {
      const { libraryId, blockId } = this.props;
      this.props.navigate(ROUTES.Block.HOME_SLUG(libraryId, blockId));
    } else if (event.eventType === 'error') {
      const { blockId } = this.props;
      const errorMessage = `${event.title || 'Error'}: ${event.message}`;
      this.props.setLibraryBlockError({ errorMessage, blockId });
    } else {
      logError(`Unknown XBlock runtime event: ${event}`);
    }
  };

  handleDeleteBlock = () => {
    const { blockId } = this.props;
    /* eslint-disable-next-line no-alert */
    if (window.confirm('Are you sure you want to delete this XBlock? There is no undo.')) {
      this.props.deleteLibraryBlock({ blockId }).then(() => {
        this.props.navigate(ROUTES.Detail.HOME_SLUG(this.props.libraryId));
      });
    }
  };

  handleSaveOlx = (olx) => {
    const { blockId } = this.props;
    this.props.setLibraryBlockOlx({ blockId, olx });
  };

  handleDropFiles = (files) => {
    const { blockId } = this.props;
    this.props.uploadLibraryBlockAssets({ blockId, files });
  };

  handleDeleteFile = (fileName) => {
    const { blockId } = this.props;
    /* eslint-disable-next-line no-alert */
    if (window.confirm(`Are you sure you want to delete ${fileName}?`)) {
      this.props.deleteLibraryBlockAsset({ blockId, fileName });
    }
  };

  handleCommitLibrary = async () => {
    const { blockId, libraryId } = this.props;
    await this.props.commitLibraryChanges({ libraryId });

    /* We fetch block metadata immediately, as its published status may have changed. */
    this.props.fetchLibraryBlockMetadata({ blockId });
  };

  handleRevertLibrary = async () => {
    const { blockId, libraryId } = this.props;
    await this.props.revertLibraryChanges({ libraryId });

    /* We fetch block metadata immediately, as its publication status may have changed. */
    this.props.fetchLibraryBlockMetadata({ blockId });
  };

  handleDismissAlert = () => {
    this.props.clearLibraryBlockError();
  };

  loadData() {
    const { blockId } = this.props;
    this.props.focusBlock({ blockId });

    /* Always load block metadata. */
    this.props.fetchLibraryBlockMetadata({ blockId });

    switch (this.props.path) {
      case ROUTES.Block.HOME: {
        this.props.fetchLibraryBlockView({
          blockId,
          viewSystem: XBLOCK_VIEW_SYSTEM.Studio,
          viewName: 'student_view',
        });
        break;
      }
      case ROUTES.Block.EDIT: {
        this.props.fetchLibraryBlockView({
          blockId,
          viewSystem: XBLOCK_VIEW_SYSTEM.Studio,
          viewName: 'studio_view',
        });
        break;
      }
      case ROUTES.Block.SOURCE: {
        this.props.fetchLibraryBlockOlx({ blockId });
        break;
      }
      case ROUTES.Block.ASSETS: {
        this.props.fetchLibraryBlockAssets({ blockId });
        break;
      }
      case ROUTES.Block.LEARN: {
        this.props.fetchLibraryBlockView({
          blockId,
          viewSystem: XBLOCK_VIEW_SYSTEM.LMS,
          viewName: 'student_view',
        });
        break;
      }
      default:
    }
  }

  renderContent() {
    const {
      errorMessage,
      intl,
      metadata,
    } = this.props;
    const { blockId, libraryId } = this.props;
    const hasChanges = metadata ? metadata.has_unpublished_changes : false;

    return (
      <div className="library-block-wrapper">
        <Container className="wrapper-content wrapper">
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
                  {/* todo: figure out if we want to use paragon tabs here (they don't utilize different urls) */}
                  <div className="card-header">
                    <ul className="nav nav-tabs card-header-tabs">
                      <li className="nav-item">
                        <NavLink to={ROUTES.Block.HOME_SLUG(libraryId, blockId)} className="nav-link" end>View</NavLink>
                      </li>
                      <li className="nav-item">
                        {this.isEditable
                          ? <NavLink to={ROUTES.Block.EDIT_SLUG(libraryId, blockId)} className="nav-link">Edit</NavLink>
                          : <span className="nav-link">Edit</span>}
                      </li>
                      <li className="nav-item">
                        <NavLink to={ROUTES.Block.ASSETS_SLUG(libraryId, blockId)} className="nav-link">Assets</NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink to={ROUTES.Block.SOURCE_SLUG(libraryId, blockId)} className="nav-link">Source</NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink to={ROUTES.Block.LEARN_SLUG(libraryId, blockId)} className="nav-link">Learn</NavLink>
                      </li>
                    </ul>
                  </div>
                  <div className="card-body">
                    { this.props.view.status === LOADING_STATUS.LOADING ? (
                      <div
                        className="d-flex justify-content-center align-items-center flex-column"
                        style={{ height: '400px' }}
                      >
                        <Spinner animation="border" variant="primary" />
                      </div>
                    ) : (
                      <Routes>
                        <Route
                          path={PAGE_TYPE.HOME}
                          element={(
                            <LibraryBlock
                              view={this.props.view}
                              getHandlerUrl={this.getHandlerUrl}
                            />
                          )}
                        />
                        <Route
                          path={PAGE_TYPE.EDIT}
                          element={(
                            <LibraryBlock
                              view={this.props.view}
                              getHandlerUrl={this.getHandlerUrl}
                              onBlockNotification={this.handleBlockNotification}
                            />
                          )}
                        />
                        <Route
                          path={PAGE_TYPE.ASSETS}
                          element={(
                            <LibraryBlockAssets
                              assets={this.props.assets}
                              onDropFiles={this.handleDropFiles}
                              onDeleteFile={this.handleDeleteFile}
                            />
                          )}
                        />
                        <Route
                          path={PAGE_TYPE.SOURCE}
                          element={(
                            <LibraryBlockOlx
                              olx={this.props.olx}
                              onSaveOlx={this.handleSaveOlx}
                            />
                          )}
                        />
                        <Route
                          path={PAGE_TYPE.LEARN}
                          element={(
                            <>
                              <p>
                                This tab uses the LMS APIs so it shows the published version only
                                and will save user state.
                              </p>
                              <LibraryBlock
                                view={this.props.view}
                                getHandlerUrl={this.getHandlerUrl}
                              />
                            </>
                          )}
                        />
                      </Routes>
                    )}
                  </div>
                </Card>
              </article>
            </Col>
            <Col xs={12} md={4} xl={3}>
              <aside className="content-supplementary">
                <div className="bit">
                  <h3 className="title title-3">{intl.formatMessage(messages['library.block.aside.title'])}</h3>
                  <p>{intl.formatMessage(messages['library.block.aside.text.1'])}</p>
                  <ul className="list-actions">
                    <li className="action-item">
                      <a
                        href="http://edx.readthedocs.io/projects/open-edx-building-and-running-a-course/en/latest/course_components/libraries.html"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {intl.formatMessage(messages['library.block.aside.help.link'])}
                      </a>
                    </li>
                  </ul>
                </div>
                <div id="publish-unit" className="window">
                  <div className={`bit-publishing ${hasChanges && 'has-warnings'}`}>
                    <h3 className="bar-mod-title pub-status">
                      {intl.formatMessage(messages[`library.block.aside.${hasChanges ? 'draft' : 'published'}`])}
                    </h3>
                    <ActionRow isStacked>
                      <Button
                        variant="primary"
                            // className="w-100 p-2 btn-lg"
                        onClick={this.handleCommitLibrary}
                        disabled={!hasChanges}
                        aria-disabled={!hasChanges}
                      >
                        <strong>{intl.formatMessage(messages['library.block.aside.publish'])}</strong>
                      </Button>
                      <Button
                        variant="link"
                            // className="d-inline-block"
                        onClick={this.handleRevertLibrary}
                        disabled={!hasChanges}
                        aria-disabled={!hasChanges}
                      >
                        {intl.formatMessage(messages['library.block.aside.discard'])}
                      </Button>
                      <Button
                        variant="danger"
                            // className="w-100 p-2 btn-lg"
                        onClick={this.handleDeleteBlock}
                      >
                        <strong>{intl.formatMessage(messages['library.block.aside.delete'])}</strong>
                      </Button>
                    </ActionRow>
                    <div className="wrapper-pub-actions bar-mod-actions">
                      <ul className="action-list list-unstyled">
                        <li className="action-item" />
                        <li className="action-item text-right" />
                        <li className="action-item" />
                      </ul>
                    </div>
                  </div>
                </div>
              </aside>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  render() {
    return (
      <div className="container-fluid">
        {this.renderContent()}
      </div>
    );
  }
}

LibraryBlockPage.contextType = AppContext;

LibraryBlockPage.propTypes = {
  assets: fetchable(PropTypes.arrayOf(PropTypes.object)),
  clearLibraryBlockError: PropTypes.func.isRequired,
  commitLibraryChanges: PropTypes.func.isRequired,
  deleteLibraryBlock: PropTypes.func.isRequired,
  deleteLibraryBlockAsset: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  fetchLibraryBlockAssets: PropTypes.func.isRequired,
  fetchLibraryBlockMetadata: PropTypes.func.isRequired,
  fetchLibraryBlockOlx: PropTypes.func.isRequired,
  fetchLibraryBlockView: PropTypes.func.isRequired,
  fetchLibraryDetail: PropTypes.func.isRequired,
  initializeBlock: PropTypes.func.isRequired,
  focusBlock: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  path: PropTypes.string.isRequired,
  libraryId: PropTypes.string.isRequired,
  blockId: PropTypes.string.isRequired,
  library: libraryShape,
  metadata: fetchable(libraryBlockShape).isRequired,
  olx: fetchable(PropTypes.string).isRequired,
  revertLibraryChanges: PropTypes.func.isRequired,
  setLibraryBlockOlx: PropTypes.func.isRequired,
  setLibraryBlockError: PropTypes.func.isRequired,
  uploadLibraryBlockAssets: PropTypes.func.isRequired,
  view: fetchable(blockViewShape).isRequired,
};

LibraryBlockPage.defaultProps = libraryBlockInitialState;

export default connect(
  selectLibraryBlock,
  {
    focusBlock,
    clearLibraryBlockError,
    commitLibraryChanges,
    deleteLibraryBlock,
    deleteLibraryBlockAsset,
    fetchLibraryBlockAssets,
    fetchLibraryBlockMetadata,
    fetchLibraryBlockOlx,
    fetchLibraryBlockView,
    fetchLibraryDetail,
    revertLibraryChanges,
    setLibraryBlockOlx,
    setLibraryBlockError,
    uploadLibraryBlockAssets,
    initializeBlock,
  },
)(injectIntl(withNavigate(withParams(withPath(LibraryBlockPage)))));
