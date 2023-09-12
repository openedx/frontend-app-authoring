/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow,
  Col,
  Container,
  Row,
  Button,
  IconButton,
  Card,
  // Dropdown,
  SearchField,
  Form,
  Pagination,
  ModalDialog,
} from '@edx/paragon';
import { Edit } from '@edx/paragon/icons';
import { EditorPage } from '@edx/frontend-lib-content-components';
import { v4 as uuid4 } from 'uuid';
import { faPlus, faSync } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { connect } from 'react-redux';
import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { LibraryBlock } from '../edit-block/LibraryBlock';
import {
  clearLibrary,
  clearLibraryError,
  clearLibrarySuccess,
  commitLibraryChanges,
  createBlock,
  fetchBlockLtiUrl,
  fetchBlocks,
  fetchLibraryDetail,
  revertLibraryChanges,
  searchLibrary,
} from './data';
import {
  selectLibraryEdit,
  updateLibrary,
} from '../configure-library/data';
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
  fetchable,
  paginated,
} from '../common';
import { LoadingPage } from '../../generic';
import messages from './messages';
import {
  deleteLibraryBlock,
  fetchLibraryBlockMetadata,
  fetchLibraryBlockView,
  initializeBlock,
  setLibraryBlockDisplayName,
} from '../edit-block/data';
import { blockStatesShape, blockViewShape } from '../edit-block/data/shapes';
import commonMessages from '../common/messages';
import selectLibraryDetail from '../common/data/selectors';
import { ErrorAlert } from '../common/ErrorAlert';
import { SuccessAlert } from '../common/SuccessAlert';
import { LoadGuard } from '../../generic/LoadingPage';

ensureConfig(['STUDIO_BASE_URL'], 'library API service');
const getHandlerUrl = async (blockId) => getXBlockHandlerUrl(blockId, XBLOCK_VIEW_SYSTEM.Studio, 'handler_name');

/**
 * BlockPreviewBase
 * Template component for BlockPreview cards, which are used to display
 * components and render controls for them in a library listing.
 */
export const BlockPreviewBase = ({
  intl, block, view, canEdit, showPreviews, showDeleteModal,
  setShowDeleteModal, showEditorModal, setShowEditorModal, setIsBlockUpdated, library, editView, isLtiUrlGenerating,
  ...props
}) => (
  <Card className="w-auto m-2">
    <Card.Header
      className="library-authoring-block-card-header"
      title={block.display_name}
      actions={(
        <ActionRow>
          <Button
            aria-label={intl.formatMessage(messages['library.detail.block.edit'])}
            onClick={() => setShowEditorModal(true)}
          >
            <FontAwesomeIcon icon={faEdit} className="pr-1" />
            {intl.formatMessage(messages['library.detail.block.edit'])}
          </Button>
          <Button
            aria-label={intl.formatMessage(messages['library.detail.block.delete'])}
            variant="tertiary"
            onClick={() => setShowDeleteModal(true)}
          >
            <FontAwesomeIcon icon={faTrashAlt} />
          </Button>
        </ActionRow>
      )}
    />
    <ModalDialog
      isOpen={showEditorModal}
      hasCloseButton={false}
      size="fullscreen"
    >
      <EditorPage
        blockType={block.block_type}
        blockId={block.id}
        studioEndpointUrl={getConfig().STUDIO_BASE_URL}
        lmsEndpointUrl={getConfig().LMS_BASE_URL}
        returnFunction={() => (response) => {
          setShowEditorModal(false);
          if (response && response.metadata) {
            props.setLibraryBlockDisplayName({
              blockId: block.id,
              displayName: response.metadata.display_name,
            });
            // This state change triggers the iframe to reload.
            setIsBlockUpdated(true);
          }
        }}
      />
    </ModalDialog>
    <ModalDialog
      isOpen={showDeleteModal}
      onClose={() => setShowDeleteModal(false)}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {intl.formatMessage(messages['library.detail.block.delete.modal.title'])}
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        {intl.formatMessage(messages['library.detail.block.delete.modal.body'])}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="link">
            Close
          </ModalDialog.CloseButton>
          <Button onClick={() => props.deleteLibraryBlock({ blockId: block.id })} variant="primary">
            {intl.formatMessage(messages['library.detail.block.delete.modal.confirmation.button'])}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
    {showPreviews && (
      <Card>
        <Card.Body>
          <LibraryBlock getHandlerUrl={getHandlerUrl} view={view} />
        </Card.Body>
      </Card>
    )}
  </Card>
);

