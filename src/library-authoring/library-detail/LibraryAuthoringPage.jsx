import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Col,
  Container,
  Row,
  Button,
  Card,
  Navbar, Modal,
} from '@edx/paragon';
import { v4 as uuid4 } from 'uuid';
import { faPlus, faSync } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Link } from 'react-router-dom';
import { LibraryBlock } from '../edit-block/LibraryBlock';
import {
  clearLibrary,
  clearLibraryError,
  commitLibraryChanges,
  createLibraryBlock,
  fetchLibraryDetail,
  revertLibraryChanges,
  selectLibraryDetail,
} from './data';
import {
  BLOCK_TYPE_EDIT_DENYLIST,
  getXBlockHandlerUrl,
  libraryBlockShape,
  libraryShape, ROUTES,
  XBLOCK_VIEW_SYSTEM,
} from '../common/data';
import { LoadingPage } from '../../generic';
import messages from './messages';
import {
  deleteLibraryBlock,
  fetchLibraryBlockMetadata,
  fetchLibraryBlockView,
  initializeBlock,
} from '../edit-block/data';
import { blocksShape, blockViewShape } from '../edit-block/data/shapes';
import commonMessages from '../common/messages';


/**
 * BlockPreviewBase
 * Template component for BlockPreview cards, which are used to display
 * components and render controls for them in a library listing.
 */
export const BlockPreviewBase = ({
  intl, block, view, canEdit, showPreviews, getHandlerUrl, showDeleteModal,
  setShowDeleteModal, library, previewKey, ...props
}) => (
  <>
    <Navbar className="border">
      <Navbar.Brand>{block.display_name}</Navbar.Brand>
      <Navbar.Collapse className="justify-content-end">
        { /* This won't work until complex types are supported. */ }
        {canEdit && (
          <Link to={ROUTES.Block.EDIT_SLUG(library.id, block.id)}>
            <Button size="lg" className="mr-1" disabled={canEdit}>
              <FontAwesomeIcon icon={faEdit} className="pr-1" />
              {intl.formatMessage(messages['library.detail.block.edit'])}
            </Button>
          </Link>
        )}
        { /* Studio has a copy button, but we don't yet. */}
        <Button
          aria-label={intl.formatMessage(messages['library.detail.block.delete'])}
          size="lg"
          onClick={() => setShowDeleteModal(true)}
        >
          <FontAwesomeIcon icon={faTrashAlt} />
        </Button>
      </Navbar.Collapse>
    </Navbar>
    <Modal
      open={showDeleteModal}
      title={intl.formatMessage(messages['library.detail.block.delete.modal.title'])}
      onClose={() => setShowDeleteModal(false)}
      body={(
        <div>
          <p>
            {intl.formatMessage(messages['library.detail.block.delete.modal.body'])}
          </p>
        </div>
      )}
      buttons={[
        <Button
          onClick={() => props.deleteLibraryBlock({ blockId: block.id })}
        >
          {intl.formatMessage(commonMessages['library.common.forms.button.yes'])}
        </Button>,
      ]}
    />
    {showPreviews && (
      <Card>
        <Card.Body>
          <LibraryBlock getHandlerUrl={getHandlerUrl} view={view} key={previewKey} />
        </Card.Body>
      </Card>
    )}
  </>
);

BlockPreviewBase.defaultProps = {
  view: null,
};

BlockPreviewBase.propTypes = {
  intl: intlShape.isRequired,
  block: libraryBlockShape.isRequired,
  library: libraryShape.isRequired,
  getHandlerUrl: PropTypes.func.isRequired,
  view: blockViewShape,
  canEdit: PropTypes.bool.isRequired,
  showPreviews: PropTypes.bool.isRequired,
  showDeleteModal: PropTypes.bool.isRequired,
  setShowDeleteModal: PropTypes.func.isRequired,
  deleteLibraryBlock: PropTypes.func.isRequired,
  previewKey: PropTypes.string.isRequired,
};

export const BlockPreview = injectIntl(BlockPreviewBase);

