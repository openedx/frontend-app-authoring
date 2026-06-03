import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  useToggle, Icon, Form, IconButtonWithTooltip, Button, OverlayTrigger, Tooltip, Stack,
} from '@openedx/paragon';
import { EditOutline as EditIcon } from '@openedx/paragon/icons';
import { isEmpty } from 'lodash';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

import { NOTIFICATION_MESSAGES } from '@src/constants';
import {
  hideProcessingNotification,
  showProcessingNotification,
} from '@src/generic/processing-notification/data/slice';
import { useWaffleFlags } from '@src/data/apiHooks';

import CourseOutlineUnitCardExtraActionsSlot from '@src/plugin-slots/CourseOutlineUnitCardExtraActionsSlot';
import { setCurrentItem, setCurrentSection, setCurrentSubsection } from '@src/course-outline/data/slice';
import { getSectionsList } from '@src/course-outline/data/selectors';
import { fetchCourseSectionQuery } from '@src/course-outline/data/thunk';
import { setCourseItemOrderList, pasteBlock } from '@src/course-outline/data/api';
import { RequestStatus, RequestStatusType } from '@src/data/constants';
import CardHeader from '@src/course-outline/card-header/CardHeader';
import cardHeaderMessages from '@src/course-outline/card-header/messages';
import SortableItem from '@src/course-outline/drag-helper/SortableItem';
import TitleButton from '@src/course-outline/card-header/TitleButton';
import TitleLink from '@src/course-outline/card-header/TitleLink';
import XBlockStatus from '@src/course-outline/xblock-status/XBlockStatus';
import { getItemStatus, getItemStatusBorder, scrollToElement } from '@src/course-outline/utils';
import { useClipboard } from '@src/generic/clipboard';
import { UpstreamInfoIcon } from '@src/generic/upstream-info-icon';
import { PreviewLibraryXBlockChanges } from '@src/course-unit/preview-changes';
import { invalidateLinksQuery } from '@src/course-libraries/data/apiHooks';
import type { XBlock } from '@src/data/types';
import { getItemIcon } from '@src/generic/block-type-utils';
import AlertError from '@src/generic/alert-error';
import ModalIframe from '@src/generic/modal-iframe';
import EditorPage from '@src/editors/EditorPage';
import supportedEditors from '@src/editors/supportedEditors';
import DraggableList, { SortableItem as GenericSortableItem } from '@src/generic/DraggableList';
import { ToastContext } from '@src/generic/toast-context';
import { deriveHasPartitionGroupComponents, EMPTY_UNIT_COMPONENT_ACTIONS, findSectionIdForUnit } from './data/api';
import { useUnitHandler, useComponentTemplates, useRenameUnitComponent } from './data/hooks';
import AddComponentWidget from './AddComponentWidget';
import ComponentMenu from './ComponentMenu';
import messages from './messages';

interface UnitCardProps {
  unit: XBlock;
  subsection: XBlock;
  section: XBlock;
  onOpenPublishModal: () => void;
  onOpenConfigureModal: () => void;
  onEditSubmit: (itemId: string, sectionId: string, displayName: string) => void,
  savingStatus?: RequestStatusType;
  onOpenDeleteModal: () => void;
  onOpenUnlinkModal: () => void;
  onDuplicateSubmit: () => void;
  getTitleLink: (locator: string) => string;
  index: number;
  getPossibleMoves: (index: number, step: number) => void,
  onOrderChange: (section: XBlock, moveDetails: any) => void,
  isSelfPaced: boolean;
  isCustomRelativeDatesActive: boolean;
  discussionsSettings: {
    providerType: string;
    enableGradedUnits: boolean;
  };
}