BlockPreviewBase.propTypes = {
  block: libraryBlockShape.isRequired,
  canEdit: PropTypes.bool.isRequired,
  deleteLibraryBlock: PropTypes.func.isRequired,
  editView: PropTypes.string.isRequired,
  fetchBlockLtiUrl: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  isLtiUrlGenerating: PropTypes.bool,
  library: libraryShape.isRequired,
  setIsBlockUpdated: PropTypes.func.isRequired,
  setLibraryBlockDisplayName: PropTypes.func.isRequired,
  setShowDeleteModal: PropTypes.func.isRequired,
  setShowEditorModal: PropTypes.func.isRequired,
  showDeleteModal: PropTypes.bool.isRequired,
  showEditorModal: PropTypes.bool.isRequired,
  showPreviews: PropTypes.bool.isRequired,
  view: fetchable(blockViewShape).isRequired,
};

BlockPreviewBase.defaultProps = {
  isLtiUrlGenerating: false,
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
  intl, block, blockView, blockStates, showPreviews, library, ltiUrlClipboard, ...props
}) => {
  // There are enough events that trigger the effects here that we need to keep track of what we're doing to avoid
  // doing it more than once, or running them when the state can no longer support these actions.
  //
  // This problem feels like there should be some way to generalize it and wrap it to avoid this issue.
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [isBlockUpdated, setIsBlockUpdated] = useState(false);

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
    if (needsView({ blockStates, id: block.id }) || isBlockUpdated) {
      props.fetchLibraryBlockView({
        blockId: block.id,
        viewSystem: XBLOCK_VIEW_SYSTEM.Studio,
        viewName: 'student_view',
      });
      setIsBlockUpdated(false);
    }
  }, [blockStates[block.id], showPreviews, isBlockUpdated]);

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

  let isLtiUrlGenerating;
  if (library.allow_lti) {
    const isBlockOnClipboard = ltiUrlClipboard.value.blockId === block.id;
    isLtiUrlGenerating = isBlockOnClipboard && ltiUrlClipboard.status === LOADING_STATUS.LOADING;

    if (isBlockOnClipboard && ltiUrlClipboard.status === LOADING_STATUS.LOADED) {
      const clipboard = document.createElement('textarea');
      clipboard.value = getConfig().STUDIO_BASE_URL + ltiUrlClipboard.value.lti_url;
      document.body.appendChild(clipboard);
      clipboard.select();
      document.execCommand('copy');
      document.body.removeChild(clipboard);
    }
  }

  return (
    <BlockPreview
      block={block}
      canEdit={canEdit}
      deleteLibraryBlock={props.deleteLibraryBlock}
      editView={editView}
      fetchBlockLtiUrl={props.fetchBlockLtiUrl}
      isLtiUrlGenerating={isLtiUrlGenerating}
      library={library}
      setIsBlockUpdated={setIsBlockUpdated}
      setLibraryBlockDisplayName={props.setLibraryBlockDisplayName}
      setShowDeleteModal={setShowDeleteModal}
      setShowEditorModal={setShowEditorModal}
      showDeleteModal={showDeleteModal}
      showEditorModal={showEditorModal}
      showPreviews={showPreviews}
      view={blockView(block)}
    />
  );
};

BlockPreviewContainerBase.defaultProps = {
  blockView: null,
  ltiUrlClipboard: null,
};