/**
 * BlockPreviewContainerBase
 * Container component for the BlockPreview cards.
 * Handles the fetching of the block view and metadata.
 */
const BlockPreviewContainerBase = ({
  intl, getHandlerUrl, block, blockView, blocks, showPreviews, library, ...props
}) => {
  useEffect(() => {
    props.initializeBlock({
      blockId: block.id,
    });
  }, []);
  useEffect(() => {
    if (!blocks[block.id] || !showPreviews) {
      return;
    }
    if (blocks[block.id].metadata === null) {
      props.fetchLibraryBlockMetadata({ blockId: block.id });
    }
    if (blocks[block.id].view === null) {
      props.fetchLibraryBlockView({
        blockId: block.id,
        viewSystem: XBLOCK_VIEW_SYSTEM.Studio,
        viewName: 'student_view',
      });
    }
  }, [blocks[block.id], showPreviews]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // Need to force the iframe to be different if navigating away. Otherwise landing on the edit page
  // will show the student view, and navigating back will show the edit view in the block list. React is smart enough
  // to guess these iframes are the same between routes and will try to preserve rather than rerender, but that works
  // against us here. Setting an explicit key prevents it from matching the two.
  const previewKey = useMemo(() => `${uuid4()}`, [block.id]);

  if (blocks[block.id] === undefined) {
    return <LoadingPage loadingMessage={intl.formatMessage(messages['library.detail.loading.message'])} />;
  }
  const { metadata } = blocks[block.id];
  const canEdit = metadata !== null && !BLOCK_TYPE_EDIT_DENYLIST.includes(metadata.block_type);

  return (
    <BlockPreview
      getHandlerUrl={getHandlerUrl}
      view={blockView(block)}
      block={block}
      canEdit={canEdit}
      showPreviews={showPreviews}
      showDeleteModal={showDeleteModal}
      setShowDeleteModal={setShowDeleteModal}
      deleteLibraryBlock={props.deleteLibraryBlock}
      library={library}
      previewKey={previewKey}
    />
  );
};

BlockPreviewContainerBase.defaultProps = {
  blockView: null,
};

BlockPreviewContainerBase.propTypes = {
  intl: intlShape.isRequired,
  block: libraryBlockShape.isRequired,
  blocks: blocksShape.isRequired,
  getHandlerUrl: PropTypes.func.isRequired,
  blockView: PropTypes.func,
  fetchLibraryBlockView: PropTypes.func.isRequired,
  fetchLibraryBlockMetadata: PropTypes.func.isRequired,
  initializeBlock: PropTypes.func.isRequired,
  showPreviews: PropTypes.bool.isRequired,
  deleteLibraryBlock: PropTypes.func.isRequired,
  library: libraryShape.isRequired,
};

const ButtonTogglesBase = ({
  library, setShowPreviews, showPreviews, sending, newBlock, intl,
}) => (
  <>
    <Button variant="success" className="mr-1" size="lg" disabled={sending} onClick={newBlock}>
      <FontAwesomeIcon icon={faPlus} className="pr-1" />
      {intl.formatMessage(messages[`library.detail.add_${library.type}`])}
    </Button>
    <Button variant="primary" className="ml-1" onClick={() => setShowPreviews(!showPreviews)} size="lg">
      <FontAwesomeIcon icon={faSync} className="pr-1" />
      { showPreviews && intl.formatMessage(messages['library.detail.hide_previews']) }
      { showPreviews || intl.formatMessage(messages['library.detail.show_previews']) }
    </Button>
  </>
);

ButtonTogglesBase.propTypes = {
  intl: intlShape.isRequired,
  library: libraryShape.isRequired,
  sending: PropTypes.bool.isRequired,
  showPreviews: PropTypes.bool.isRequired,
  setShowPreviews: PropTypes.func.isRequired,
  newBlock: PropTypes.func.isRequired,
};

const ButtonToggles = injectIntl(ButtonTogglesBase);

const BlockPreviewContainer = connect(
  selectLibraryDetail,
  {
    fetchLibraryBlockView,
    fetchLibraryBlockMetadata,
    initializeBlock,
    deleteLibraryBlock,
  },
)(injectIntl(BlockPreviewContainerBase));

/**
 * LibraryAuthoringPage
 * Template component for the library Authoring page.
 */
export const LibraryAuthoringPageBase = ({
  intl, library, getHandlerUrl, blockView, showPreviews, setShowPreviews,
  sending, newBlock, revertChanges, commitChanges, hasChanges,
}) => (
  <Container fluid="lg">
    <Row className="pt-5 px-2 px-xl-0">
      <Col xs={12} md={8} xl={9} className="page-header-section">
        <small className="card-subtitle">{intl.formatMessage(messages['library.detail.page.heading'])}</small>
        <h1 className="page-header-title">{library.title}</h1>
      </Col>
      <Col xs={12} md={4} xl={3} className="text-center d-none d-md-block">
        <ButtonToggles
          setShowPreviews={setShowPreviews}
          showPreviews={showPreviews}
          library={library}
          sending={sending}
          newBlock={newBlock}
        />
      </Col>
      <Col xs={12} className="pb-5">
        <hr />
      </Col>
      <Col xs={12} md={8} xl={9}>
        <Card>
          <Card.Body>
            <Row>
              <Col xs={12} className="text-center d-md-none py-3">
                <ButtonToggles
                  setShowPreviews={setShowPreviews}
                  showPreviews={showPreviews}
                  library={library}
                  sending={sending}
                  newBlock={newBlock}
                  className="d-md-none py-3"
                />
              </Col>
              {library.blocks && library.blocks.map((block) => (
                <Col xs={12} key={block.id} className="pb-3">
                  <BlockPreviewContainer
                    block={block}
                    getHandlerUrl={getHandlerUrl(block.id)}
                    blockView={blockView}
                    showPreviews={showPreviews}
                    library={library}
                  />
                </Col>
              ))}
              <Col xs={12} className="text-center py-3">
                <Button variant="success" size="lg" disabled={sending} onClick={newBlock} className="cta-button">
                  <FontAwesomeIcon icon={faPlus} className="pr-1" />
                  {intl.formatMessage(messages[`library.detail.add_${library.type}`])}
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
      <Col xs={12} md={4} xl={3}>
        <aside>
          <Row>
            <Col xs={12} className="sidebar-info order-1 order-md-0">
              <h3>{intl.formatMessage(messages['library.detail.sidebar.adding.heading'])}</h3>
              <p>{intl.formatMessage(messages['library.detail.sidebar.adding.first'])}</p>
              <p>{intl.formatMessage(messages['library.detail.sidebar.adding.second'])}</p>
              <h3>{intl.formatMessage(messages['library.detail.sidebar.using.heading'])}</h3>
              <p>{intl.formatMessage(messages['library.detail.sidebar.using.first'])}</p>
            </Col>
            <Col xs={12} className="py-3 order-0 order-md-1">
              <Card>
                <Card.Body>
                  <Row>
                    <Col xs={12}>
                      <h3>
                        {intl.formatMessage(messages[`library.detail.aside.${hasChanges ? 'draft' : 'published'}`])}
                      </h3>
                    </Col>
                    <Col xs={12} className="text-center py-3">
                      <Button size="lg" block disabled={!hasChanges} onClick={commitChanges}>
                        {intl.formatMessage(messages['library.detail.aside.publish'])}
                      </Button>
                    </Col>
                    <Col xs={12} className="text-right">
                      <Button variant="link" disabled={!hasChanges} onClick={revertChanges}>
                        {intl.formatMessage(messages['library.detail.aside.discard'])}
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </aside>
      </Col>
    </Row>
  </Container>
);

LibraryAuthoringPageBase.propTypes = {
  intl: intlShape.isRequired,
  library: libraryShape.isRequired,
  getHandlerUrl: PropTypes.func.isRequired,
  blockView: PropTypes.func.isRequired,
  showPreviews: PropTypes.bool.isRequired,
  setShowPreviews: PropTypes.func.isRequired,
  sending: PropTypes.bool.isRequired,
  newBlock: PropTypes.func.isRequired,
  hasChanges: PropTypes.bool.isRequired,
  revertChanges: PropTypes.func.isRequired,
  commitChanges: PropTypes.func.isRequired,
};

const LibraryAuthoringPage = injectIntl(LibraryAuthoringPageBase);

/**
 * LibraryAuthoringPageContainerBase
 *
 * Container for the Library Authoring page.
 * This is the main page for the authoring tool-- or it will be.
 * It replaces LibraryPage. Currently, it only supports Video and Problem
 * type libraries. Complex libraries will be supported in a later release.
 */
export const LibraryAuthoringPageContainerBase = ({
  intl, library, blocks, ...props
}) => {
  // Explicit empty dependencies means on mount.
  useEffect(() => {
    const { libraryId } = props.match.params;
    if (!library || (library && library.id !== libraryId)) {
      props.clearLibrary().then(() => props.fetchLibraryDetail({ libraryId }));
    }
  }, []);
  // If we end up needing this across components, or we end up needing more settings like this, we'll have to create
  // another redux slice for 'common' settings which hydrates from localStorage.
  let initialPreviewState = localStorage.getItem('showPreviews');
  initialPreviewState = initialPreviewState ? JSON.parse(initialPreviewState) : true;
  const [showPreviews, baseSetShowPreviews] = useState(initialPreviewState);
  const setShowPreviews = (value) => {
    localStorage.setItem('showPreviews', value);
    baseSetShowPreviews(value);
  };
  const [sending, setSending] = useState(false);

  const newBlock = () => {
    setSending(true);
    props.createLibraryBlock({
      libraryId: library.id,
      data: {
        block_type: library.type,
        definition_id: `${uuid4()}`,
      },
    }).finally(() => setSending(false));
  };

  const commitChanges = () => {
    setSending(true);
    props.commitLibraryChanges({ libraryId: library.id }).finally(() => {
      setSending(false);
    });
  };

  const revertChanges = () => {
    setSending(true);
    props.revertLibraryChanges({ libraryId: library.id }).finally(() => {
      setSending(false);
    });
  };

  if (!library) {
    return <LoadingPage loadingMessage={intl.formatMessage(messages['library.detail.loading.message'])} />;
  }
  const hasChanges = library.has_unpublished_changes || library.has_unpublished_deletes;
  const blockView = (block) => {
    if (blocks[block.id]) {
      return blocks[block.id].view;
    }
    return null;
  };
  const getHandlerUrl = (blockId) => () => getXBlockHandlerUrl(
    blockId, XBLOCK_VIEW_SYSTEM.Studio, 'handler_url',
  );
  return (
    <LibraryAuthoringPage
      getHandlerUrl={getHandlerUrl}
      blocks={blocks}
      blockView={blockView}
      library={library}
      showPreviews={showPreviews}
      setShowPreviews={setShowPreviews}
      sending={sending}
      newBlock={newBlock}
      hasChanges={hasChanges}
      commitChanges={commitChanges}
      revertChanges={revertChanges}
      {...props}
    />
  );
};

LibraryAuthoringPageContainerBase.defaultProps = {
  library: null,
};

LibraryAuthoringPageContainerBase.propTypes = {
  intl: intlShape.isRequired,
  library: libraryShape,
  fetchLibraryDetail: PropTypes.func.isRequired,
  blocks: blocksShape.isRequired,
  createLibraryBlock: PropTypes.func.isRequired,
  clearLibrary: PropTypes.func.isRequired,
  commitLibraryChanges: PropTypes.func.isRequired,
  revertLibraryChanges: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      libraryId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};


const LibraryAuthoringPageContainer = connect(
  selectLibraryDetail,
  {
    clearLibraryError,
    clearLibrary,
    createLibraryBlock,
    commitLibraryChanges,
    revertLibraryChanges,
    fetchLibraryDetail,
  },
)(injectIntl(LibraryAuthoringPageContainerBase));

window.LibraryAuthoringPageContainer = LibraryAuthoringPageContainer;

export default LibraryAuthoringPageContainer;
