import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Col,
  Container,
  Row,
  Button,
  Card,
  Navbar,
  Modal,
  Dropdown,
  SearchField, Input,
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
  createBlock,
  fetchBlocks,
  fetchLibraryDetail,
  revertLibraryChanges,
  searchLibrary,
} from './data';
import {
  BLOCK_FILTER_ORDER,
  BLOCK_TYPE_EDIT_DENYLIST,
  getXBlockHandlerUrl,
  LIBRARY_TYPES,
  libraryBlockShape,
  libraryShape,
  LOADING_STATUS,
  ROUTES,
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
import { blockStatesShape, blockViewShape, fetchable } from '../edit-block/data/shapes';
import commonMessages from '../common/messages';
import selectLibraryDetail from '../common/data/selectors';
import { ErrorAlert } from '../common/ErrorAlert';
import { LoadGuard } from '../../generic/LoadingPage';

const getHandlerUrl = async (blockId) => getXBlockHandlerUrl(blockId, XBLOCK_VIEW_SYSTEM.Studio, 'handler_name');

/**
 * BlockPreviewBase
 * Template component for BlockPreview cards, which are used to display
 * components and render controls for them in a library listing.
 */
export const BlockPreviewBase = ({
  intl, block, view, canEdit, showPreviews, showDeleteModal,
  setShowDeleteModal, library, previewKey, editView, ...props
}) => (
  <>
    <Navbar className="border">
      <Navbar.Brand>{block.display_name}</Navbar.Brand>
      <Navbar.Collapse className="justify-content-end">
        <Link to={editView}>
          <Button size="lg" className="mr-1">
            <FontAwesomeIcon icon={faEdit} className="pr-1" />
            {intl.formatMessage(messages['library.detail.block.edit'])}
          </Button>
        </Link>
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

BlockPreviewBase.propTypes = {
  intl: intlShape.isRequired,
  block: libraryBlockShape.isRequired,
  library: libraryShape.isRequired,
  view: fetchable(blockViewShape).isRequired,
  canEdit: PropTypes.bool.isRequired,
  editView: PropTypes.string.isRequired,
  showPreviews: PropTypes.bool.isRequired,
  showDeleteModal: PropTypes.bool.isRequired,
  setShowDeleteModal: PropTypes.func.isRequired,
  deleteLibraryBlock: PropTypes.func.isRequired,
  previewKey: PropTypes.string.isRequired,
};

export const BlockPreview = injectIntl(BlockPreviewBase);

const inStandby = ({ blockStates, id, attr }) => blockStates[id][attr].status === LOADING_STATUS.STANDBY;
const needsView = ({ blockStates, id }) => inStandby({ blockStates, id, attr: 'view' });
const needsMeta = ({ blockStates, id }) => inStandby({ blockStates, id, attr: 'metadata' });

/**
 * BlockPreviewContainerBase
 * Container component for the BlockPreview cards.
 * Handles the fetching of the block view and metadata.
 */
const BlockPreviewContainerBase = ({
  intl, block, blockView, blockStates, showPreviews, library, ...props
}) => {
  // There are enough events that trigger the effects here that we need to keep track of what we're doing to avoid
  // doing it more than once, or running them when the state can no longer support these actions.
  //
  // This problem feels like there should be some way to generalize it and wrap it to avoid this issue.
  useEffect(() => {
    props.initializeBlock({
      blockId: block.id,
    });
  }, []);
  useEffect(() => {
    if (!blockStates[block.id] || !showPreviews) {
      return;
    }
    if (needsMeta({ blockStates, id: block.id })) {
      props.fetchLibraryBlockMetadata({ blockId: block.id });
    }
    if (needsView({ blockStates, id: block.id })) {
      props.fetchLibraryBlockView({
        blockId: block.id,
        viewSystem: XBLOCK_VIEW_SYSTEM.Studio,
        viewName: 'student_view',
      });
    }
  }, [blockStates[block.id], showPreviews]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // Need to force the iframe to be different if navigating away. Otherwise landing on the edit page
  // will show the student view, and navigating back will show the edit view in the block list. React is smart enough
  // to guess these iframes are the same between routes and will try to preserve rather than rerender, but that works
  // against us here. Setting an explicit key prevents it from matching the two.
  const previewKey = useMemo(() => `${uuid4()}`, [block.id]);

  if (blockStates[block.id] === undefined) {
    return <LoadingPage loadingMessage={intl.formatMessage(messages['library.detail.loading.message'])} />;
  }
  const { metadata } = blockStates[block.id];
  const canEdit = metadata !== null && !BLOCK_TYPE_EDIT_DENYLIST.includes(metadata.block_type);

  let editView;
  if (canEdit) {
    editView = ROUTES.Block.EDIT_SLUG(library.id, block.id);
  } else {
    editView = ROUTES.Detail.HOME_SLUG(library.id, block.id);
  }

  return (
    <BlockPreview
      view={blockView(block)}
      block={block}
      canEdit={canEdit}
      editView={editView}
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
  blockStates: blockStatesShape.isRequired,
  blockView: PropTypes.func,
  fetchLibraryBlockView: PropTypes.func.isRequired,
  fetchLibraryBlockMetadata: PropTypes.func.isRequired,
  initializeBlock: PropTypes.func.isRequired,
  showPreviews: PropTypes.bool.isRequired,
  deleteLibraryBlock: PropTypes.func.isRequired,
  library: libraryShape.isRequired,
};

const ButtonTogglesBase = ({
  library, setShowPreviews, showPreviews, sending, quickAddBehavior, intl,
}) => (
  <>
    <Button variant="success" className="mr-1" size="lg" disabled={sending} onClick={quickAddBehavior}>
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
  quickAddBehavior: PropTypes.func.isRequired,
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

const deriveTypeOptions = (blockTypes, intl) => {
  let typeOptions = blockTypes.map((typeSpec) => (
    { value: typeSpec.block_type, label: typeSpec.display_name }
  ));
  typeOptions.push({ value: '^', label: intl.formatMessage(messages['library.detail.other_component']) });
  typeOptions = typeOptions.filter((entry) => BLOCK_FILTER_ORDER.includes(entry.value));
  typeOptions.sort((a, b) => {
    const aOrder = BLOCK_FILTER_ORDER.indexOf(a.value);
    const bOrder = BLOCK_FILTER_ORDER.indexOf(b.value);
    if (aOrder === bOrder) {
      // Should never happen, but could cause problems if it did and we didn't indicate they should be treated the same.
      return 0;
    }
    if (BLOCK_FILTER_ORDER.indexOf(a.value) > BLOCK_FILTER_ORDER.indexOf(b.value)) {
      return 1;
    }
    return -1;
  });

  typeOptions.unshift({ value: '', label: intl.formatMessage(messages['library.detail.all_types']) });
  return typeOptions;
};

/**
 * LibraryAuthoringPage
 * Template component for the library Authoring page.
 */
export const LibraryAuthoringPageBase = ({
  intl, library, blockView, showPreviews, setShowPreviews,
  sending, addBlock, revertChanges, commitChanges, hasChanges, errorMessage,
  quickAddBehavior, otherTypes, blocks, updateSearch, typeOptions, query, type,
  ...props
}) => (
  <Container fluid="lg">
    <Row className="pt-5 px-2 px-xl-0">
      <Col xs={12} md={8} xl={9} className="page-header-section">
        <small className="card-subtitle">{intl.formatMessage(messages['library.detail.page.heading'])}</small>
        <h1 className="page-header-title">{library.title}</h1>
      </Col>
      <ErrorAlert errorMessage={errorMessage} onClose={props.clearLibraryError} />
      <Col xs={12} md={4} xl={3} className="text-center d-none d-md-block">
        <ButtonToggles
          setShowPreviews={setShowPreviews}
          showPreviews={showPreviews}
          library={library}
          sending={sending}
          quickAddBehavior={quickAddBehavior}
        />
      </Col>
      <Col xs={12} className="pb-5">
        <hr />
      </Col>
      <Col xs={12} md={8} xl={9}>
        <Card>
          <Card.Body>
            <Row>
              {(library.type === LIBRARY_TYPES.COMPLEX) && (
                <>
                  <Col xs={12} md={9} className="pb-2">
                    <SearchField
                      label={intl.formatMessage(messages['library.detail.search'])}
                      value={query}
                      onSubmit={(value) => updateSearch({ query: value })}
                      onChange={(value) => updateSearch({ query: value })}
                    />
                  </Col>
                  <Col xs={12} md={3} className="pb-2">
                    <Input
                      type="select"
                      data-testid="filter-dropdown"
                      value={type}
                      options={typeOptions}
                      onChange={(event) => updateSearch({ type: event.target.value })}
                    />
                  </Col>
                </>
              )}
              <Col xs={12} className="text-center d-md-none py-3">
                <ButtonToggles
                  setShowPreviews={setShowPreviews}
                  showPreviews={showPreviews}
                  library={library}
                  sending={sending}
                  quickAddBehavior={quickAddBehavior}
                  className="d-md-none py-3"
                />
              </Col>
              <LoadGuard
                loadingMessage={intl.formatMessage(messages['library.detail.loading.message'])}
                condition={blocks.status !== LOADING_STATUS.LOADING}
              >
                {() => blocks.value.map((block) => (
                  <Col xs={12} key={block.id} className="pb-3">
                    <BlockPreviewContainer
                      block={block}
                      blockView={blockView}
                      showPreviews={showPreviews}
                      library={library}
                    />
                  </Col>
                ))}
              </LoadGuard>
              <Col xs={12} className="text-center py-3 add-buttons-container">
                {library.type !== LIBRARY_TYPES.COMPLEX && (
                <Button
                  variant="success"
                  size="lg"
                  disabled={sending}
                  onClick={() => addBlock(library.type)}
                  className="cta-button"
                >
                  <FontAwesomeIcon icon={faPlus} className="pr-1" />
                  {intl.formatMessage(messages[`library.detail.add_${library.type}`])}
                </Button>
                )}
                {library.type === LIBRARY_TYPES.COMPLEX && (
                  <Row>
                    <Col xs={12}>
                      <h2>{intl.formatMessage(messages['library.detail.add_component_heading'])}</h2>
                    </Col>
                    <Col xs={12} className="text-center">
                      <div className="d-inline-block">
                        <Dropdown>
                          <Dropdown.Toggle variant="success" size="lg" disabled={sending} className="cta-button mr-2">
                            Advanced
                          </Dropdown.Toggle>
                          <Dropdown.Menu size="lg">
                            {otherTypes.map((blockSpec) => (
                              <Dropdown.Item
                                onClick={() => addBlock(blockSpec.block_type)}
                                key={blockSpec.block_type}
                              >
                                {blockSpec.display_name}
                              </Dropdown.Item>
                            ))}
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                      <Button variant="success" size="lg" disabled={sending} onClick={() => addBlock('html')} className="cta-button">
                        HTML
                      </Button>
                      <Button variant="success" size="lg" disabled={sending} onClick={() => addBlock('problem')} className="cta-button mx-2">
                        Problem
                      </Button>
                      <Button variant="success" size="lg" disabled={sending} onClick={() => addBlock('video')} className="cta-button">
                        Video
                      </Button>
                    </Col>
                  </Row>
                )}
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

LibraryAuthoringPageBase.defaultProps = {
  errorMessage: '',
  blocks: null,
};

LibraryAuthoringPageBase.propTypes = {
  intl: intlShape.isRequired,
  library: libraryShape.isRequired,
  blocks: fetchable(PropTypes.arrayOf(libraryBlockShape)),
  blockView: PropTypes.func.isRequired,
  showPreviews: PropTypes.bool.isRequired,
  searchLibrary: PropTypes.func.isRequired,
  updateSearch: PropTypes.func.isRequired,
  setShowPreviews: PropTypes.func.isRequired,
  typeOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  sending: PropTypes.bool.isRequired,
  addBlock: PropTypes.func.isRequired,
  hasChanges: PropTypes.bool.isRequired,
  revertChanges: PropTypes.func.isRequired,
  commitChanges: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  clearLibraryError: PropTypes.func.isRequired,
  quickAddBehavior: PropTypes.func.isRequired,
  query: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  otherTypes: PropTypes.arrayOf(
    PropTypes.shape({
      block_type: PropTypes.string.isRequired, display_name: PropTypes.string.isRequired,
    }),
  ).isRequired,
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
  intl, library, blockStates, blocks, ...props
}) => {
  // Explicit empty dependencies means on mount.
  useEffect(() => {
    const { libraryId } = props.match.params;
    if (!library || (library && library.id !== libraryId)) {
      props.clearLibrary().then(() => {
        props.fetchLibraryDetail({ libraryId });
        props.fetchBlocks({ libraryId });
      });
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
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');

  const addBlock = (blockType) => {
    setSending(true);
    props.createLibraryBlock({
      libraryId: library.id,
      data: {
        block_type: blockType,
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

  const preSelected = ['video', 'html', 'problem'];
  const otherTypes = (library
    && library.blockTypes.filter((blockSpec) => !preSelected.includes(blockSpec.block_type))
  ) || [];

  if (!library) {
    return <LoadingPage loadingMessage={intl.formatMessage(messages['library.detail.loading.message'])} />;
  }
  const typeOptions = deriveTypeOptions(library.blockTypes, intl);

  const hasChanges = library.has_unpublished_changes || library.has_unpublished_deletes;
  const blockView = (block) => {
    if (blockStates[block.id]) {
      return blockStates[block.id].view;
    }
    return { value: null, status: LOADING_STATUS.STANDBY };
  };
  const quickAddBehavior = () => {
    if (library.type === LIBRARY_TYPES.COMPLEX) {
      document.querySelector('.add-buttons-container').scrollIntoView({ behavior: 'smooth' });
    } else {
      addBlock(library.type);
    }
  };
  const updaters = { query: setQuery, type: setType };
  const updateSearch = (patch) => {
    Object.keys(patch).forEach((key) => {
      updaters[key](patch[key]);
    });
    let typeNormalized = patch.type;
    if (patch.type === undefined) {
      typeNormalized = type;
    }
    if (typeNormalized === '^') {
      typeNormalized = library.blockTypes.map((entry) => entry.block_type);
      typeNormalized = typeNormalized.filter((entry) => (entry !== '') && (!BLOCK_FILTER_ORDER.includes(entry)));
      if (typeNormalized.length === 0) {
        // We're asking for 'other components', but there are no other components. Hand the API something that should
        // return nothing.
        typeNormalized = ['^'];
      }
    } else if (typeNormalized === '') {
      typeNormalized = [];
    } else {
      typeNormalized = [typeNormalized];
    }
    // Conditionally override query if it's defined in the patch.
    const clearedPatch = { ...patch };
    // We've normalized type, so remove it.
    delete clearedPatch.type;
    props.searchLibrary({
      query, types: typeNormalized, libraryId: library.id, ...clearedPatch,
    });
  };
  return (
    <LibraryAuthoringPage
      blockStates={blockStates}
      blockView={blockView}
      library={library}
      showPreviews={showPreviews}
      setShowPreviews={setShowPreviews}
      sending={sending}
      addBlock={addBlock}
      hasChanges={hasChanges}
      commitChanges={commitChanges}
      revertChanges={revertChanges}
      quickAddBehavior={quickAddBehavior}
      typeOptions={typeOptions}
      updateSearch={updateSearch}
      query={query}
      type={type}
      otherTypes={otherTypes}
      blocks={blocks}
      {...props}
    />
  );
};

LibraryAuthoringPageContainerBase.defaultProps = {
  library: null,
  errorMessage: null,
};

LibraryAuthoringPageContainerBase.propTypes = {
  intl: intlShape.isRequired,
  library: libraryShape,
  fetchLibraryDetail: PropTypes.func.isRequired,
  fetchBlocks: PropTypes.func.isRequired,
  searchLibrary: PropTypes.func.isRequired,
  blockStates: blockStatesShape.isRequired,
  blocks: fetchable(PropTypes.arrayOf(libraryBlockShape)).isRequired,
  createLibraryBlock: PropTypes.func.isRequired,
  clearLibrary: PropTypes.func.isRequired,
  commitLibraryChanges: PropTypes.func.isRequired,
  revertLibraryChanges: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
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
    createLibraryBlock: createBlock,
    commitLibraryChanges,
    revertLibraryChanges,
    fetchLibraryDetail,
    fetchBlocks,
    searchLibrary,
  },
)(injectIntl(LibraryAuthoringPageContainerBase));

export default LibraryAuthoringPageContainer;