BlockPreviewContainerBase.propTypes = {
  block: libraryBlockShape.isRequired,
  blockStates: blockStatesShape.isRequired,
  blockView: PropTypes.func,
  deleteLibraryBlock: PropTypes.func.isRequired,
  fetchBlockLtiUrl: PropTypes.func.isRequired,
  fetchLibraryBlockView: PropTypes.func.isRequired,
  fetchLibraryBlockMetadata: PropTypes.func.isRequired,
  initializeBlock: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  library: libraryShape.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  ltiUrlClipboard: fetchable(PropTypes.object),
  setLibraryBlockDisplayName: PropTypes.func.isRequired,
  showPreviews: PropTypes.bool.isRequired,
};

const ButtonTogglesBase = ({ setShowPreviews, showPreviews, intl }) => (
  <>
    {/* todo: either reimplement the scroll to the add components button functionality,
              figure out a better UX for the add component button at the top, or just
              remove it entirely */}
    {/* <Button variant="success" className="mr-1" disabled={sending} onClick={quickAddBehavior}>
      <FontAwesomeIcon icon={faPlus} className="pr-1" />
      {intl.formatMessage(messages[`library.detail.add_${library.type}`])}
    </Button> */}
    <Button variant="primary" className="ml-1" onClick={() => setShowPreviews(!showPreviews)}>
      <FontAwesomeIcon icon={faSync} className="pr-1" />
      { intl.formatMessage(showPreviews ? messages['library.detail.hide_previews'] : messages['library.detail.show_previews']) }
    </Button>
  </>
);

ButtonTogglesBase.propTypes = {
  intl: intlShape.isRequired,
  showPreviews: PropTypes.bool.isRequired,
  setShowPreviews: PropTypes.func.isRequired,
};

const ButtonToggles = injectIntl(ButtonTogglesBase);