const UnitCard = ({
  unit,
  subsection,
  section,
  isSelfPaced,
  isCustomRelativeDatesActive,
  index,
  getPossibleMoves,
  onOpenPublishModal,
  onOpenConfigureModal,
  onEditSubmit,
  savingStatus,
  onOpenDeleteModal,
  onOpenUnlinkModal,
  onDuplicateSubmit,
  getTitleLink,
  onOrderChange,
  discussionsSettings,
}: UnitCardProps) => {
  const currentRef = useRef(null);
  const dispatch = useDispatch();
  const intl = useIntl();
  const sectionsList = useSelector(getSectionsList);
  const waffleFlags = useWaffleFlags();
  const [searchParams] = useSearchParams();
  const locatorId = searchParams.get('show');
  const isScrolledToElement = locatorId === unit.id;
  const [isFormOpen, openForm, closeForm] = useToggle(false);
  const [isSyncModalOpen, openSyncModal, closeSyncModal] = useToggle(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLegacyEditModal, setShowLegacyEditModal] = useState(false);
  const [showMFEEditorModal, setShowMFEEditorModal] = useState(false);
  const [editXBlockId, setEditXBlockId] = useState<string | null>(null);
  const [editBlockType, setEditBlockType] = useState<string>('');
  const [orderedComponents, setOrderedComponents] = useState<any[]>([]);
  const [dragComponentId, setDragComponentId] = useState<string | null>(null);
  const [renamingBlockId, setRenamingBlockId] = useState<string | null>(null);
  const [renameTitleValue, setRenameTitleValue] = useState('');
  const [openComponentMenuBlockId, setOpenComponentMenuBlockId] = useState<string | null>(null);
  const previousComponentsOrder = useRef<any[]>([]);
  const namePrefix = 'unit';

  const { copyToClipboard, showPasteXBlock } = useClipboard();
  const { courseId } = useParams();
  const queryClient = useQueryClient();
  const { showToast } = useContext(ToastContext);

  const {
    id,
    category,
    displayName,
    hasChanges,
    published,
    visibilityState,
    actions: unitActions,
    isHeaderVisible = true,
    enableCopyPasteUnits = false,
    discussionEnabled,
    upstreamInfo,
  } = unit;

  const { mutateAsync: renameComponent, isPending: isRenamePending } = useRenameUnitComponent();

  // Fetch unit components when expanded (only if flag is enabled)
  const {
    data: unitData,
    isLoading: isLoadingComponents,
    isError: isComponentsError,
    error: componentsError,
    refetch: refetchUnitData,
  } = useUnitHandler(id, isExpanded && waffleFlags.enableUnitExpandedView);

  // Fetch component templates separately via the existing container_handler API.
  // Templates are course-level (same for every unit), so cached per courseId.
  const { data: componentTemplates } = useComponentTemplates(
    id,
    courseId || '',
    isExpanded && waffleFlags.enableUnitExpandedView && waffleFlags.enableOutlineComponentCreation,
  );

  const blockSyncData = useMemo(() => {
    if (!upstreamInfo?.readyToSync) {
      return undefined;
    }
    return {
      displayName,
      downstreamBlockId: id,
      upstreamBlockId: upstreamInfo.upstreamRef,
      upstreamBlockVersionSynced: upstreamInfo.versionSynced,
      isReadyToSyncIndividually: upstreamInfo.isReadyToSyncIndividually,
      isContainer: true,
      blockType: 'unit',
    };
  }, [upstreamInfo]);

  // re-create actions object for customizations
  const actions = { ...unitActions };
  // add actions to control display of move up & down menu buton.
  const moveUpDetails = getPossibleMoves(index, -1);
  const moveDownDetails = getPossibleMoves(index, 1);
  actions.allowMoveUp = !isEmpty(moveUpDetails) && !subsection.upstreamInfo?.upstreamRef;
  actions.allowMoveDown = !isEmpty(moveDownDetails) && !subsection.upstreamInfo?.upstreamRef;
  actions.deletable = actions.deletable && !subsection.upstreamInfo?.upstreamRef;
  actions.duplicable = actions.duplicable && !subsection.upstreamInfo?.upstreamRef;

  const parentInfo = {
    graded: subsection.graded,
    isTimeLimited: subsection.isTimeLimited,
  };

  const unitStatus = getItemStatus({
    published,
    visibilityState,
    hasChanges,
  });
  const borderStyle = getItemStatusBorder(unitStatus);

  const unitStatusData = useMemo(() => ({
    ...unit,
    hasPartitionGroupComponents: deriveHasPartitionGroupComponents(
      unit,
      unitData?.components,
    ),
  }), [unit, unitData?.components]);

  const handleClickMenuButton = () => {
    dispatch(setCurrentItem(unit));
    dispatch(setCurrentSection(section));
    dispatch(setCurrentSubsection(subsection));
  };

  const handleEditSubmit = (titleValue: string) => {
    if (displayName !== titleValue) {
      onEditSubmit(id, section.id, titleValue);
      return;
    }

    closeForm();
  };

  const handleUnitMoveUp = () => {
    onOrderChange(section, moveUpDetails);
  };

  const handleUnitMoveDown = () => {
    onOrderChange(section, moveDownDetails);
  };

  const handleCopyClick = () => {
    copyToClipboard(id);
  };

  const handlePreviewClick = useCallback(() => {
    const lmsBaseUrl = getConfig().LMS_BASE_URL;
    const previewUrl = `${lmsBaseUrl}/courses/${courseId}/jump_to/${id}?preview=1`;
    window.open(previewUrl, '_blank');
  }, [courseId, id]);

  const handlePasteComponent = useCallback(async () => {
    try {
      await pasteBlock(id);
      dispatch(fetchCourseSectionQuery([section.id]));
      await refetchUnitData();
    } catch {
      showToast(intl.formatMessage(messages.addComponentError));
    }
  }, [id, section.id, dispatch, refetchUnitData, showToast, intl]);

  const handleExpandContent = () => {
    setIsExpanded((prevState) => !prevState);
  };

  const handleComponentClick = (blockId?: string) => {
    const baseUrl = getTitleLink(id);
    window.location.href = blockId ? `${baseUrl}#${blockId}` : baseUrl;
  };

  const getLegacyEditModalUrl = (blockId: string): string => (
    `${getConfig().STUDIO_BASE_URL}/xblock/${blockId}/action/edit`
  );

  const supportsMFEEditor = (blockType: string): boolean => Boolean(supportedEditors[blockType]);

  const getComponentEditorUrl = (blockType: string, blockId: string): string => {
    if (supportsMFEEditor(blockType)) {
      return `/course/${courseId}/editor/${blockType}/${blockId}`;
    }
    const returnTo = encodeURIComponent(`${getConfig().STUDIO_BASE_URL}/container/${id}`);
    return `${getConfig().STUDIO_BASE_URL}/xblock/${blockId}/action/edit?returnTo=${returnTo}`;
  };

  const handleShowLegacyEditModal = (blockId: string) => {
    setEditXBlockId(blockId);
    setShowLegacyEditModal(true);
  };

  const handleCloseLegacyEditModal = () => {
    setEditXBlockId(null);
    setShowLegacyEditModal(false);
  };

  const handleShowMFEEditor = (blockType: string, blockId: string) => {
    setEditBlockType(blockType);
    setEditXBlockId(blockId);
    setShowMFEEditorModal(true);
  };

  const handleCloseMFEEditor = () => {
    setEditBlockType('');
    setEditXBlockId(null);
    setShowMFEEditorModal(false);
  };

  const handleSaveEditedXBlockData = useCallback(() => (result: any) => {
    handleCloseLegacyEditModal();
    handleCloseMFEEditor();
    dispatch(fetchCourseSectionQuery([section.id]));
    if (courseId) {
      invalidateLinksQuery(queryClient, courseId);
    }

    if (result?.error) {
      showToast(intl.formatMessage(messages.componentSaveError));
    } else {
      refetchUnitData();
    }
  }, [dispatch, section.id, courseId, queryClient, showToast, intl, refetchUnitData]);

  const handleComponentEdit = (e: React.MouseEvent, blockType: string, blockId: string) => {
    e.stopPropagation();

    if (supportsMFEEditor(blockType)) {
      handleShowMFEEditor(blockType, blockId);
    } else {
      handleShowLegacyEditModal(blockId);
    }
  };

  const handleComponentActionComplete = useCallback(async (targetUnitId?: string) => {
    const sectionIds = new Set([section.id]);
    if (targetUnitId && targetUnitId !== id) {
      const targetSectionId = findSectionIdForUnit(sectionsList, targetUnitId);
      if (targetSectionId) {
        sectionIds.add(targetSectionId);
      }
    }

    await dispatch(fetchCourseSectionQuery([...sectionIds]) as any);

    const refetchPromises: Promise<unknown>[] = [refetchUnitData()];
    if (targetUnitId && targetUnitId !== id) {
      refetchPromises.push(
        queryClient.refetchQueries({ queryKey: ['unitHandler', targetUnitId] }),
      );
    }
    await Promise.all(refetchPromises);
  }, [dispatch, section.id, sectionsList, queryClient, id, refetchUnitData]);

  const handleRenameStart = useCallback((blockId: string, currentName: string) => {
    setRenamingBlockId(blockId);
    setRenameTitleValue(currentName);
  }, []);

  const handleRenameCancel = useCallback((currentName: string) => {
    setRenamingBlockId(null);
    setRenameTitleValue(currentName);
  }, []);

  const handleRenameSubmit = useCallback(async (blockId: string, currentName: string) => {
    const trimmedName = renameTitleValue.trim();

    if (!trimmedName || trimmedName === currentName) {
      setRenamingBlockId(null);
      setRenameTitleValue('');
      return;
    }

    try {
      dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));
      await renameComponent({ blockId, displayName: trimmedName });
      await handleComponentActionComplete();
      setRenamingBlockId(null);
      setRenameTitleValue('');
    } catch {
      setRenamingBlockId(null);
      setRenameTitleValue('');
      showToast(intl.formatMessage(messages.componentRenameError));
    } finally {
      dispatch(hideProcessingNotification());
    }
  }, [
    renameTitleValue,
    renameComponent,
    handleComponentActionComplete,
    dispatch,
    showToast,
    intl,
  ]);

  const handleComponentReorder = useCallback(() => async (newOrder: any[]) => {
    if (!newOrder) {
      return;
    }
    const componentIds = newOrder.map((c: any) => c.blockId);
    try {
      await setCourseItemOrderList(id, componentIds);
      dispatch(fetchCourseSectionQuery([section.id]));
      // Update ref after successful save
      previousComponentsOrder.current = newOrder;
    } catch (error) {
      setOrderedComponents(previousComponentsOrder.current);
      showToast(intl.formatMessage(messages.componentReorderError));
    }
  }, [id, section.id, dispatch, showToast, intl]);

  const handleOnPostChangeSync = useCallback(() => {
    dispatch(fetchCourseSectionQuery([section.id]));
    if (courseId) {
      invalidateLinksQuery(queryClient, courseId);
    }
  }, [dispatch, section, queryClient, courseId]);

  const titleComponent = waffleFlags.enableUnitExpandedView ? (
    <TitleButton
      title={displayName}
      isExpanded={isExpanded}
      onTitleClick={handleExpandContent}
      namePrefix={namePrefix}
      prefixIcon={<UpstreamInfoIcon upstreamInfo={upstreamInfo} size="sm" />}
    />
  ) : (
    <TitleLink
      title={displayName}
      titleLink={getTitleLink(id)}
      namePrefix={namePrefix}
      prefixIcon={<UpstreamInfoIcon upstreamInfo={upstreamInfo} size="sm" />}
    />
  );

  const extraActionsComponent = (
    <CourseOutlineUnitCardExtraActionsSlot
      unit={unit}
      subsection={subsection}
      section={section}
    />
  );

  useEffect(() => {
    // if this items has been newly added, scroll to it.
    if (currentRef.current && (unit.shouldScroll || isScrolledToElement)) {
      // Align element closer to the top of the screen if scrolling for search result
      const alignWithTop = !!isScrolledToElement;
      scrollToElement(currentRef.current, alignWithTop, true);
    }
  }, [isScrolledToElement]);

  useEffect(() => {
    if (savingStatus === RequestStatus.SUCCESSFUL) {
      closeForm();
    }
  }, [savingStatus, closeForm]);

  useEffect(() => {
    if (unitData?.components) {
      const componentsWithId = unitData.components.map((component) => ({
        ...component,
        id: component.blockId,
      }));
      setOrderedComponents(componentsWithId);
      previousComponentsOrder.current = componentsWithId;
    }
  }, [unitData]);

  useEffect(() => {
    const handleIframeMessage = (event: MessageEvent) => {
      const { data, origin } = event;
      if (origin !== getConfig().STUDIO_BASE_URL) {
        return;
      }

      if (data.type === 'closeXBlockEditorModal') {
        handleCloseLegacyEditModal();
      } else if (data.type === 'saveEditedXBlockData') {
        handleSaveEditedXBlockData()({});
      } else if (data.type === 'studioAjaxError' || data.type === 'error' || data.error) {
        handleSaveEditedXBlockData()({ error: true });
      }
    };

    window.addEventListener('message', handleIframeMessage);
    return () => {
      window.removeEventListener('message', handleIframeMessage);
    };
  }, [handleSaveEditedXBlockData]);

  if (!isHeaderVisible) {
    return null;
  }

  const isDraggable = (
    actions.draggable
      && (actions.allowMoveUp || actions.allowMoveDown)
      && !subsection.upstreamInfo?.upstreamRef
  );

  return (
    <>
      {showLegacyEditModal && editXBlockId && (
        <ModalIframe
          title={intl.formatMessage(messages.legacyEditModalTitle)}
          src={getLegacyEditModalUrl(editXBlockId)}
        />
      )}
      {showMFEEditorModal && editXBlockId && editBlockType && courseId && (
        <div className="editor-page">
          <EditorPage
            courseId={courseId}
            blockType={editBlockType}
            blockId={editXBlockId}
            studioEndpointUrl={getConfig().STUDIO_BASE_URL}
            lmsEndpointUrl={getConfig().LMS_BASE_URL}
            onClose={handleCloseMFEEditor}
            returnFunction={handleSaveEditedXBlockData}
          />
        </div>
      )}
      <SortableItem
        id={id}
        key={id}
        data={{
          category,
          status: unitStatus,
          displayName,
        }}
        isDraggable={isDraggable}
        isDroppable={subsection.actions.childAddable}
        componentStyle={{
          background: '#fdfdfd',
          ...borderStyle,
        }}
      >
        <div
          className={`unit-card ${isScrolledToElement ? 'highlight' : ''}`}
          data-testid="unit-card"
          ref={currentRef}
        >
          <CardHeader
            title={displayName}
            status={unitStatus}
            hasChanges={hasChanges}
            cardId={id}
            onClickMenuButton={handleClickMenuButton}
            onClickPreview={handlePreviewClick}
            onClickPublish={onOpenPublishModal}
            onClickConfigure={onOpenConfigureModal}
            onClickEdit={openForm}
            onClickDelete={onOpenDeleteModal}
            onClickUnlink={onOpenUnlinkModal}
            onClickMoveUp={handleUnitMoveUp}
            onClickMoveDown={handleUnitMoveDown}
            onClickSync={openSyncModal}
            isFormOpen={isFormOpen}
            closeForm={closeForm}
            onEditSubmit={handleEditSubmit}
            savingStatus={savingStatus}
            onClickDuplicate={onDuplicateSubmit}
            titleComponent={titleComponent}
            namePrefix={namePrefix}
            actions={actions}
            isVertical
            enableCopyPasteUnits={enableCopyPasteUnits}
            onClickCopy={handleCopyClick}
            discussionEnabled={discussionEnabled}
            discussionsSettings={discussionsSettings}
            parentInfo={parentInfo}
            extraActionsComponent={extraActionsComponent}
            readyToSync={upstreamInfo?.readyToSync}
          />
          <div className="unit-card__content item-children" data-testid="unit-card__content">
            <XBlockStatus
              isSelfPaced={isSelfPaced}
              isCustomRelativeDatesActive={isCustomRelativeDatesActive}
              blockData={unitStatusData}
            />
          </div>

          {/* Components section - shown when expanded like section/subsection */}
          {waffleFlags.enableUnitExpandedView && isExpanded && (
            <div className="unit-card__components p-3" data-testid="unit-card__components">
              {(() => {
                if (isComponentsError) {
                  return (
                    <AlertError
                      error={componentsError}
                      title={intl.formatMessage(messages.componentsLoadError)}
                      showErrorBody={false}
                    />
                  );
                }
                if (isLoadingComponents) {
                  return <div className="text-center p-3">{intl.formatMessage(messages.loadingComponents)}</div>;
                }
                if (orderedComponents && orderedComponents.length > 0) {
                  return (
                    <DraggableList
                      itemList={orderedComponents}
                      setState={setOrderedComponents}
                      updateOrder={handleComponentReorder}
                      activeId={dragComponentId}
                      setActiveId={setDragComponentId}
                    >
                      {orderedComponents.map((component) => {
                        const ComponentIcon = getItemIcon(component.blockType);

                        return (
                          <GenericSortableItem
                            id={component.blockId}
                            key={component.blockId}
                            buttonVariant="secondary"
                            componentStyle={{
                              background: 'white',
                              borderRadius: '6px',
                              marginBottom: '12px',
                              boxShadow: '0px 1px 5px rgba(173, 173, 173, 0.4)',
                            }}
                            actionStyle={{
                              borderRadius: '6px 6px 0px 0px',
                              padding: '12px 16px',
                            }}
                            actions={(
                              <>
                                <Icon src={ComponentIcon} className="mr-2 text-dark flex-shrink-0" />
                                {renamingBlockId === component.blockId ? (
                                  <Form.Group
                                    className="m-0 flex-grow-1 min-width-0"
                                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                    onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
                                  >
                                    <Form.Control
                                      autoFocus
                                      data-testid="component-rename-field"
                                      value={renameTitleValue}
                                      name="displayName"
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setRenameTitleValue(e.target.value);
                                      }}
                                      aria-label={intl.formatMessage(cardHeaderMessages.editFieldAriaLabel)}
                                      onBlur={() => handleRenameSubmit(
                                        component.blockId,
                                        component.displayName,
                                      )}
                                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                        if (e.key === 'Enter') {
                                          handleRenameSubmit(
                                            component.blockId,
                                            component.displayName,
                                          );
                                        } else if (e.key === 'Escape') {
                                          handleRenameCancel(component.displayName);
                                        }
                                      }}
                                      disabled={isRenamePending}
                                    />
                                  </Form.Group>
                                ) : (
                                  <Stack
                                    direction="horizontal"
                                    gap={0}
                                    className="item-card-header component-title-group flex-grow-1 min-width-0"
                                    role="presentation"
                                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                    onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
                                  >
                                    <a
                                      href={`${getTitleLink(id)}#${component.blockId}`}
                                      className="item-card-header__title-btn"
                                      data-testid="component-name-link"
                                      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                                        e.stopPropagation();
                                        if (!e.metaKey && !e.ctrlKey) {
                                          e.preventDefault();
                                          handleComponentClick(component.blockId);
                                        }
                                      }}
                                      onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
                                    >
                                      <span className="truncate-1-line mb-0">
                                        {component.displayName}
                                      </span>
                                    </a>
                                    <IconButtonWithTooltip
                                      className="item-card-button-icon component-rename-button"
                                      data-testid="component-rename-button"
                                      alt={intl.formatMessage(cardHeaderMessages.altButtonRename)}
                                      tooltipContent={(
                                        <div>{intl.formatMessage(cardHeaderMessages.altButtonRename)}</div>
                                      )}
                                      iconAs={EditIcon}
                                      onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        handleRenameStart(component.blockId, component.displayName);
                                      }}
                                      onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
                                      // @ts-ignore
                                      disabled={isRenamePending}
                                    />
                                  </Stack>
                                )}
                                <Stack
                                  direction="horizontal"
                                  gap={2}
                                  className="component-header-actions d-flex align-items-center flex-shrink-0 ml-auto"
                                >
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={(
                                      <Tooltip id={`edit-tooltip-${component.blockId}`}>
                                        {intl.formatMessage(messages.editComponent)}
                                      </Tooltip>
                                    )}
                                  >
                                    <Button
                                      as="a"
                                      href={getComponentEditorUrl(component.blockType, component.blockId)}
                                      variant="outline-primary"
                                      size="sm"
                                      className="component-edit-button"
                                      data-testid="component-edit-button"
                                      onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        if (!e.metaKey && !e.ctrlKey) {
                                          e.preventDefault();
                                          handleComponentEdit(e, component.blockType, component.blockId);
                                        }
                                      }}
                                      onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
                                    >
                                      {intl.formatMessage(messages.editButton)}
                                    </Button>
                                  </OverlayTrigger>
                                  <ComponentMenu
                                    unitId={id}
                                    blockId={component.blockId}
                                    displayName={component.displayName}
                                    blockType={component.blockType}
                                    userPartitionInfo={component.userPartitionInfo}
                                    userPartitions={component.userPartitions}
                                    actions={component.actions ?? EMPTY_UNIT_COMPONENT_ACTIONS}
                                    onActionComplete={handleComponentActionComplete}
                                    isMenuOpen={openComponentMenuBlockId === component.blockId}
                                    onMenuToggle={setOpenComponentMenuBlockId}
                                  />
                                </Stack>
                              </>
                            )}
                          />
                        );
                      })}
                    </DraggableList>
                  );
                }
                return (
                  <div
                    className="text-center text-muted p-3"
                    role="button"
                    tabIndex={0}
                    onClick={() => handleComponentClick()}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleComponentClick();
                      }
                    }}
                  >
                    {intl.formatMessage(messages.noComponents)}
                  </div>
                );
              })()}
              {waffleFlags.enableOutlineComponentCreation
                && componentTemplates
                && componentTemplates.length > 0 && (
                <div className="mt-3 mb-0" data-testid="add-component-widget">
                  <AddComponentWidget
                    unitId={id}
                    componentTemplates={componentTemplates}
                    showPasteXBlock={!!showPasteXBlock}
                    onPasteComponent={handlePasteComponent}
                    onComponentCreated={() => {
                      dispatch(fetchCourseSectionQuery([section.id]));
                      refetchUnitData();
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </SortableItem>
      {blockSyncData && (
        <PreviewLibraryXBlockChanges
          blockData={blockSyncData}
          isModalOpen={isSyncModalOpen}
          closeModal={closeSyncModal}
          postChange={handleOnPostChangeSync}
        />
      )}
    </>
  );
};

export default UnitCard;
