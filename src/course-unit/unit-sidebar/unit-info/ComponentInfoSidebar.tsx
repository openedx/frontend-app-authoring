import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useNavigate } from 'react-router-dom';
import { Tag } from '@openedx/paragon/icons';
import { useQueryClient } from '@tanstack/react-query';
import { useToggle } from '@openedx/paragon';

import { SidebarContent, SidebarSection, SidebarTitle } from '@src/generic/sidebar';
import { ContentTagsSnippet } from '@src/content-tags-drawer';
import { getItemIcon } from '@src/generic/block-type-utils';
import { useIframe } from '@src/generic/hooks/context/hooks';
import { messageTypes } from '@src/course-unit/constants';
import { LibraryReferenceCard } from '@src/generic/library-reference-card/LibraryReferenceCard';
import { getCourseUnitData, getMovedXBlockParams } from '@src/course-unit/data/selectors';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { courseOutlineQueryKeys, useCourseItemData } from '@src/course-outline/data/apiHooks';
import { getLibraryId } from '@src/generic/key-utils';
import { useUnlinkDownstream, UnlinkModal } from '@src/generic/unlink-modal';
import { useClipboard } from '@src/generic/clipboard';
import DeleteModal from '@src/generic/delete-modal/DeleteModal';
import Loading from '@src/generic/Loading';
import { deleteUnitItemQuery, duplicateUnitItemQuery, fetchCourseVerticalChildrenData } from '@src/course-unit/data/thunk';

import { useUnitSidebarContext } from '../UnitSidebarContext';
import messages from './messages';

/**
 * Sidebar info for components
 */
export const ComponentInfoSidebar = () => {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sendMessageToIframe } = useIframe();
  const { copyToClipboard } = useClipboard();
  const unitData = useSelector(getCourseUnitData);
  const { courseId } = useCourseAuthoringContext();
  const sectionId = unitData?.ancestorInfo?.ancestors?.find(
    (ancestor) => ancestor.category === 'chapter',
  )?.id;
  const [isUnlinkModalOpen, openUnlinkModal, closeUnlinkModal] = useToggle(false);
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);

  const {
    selectedComponentId,
    setCurrentPageKey,
  } = useUnitSidebarContext();
  const { mutateAsync: unlinkDownstream } = useUnlinkDownstream();

  const { data: componentItemData } = useCourseItemData(selectedComponentId ?? undefined);
  const movedXBlockParams = useSelector(getMovedXBlockParams);

  useEffect(() => {
    if (movedXBlockParams.isSuccess && movedXBlockParams.sourceLocator === selectedComponentId) {
      setCurrentPageKey('info', null);
    }
  }, [movedXBlockParams]);

  if (!componentItemData) {
    return <Loading />;
  }

  // re-create actions object for customizations
  const actions = { ...componentItemData.actions };
  actions.deletable = actions.deletable && !unitData?.upstreamInfo?.upstreamRef;
  actions.duplicable = actions.duplicable && !unitData?.upstreamInfo?.upstreamRef;

  // istanbul ignore next
  const handleBack = () => {
    setCurrentPageKey('info', null);
  };

  const handleGoToParent = (containerId: string) => {
    navigate(`/course/${courseId}?show=${encodeURIComponent(containerId)}`);
  };

  // istanbul ignore next
  const handlePostChange = () => {
    sendMessageToIframe(messageTypes.refreshXBlock, null);
    queryClient.invalidateQueries({
      queryKey: courseOutlineQueryKeys.courseItemId(sectionId),
    });
  };

  const handleDuplicate = () => {
    if (selectedComponentId && unitData?.id) {
      dispatch(duplicateUnitItemQuery(
        unitData.id,
        selectedComponentId,
        (courseKey: string, locator: string) => sendMessageToIframe(
          messageTypes.completeXBlockDuplicating,
          { courseKey, locator },
        ),
      ));
    }
  };

  const handleDeleteSubmit = async () => {
    if (selectedComponentId && unitData?.id) {
      // oxlint-disable-next-line typescript-eslint(await-thenable)
      await dispatch(deleteUnitItemQuery(unitData.id, selectedComponentId, sendMessageToIframe));
      closeDeleteModal();
      setCurrentPageKey('info', null);
      if (unitData?.id) {
        dispatch(fetchCourseVerticalChildrenData(unitData.id, false));
      }
    }
  };

  const handleUnlinkSubmit = async () => {
    if (selectedComponentId) {
      await unlinkDownstream({
        downstreamBlockId: selectedComponentId,
      }, {
        onSuccess: () => {
          closeUnlinkModal();
          queryClient.invalidateQueries({
            queryKey: courseOutlineQueryKeys.courseItemId(selectedComponentId),
          });
          if (unitData?.id) {
            dispatch(fetchCourseVerticalChildrenData(unitData.id, false));
          }
        },
      });
    }
  };

  const handleMove = () => {
    if (!selectedComponentId || !unitData?.id) {
      return;
    }
    window.dispatchEvent(new MessageEvent('message', {
      data: {
        type: messageTypes.showMoveXBlockModal,
        payload: {
          sourceXBlockInfo: {
            id: selectedComponentId,
            displayName: componentItemData?.displayName ?? '',
            category: componentItemData?.category ?? '',
          },
          sourceParentXBlockInfo: {
            id: unitData.id,
            displayName: unitData.displayName ?? '',
            category: 'vertical',
          },
        },
      },
    }));
  };

  return (
    <>
      <SidebarTitle
        title={componentItemData?.displayName || ''}
        icon={getItemIcon(componentItemData?.category || '')}
        onBackBtnClick={handleBack}
        menuProps={{
          itemId: selectedComponentId || '',
          index: 0,
          actions,
          onClickDuplicate: handleDuplicate,
          onClickUnlink: openUnlinkModal,
          onClickDelete: openDeleteModal,
          onClickViewLibrary: () => {
            const upstreamRef = componentItemData?.upstreamInfo?.upstreamRef;
            if (upstreamRef) {
              const libId = getLibraryId(upstreamRef);
              navigate(`/library/${libId}/components/${upstreamRef}`);
            }
          },
          onClickCopy: () => copyToClipboard(selectedComponentId ?? ''),
          onClickMove: !unitData?.upstreamInfo?.upstreamRef ? handleMove : undefined,
        }}
      />
      <LibraryReferenceCard
        itemId={selectedComponentId}
        sectionId={sectionId}
        goToParent={handleGoToParent}
        postChange={handlePostChange}
      />
      <SidebarContent>
        <SidebarSection
          title={intl.formatMessage(messages.sidebarSectionTaxonomies)}
          icon={Tag}
        >
          <ContentTagsSnippet contentId={selectedComponentId || ''} />
        </SidebarSection>
      </SidebarContent>
      <UnlinkModal
        isOpen={isUnlinkModalOpen}
        close={closeUnlinkModal}
        onUnlinkSubmit={handleUnlinkSubmit}
        displayName={componentItemData?.displayName}
        category="vertical"
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        close={closeDeleteModal}
        category={componentItemData?.category}
        onDeleteSubmit={handleDeleteSubmit}
      />
    </>
  );
};