const BlockPreviewContainer = connect(
  selectLibraryDetail,
  {
    deleteLibraryBlock,
    fetchBlockLtiUrl,
    fetchLibraryBlockView,
    fetchLibraryBlockMetadata,
    initializeBlock,
    setLibraryBlockDisplayName,
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
 * LibraryAuthoringPageHeaderBase
 * Title component for the LibraryAuthoringPageBase.
 */
const LibraryAuthoringPageHeaderBase = ({ intl, library, ...props }) => {
  const [inputIsActive, setIsActive] = useState(false);
  const handleSaveTitle = (event) => {
    const newTitle = event.target.value;
    if (newTitle && newTitle !== library.title) {
      props.updateLibrary({ data: { title: newTitle, libraryId: library.id } });
    }
    setIsActive(false);
  };
  const handleClick = () => {
    setIsActive(true);
  };

  return (
    <h1 className="page-header-title">
      { inputIsActive
        ? (
          <Form.Control
            autoFocus
            name="title"
            id="title"
            type="text"
            aria-label="Title input"
            defaultValue={library.title}
            onBlur={handleSaveTitle}
            onKeyDown={event => {
              if (event.key === 'Enter') { handleSaveTitle(event); }
            }}
          />
        )
        : (
          <>
            {library.title}
            <IconButton
              invertColors
              isActive
              iconAs={Edit}
              alt="Edit name button"
              onClick={handleClick}
              className="ml-3"
            />
          </>
        )}
    </h1>
  );
};

LibraryAuthoringPageHeaderBase.propTypes = {
  intl: intlShape.isRequired,
  library: libraryShape.isRequired,
  updateLibrary: PropTypes.func.isRequired,
};

const LibraryAuthoringPageHeader = connect(
  selectLibraryEdit,
  {
    updateLibrary,
  },
)(injectIntl(LibraryAuthoringPageHeaderBase));

/**
 * LibraryAuthoringPage
 * Template component for the library Authoring page.
 */
export const LibraryAuthoringPageBase = ({
  intl, library, blockView, showPreviews, setShowPreviews,
  sending, addBlock, revertChanges, commitChanges, hasChanges, errorMessage, successMessage,
  quickAddBehavior, otherTypes, blocks, changeQuery, changeType, changePage,
  paginationOptions, typeOptions, query, type, ...props
}) => (
  <Container fluid>
    <header className="mast has-actions">
      <small className="card-subtitle">{intl.formatMessage(messages['library.detail.page.heading'])}</small>
      <ActionRow>
        <LibraryAuthoringPageHeader
          library={library}
        />
        <ActionRow.Spacer />
        <ButtonToggles
          setShowPreviews={setShowPreviews}
          showPreviews={showPreviews}
          library={library}
          sending={sending}
          quickAddBehavior={quickAddBehavior}
        />
      </ActionRow>
    </header>
    <Row className="pt-3">
      <ErrorAlert errorMessage={errorMessage} onClose={props.clearLibraryError} />
      <SuccessAlert successMessage={successMessage} onClose={props.clearLibrarySuccess} />
      <Col xs={12} md={8} xl={9}>
        <Card>
          <Card.Body>
            <ActionRow className="p-1 pl-2 pt-2">
              {(library.type === LIBRARY_TYPES.COMPLEX) && (
              <>
                <SearchField
                  className="flex-grow-1"
                  value={query}
                  placeholder={intl.formatMessage(messages['library.detail.search'])}
                  onSubmit={(value) => changeQuery(value)}
                  onChange={(value) => changeQuery(value)}
                />
                <ActionRow.Spacer />
                <Form.Control
                  className="flex-grow-0 flex-shrink-0 w-25"
                  as="select"
                  data-testid="filter-dropdown"
                  value={type}
                  onChange={(event) => changeType(event.target.value)}
                >
                  {typeOptions.map(typeOption => (
                    <option key={typeOption.value} value={typeOption.value}>{typeOption.label}</option>
                  ))}
                </Form.Control>
              </>
              )}
            </ActionRow>
            {/* todo: figure out how we want to handle these at low screen widths.
                      mobile is currently unsupported: so it doesn't make sense
                      to have partially implemented responsive logic */}
            {/* <Col xs={12} className="text-center d-md-none py-3">
              <ButtonToggles
                setShowPreviews={setShowPreviews}
                showPreviews={showPreviews}
                library={library}
                sending={sending}
                quickAddBehavior={quickAddBehavior}
                className="d-md-none py-3"
              />
            </Col> */}
            <LoadGuard
              loadingMessage={intl.formatMessage(messages['library.detail.loading.message'])}
              condition={blocks.status !== LOADING_STATUS.LOADING}
            >
              {() => blocks.value.data.map((block) => (
                <BlockPreviewContainer
                  key={block.id}
                  block={block}
                  blockView={blockView}
                  showPreviews={showPreviews}
                  library={library}
                />
              ))}
            </LoadGuard>
            {blocks.value.count > 0
              ? (
                <Col xs={12}>
                  <Pagination
                    className="library-blocks-pagination"
                    paginationLabel="pagination navigation"
                    currentPage={paginationOptions.currentPage}
                    pageCount={paginationOptions.pageCount}
                    buttonLabels={paginationOptions.buttonLabels}
                    onPageSelect={(page) => changePage(page)}
                  />
                </Col>
              )
              : null}
            <Col xs={12} className="text-center py-3 library-authoring-block-add-new">
              {library.type !== LIBRARY_TYPES.COMPLEX && (
              <Button
                variant="success"
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
                    {/* <div className="d-inline-block">
                      <Dropdown>
                        <Dropdown.Toggle
                          variant="success"
                          disabled={sending}
                          className="cta-button mr-2"
                          id="library-detail-add-component-dropdown"
                        >
                          Advanced
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
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
                    </div> */}
                    <Button variant="success" disabled={sending} onClick={() => addBlock('html')} className="cta-button">
                      Text
                    </Button>
                    <Button variant="success" disabled={sending} onClick={() => addBlock('problem')} className="cta-button mx-2">
                      Problem
                    </Button>
                    <Button variant="success" disabled={sending} onClick={() => addBlock('video')} className="cta-button">
                      Video
                    </Button>
                  </Col>
                </Row>
              )}
            </Col>
          </Card.Body>
        </Card>
      </Col>
      <Col className="library-authoring-sidebar" xs={12} md={4} xl={3}>
        <aside>
          <Row>
            <Col xs={12} className="order-1 order-md-0">
              <h3>{intl.formatMessage(messages['library.detail.sidebar.adding.heading'])}</h3>
              <p>{intl.formatMessage(messages['library.detail.sidebar.adding.first'])}</p>
              <p>{intl.formatMessage(messages['library.detail.sidebar.adding.second'])}</p>
              <h3>{intl.formatMessage(messages['library.detail.sidebar.using.heading'])}</h3>
              <p>{intl.formatMessage(messages['library.detail.sidebar.using.first'])}</p>
            </Col>
            <Col xs={12} className="py-3 order-0 order-md-1">
              <Card>
                <Card.Header
                  title={intl.formatMessage(messages[`library.detail.aside.${hasChanges ? 'draft' : 'published'}`])}
                />
                <Card.Footer>
                  <Button block disabled={!hasChanges} onClick={commitChanges}>
                    {intl.formatMessage(messages['library.detail.aside.publish'])}
                  </Button>
                  <Button variant="link" disabled={!hasChanges} onClick={revertChanges}>
                    {intl.formatMessage(messages['library.detail.aside.discard'])}
                  </Button>
                </Card.Footer>
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
  successMessage: null,
  blocks: null,
};

LibraryAuthoringPageBase.propTypes = {
  intl: intlShape.isRequired,
  library: libraryShape.isRequired,
  blocks: fetchable(paginated(libraryBlockShape)),
  blockView: PropTypes.func.isRequired,
  showPreviews: PropTypes.bool.isRequired,
  searchLibrary: PropTypes.func.isRequired,
  paginationOptions: PropTypes.shape({
    currentPage: PropTypes.number.isRequired,
    pageCount: PropTypes.number.isRequired,
    buttonLabels: PropTypes.shape({
      previous: PropTypes.string.isRequired,
      next: PropTypes.string.isRequired,
      page: PropTypes.string.isRequired,
      currentPage: PropTypes.string.isRequired,
      pageOfCount: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  changeQuery: PropTypes.func.isRequired,
  changeType: PropTypes.func.isRequired,
  changePage: PropTypes.func.isRequired,
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
  successMessage: PropTypes.string,
  clearLibraryError: PropTypes.func.isRequired,
  clearLibrarySuccess: PropTypes.func.isRequired,
  quickAddBehavior: PropTypes.func.isRequired,
  query: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  otherTypes: PropTypes.arrayOf(
    PropTypes.shape({
      block_type: PropTypes.string.isRequired,
      display_name: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

const LibraryAuthoringPage = injectIntl(LibraryAuthoringPageBase);

/**
 * LibraryAuthoringPageContainerBase
 *
 * Container for the Library Authoring page.
 * This is the main page for the authoring tool.
 */
export const LibraryAuthoringPageContainerBase = ({
  intl, library, blockStates, blocks, ...props
}) => {
  const { libraryId } = props.match.params;
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [sending, setSending] = useState(false);

  const pageSize = 20;
  const paginationParams = {
    page,
    page_size: pageSize,
  };

  // On mount.
  useEffect(() => {
    if (!library || (library && library.id !== libraryId)) {
      props.clearLibrary().then(() => {
        props.fetchLibraryDetail({ libraryId });
        props.fetchBlocks({ libraryId, paginationParams });
      });
    }
  }, []);

  const normalizeTypes = () => {
    let types;
    if (type === '^' && library) {
      types = library.blockTypes.map((entry) => entry.block_type);
      types = types.filter((entry) => (entry !== '') && (!BLOCK_FILTER_ORDER.includes(entry)));
      if (types.length === 0) {
        // We're asking for 'other components', but there are no other components. Hand the API something that should
        // return nothing.
        types = ['^'];
      }
    } else if (type === '') {
      types = [];
    } else {
      types = [type];
    }

    return types;
  };

  // Refresh page on query, type, or page changes.
  useEffect(() => {
    if (!sending) {
      props.searchLibrary({
        libraryId, paginationParams, query, types: normalizeTypes(),
      });
    }
  }, [query, type, page]);

  const changeQuery = (newQuery) => {
    // this gets fired when loading/switching paginated pages,
    // so we need to check to make sure the query actually changed
    if (newQuery !== query) {
      setPage(1);
      setQuery(newQuery);
    }
  };

  const changeType = (newType) => {
    setPage(1);
    setType(newType);
  };

  const changePage = (newPage) => {
    setPage(newPage);
  };

  // If we end up needing this across components, or we end up needing more settings like this, we'll have to create
  // another redux slice for 'common' settings which hydrates from localStorage.
  let initialPreviewState = localStorage.getItem('showPreviews');
  initialPreviewState = initialPreviewState ? JSON.parse(initialPreviewState) : true;
  const [showPreviews, baseSetShowPreviews] = useState(initialPreviewState);
  const setShowPreviews = (value) => {
    localStorage.setItem('showPreviews', value);
    baseSetShowPreviews(value);
  };

  // We need the library to be loaded for what follows.  We can't put this further up because it would change the order
  // of the useState/useEffect hooks on subsequent renders.
  if (!library || !blocks) {
    return <LoadingPage loadingMessage={intl.formatMessage(messages['library.detail.loading.message'])} />;
  }

  const lastPage = Math.ceil(blocks.value.count / pageSize) || 1;

  const addBlock = (blockType) => {
    let nextPage = lastPage;
    if (blocks.value.count && blocks.value.count % pageSize === 0) {
      nextPage += 1;
    }
    setSending(true);
    setPage(nextPage);
    props.createBlock({
      libraryId,
      data: {
        block_type: blockType,
        definition_id: `${uuid4()}`,
      },
      paginationParams: {
        ...paginationParams,
        page: nextPage,
      },
      query,
      types: normalizeTypes(),
    }).finally(() => {
      setSending(false);
    });
  };

  const commitChanges = () => {
    setSending(true);
    props.commitLibraryChanges({ libraryId }).finally(() => {
      setSending(false);
    });
  };

  const revertChanges = () => {
    setSending(true);
    props.revertLibraryChanges({ libraryId, paginationParams }).finally(() => {
      setSending(false);
    });
  };

  const preSelected = ['video', 'html', 'problem'];
  const otherTypes = (library
    && library.blockTypes.filter((blockSpec) => !preSelected.includes(blockSpec.block_type))
  ) || [];

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

  const paginationOptions = {
    currentPage: paginationParams.page,
    pageCount: lastPage,
    buttonLabels: {
      previous: intl.formatMessage(commonMessages['library.common.pagination.labels.previous']),
      next: intl.formatMessage(commonMessages['library.common.pagination.labels.next']),
      page: intl.formatMessage(commonMessages['library.common.pagination.labels.page']),
      currentPage: intl.formatMessage(commonMessages['library.common.pagination.labels.currentPage']),
      pageOfCount: intl.formatMessage(commonMessages['library.common.pagination.labels.pageOfCount']),
    },
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
      paginationOptions={paginationOptions}
      changeQuery={changeQuery}
      changeType={changeType}
      changePage={changePage}
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
  successMessage: null,
};

LibraryAuthoringPageContainerBase.propTypes = {
  intl: intlShape.isRequired,
  library: libraryShape,
  fetchLibraryDetail: PropTypes.func.isRequired,
  fetchBlocks: PropTypes.func.isRequired,
  searchLibrary: PropTypes.func.isRequired,
  blockStates: blockStatesShape.isRequired,
  blocks: fetchable(paginated(libraryBlockShape)).isRequired,
  createBlock: PropTypes.func.isRequired,
  clearLibrary: PropTypes.func.isRequired,
  commitLibraryChanges: PropTypes.func.isRequired,
  revertLibraryChanges: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  successMessage: PropTypes.string,
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
    clearLibrarySuccess,
    clearLibrary,
    createBlock,
    commitLibraryChanges,
    revertLibraryChanges,
    fetchLibraryDetail,
    fetchBlocks,
    searchLibrary,
  },
)(injectIntl(LibraryAuthoringPageContainerBase));

export default LibraryAuthoringPageContainer;
