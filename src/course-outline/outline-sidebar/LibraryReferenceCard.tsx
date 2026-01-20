import { FormattedMessage } from "@edx/frontend-platform/i18n";
import { Button, Card, Icon, Stack } from "@openedx/paragon";
import { Cached, LinkOff, Newsstand } from "@openedx/paragon/icons";
import { invalidateLinksQuery } from "@src/course-libraries/data/apiHooks";
import { courseOutlineQueryKeys, useCourseItemData } from "@src/course-outline/data/apiHooks";
import { fetchCourseSectionQuery } from "@src/course-outline/data/thunk";
import { useOutlineSidebarContext } from "@src/course-outline/outline-sidebar/OutlineSidebarContext";
import { PreviewLibraryXBlockChanges } from "@src/course-unit/preview-changes";
import { useCourseAuthoringContext } from "@src/CourseAuthoringContext";
import { XBlock } from "@src/data/types";
import { getBlockType, normalizeContainerType } from "@src/generic/key-utils";
import { useToggleWithValue } from "@src/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import messages from './messages';

interface SubProps {
  blockData: XBlock;
  displayName: string;
  openSyncModal: (val: XBlock) => void;
}

const HasTopParentTextAndButton = ({ blockData, displayName, openSyncModal }: SubProps) => {
  const { upstreamInfo } = blockData;
  const { selectedSectionId } = useOutlineSidebarContext();
  const { openContainerInfoSidebar } = useOutlineSidebarContext();
  const { openUnlinkModal } = useCourseAuthoringContext();
  const { data: parentData, isPending } = useCourseItemData(upstreamInfo?.topLevelParentKey);

  const handleUnlinkClick = () => {
    if (!selectedSectionId || !parentData) {
      return;
    }
    openUnlinkModal({ value: parentData, sectionId: selectedSectionId });
  };

  const handleSyncClick = () => {
    if (!parentData) {
      return;
    }
    openSyncModal(parentData);
  };

  if (!upstreamInfo?.topLevelParentKey) {
    return null;
  }

  const messageValues = {
    parentType: normalizeContainerType(getBlockType(upstreamInfo.topLevelParentKey)),
    name: displayName,
  }

  if (upstreamInfo.errorMessage) {
    return (
      <Stack direction="vertical" gap={2}>
        <FormattedMessage {...messages.hasTopParentBrokenLinkText} values={messageValues} />
        <Button
          variant='outline-primary'
          iconBefore={LinkOff}
          disabled={isPending}
          onClick={handleUnlinkClick}
        >
          <FormattedMessage {...messages.hasTopParentBrokenLinkBtn} values={messageValues} />
        </Button>
      </Stack>
    );
  }

  if (parentData?.upstreamInfo?.readyToSync) {
    return (
      <Stack direction="vertical" gap={2}>
        <FormattedMessage {...messages.hasTopParentReadyToSyncText} values={messageValues} />
        <Button
          variant='outline-primary'
          iconBefore={Cached}
          onClick={handleSyncClick}
        >
          <FormattedMessage {...messages.hasTopParentReadyToSyncBtn} values={messageValues} />
        </Button>
      </Stack>
    );
  }

  return (
    <Stack direction="vertical" gap={2}>
      <FormattedMessage {...messages.hasTopParentText} values={messageValues} />
      <Button
        variant='outline-primary'
        onClick={() => {
          return openContainerInfoSidebar(upstreamInfo.topLevelParentKey!)
        }}
      >
        <FormattedMessage {...messages.hasTopParentBtn} values={messageValues} />
      </Button>
    </Stack>
  );
}

const TopLevelTextAndButton = ({ blockData, displayName, openSyncModal }: SubProps) => {
  const { upstreamInfo } = blockData;
  const { selectedSectionId } = useOutlineSidebarContext();
  const { openUnlinkModal } = useCourseAuthoringContext();
  const messageValues = {
    name: displayName,
  }

  const handleUnlinkClick = () => {
    if (!selectedSectionId) {
      return;
    }
    openUnlinkModal({ value: blockData, sectionId: selectedSectionId });
  };

  const handleSyncClick = () => {
    openSyncModal(blockData);
  };

  if (upstreamInfo?.errorMessage) {
    return (
      <Stack direction="vertical" gap={2}>
        <FormattedMessage {...messages.topParentBrokenLinkText} values={messageValues} />
        <Button
          variant='outline-primary'
          iconBefore={LinkOff}
          onClick={handleUnlinkClick}
        >
          <FormattedMessage {...messages.topParentBrokenLinkBtn} />
        </Button>
      </Stack>
    );
  }

  if (upstreamInfo?.readyToSync) {
    return (
      <Stack direction="vertical" gap={2}>
        <FormattedMessage {...messages.topParentReaadyToSyncText} values={messageValues} />
        <Button
          variant='outline-primary'
          iconBefore={Cached}
          onClick={handleSyncClick}
        >
          <FormattedMessage {...messages.topParentReaadyToSyncBtn} values={messageValues} />
        </Button>
      </Stack>
    );
  }

  if ((upstreamInfo?.downstreamCustomized.length || 0) > 0) {
    return (
      <FormattedMessage {...messages.topParentModifiedText} values={messageValues} />
    );
  }

  return null;
}

interface Props {
  itemId?: string;
}

export const LibraryReferenceCard = ({ itemId }: Props) => {
  const { data: itemData, isPending } = useCourseItemData(itemId);
  const { selectedSectionId } = useOutlineSidebarContext();
  const { courseId } = useCourseAuthoringContext();
  const [isSyncModalOpen, syncModalData, openSyncModal, closeSyncModal] = useToggleWithValue<XBlock>();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const blockSyncData = useMemo(() => {
    if (!syncModalData?.upstreamInfo?.readyToSync) {
      return undefined;
    }
    return {
      displayName: syncModalData.displayName,
      downstreamBlockId: syncModalData.id,
      upstreamBlockId: syncModalData.upstreamInfo.upstreamRef,
      upstreamBlockVersionSynced: syncModalData.upstreamInfo.versionSynced,
      isReadyToSyncIndividually: syncModalData.upstreamInfo.isReadyToSyncIndividually,
      isContainer: syncModalData.category === 'vertical' || syncModalData.category === 'sequential' || syncModalData.category === 'chapter',
      blockType: normalizeContainerType(syncModalData.category),
    };
  }, [syncModalData]);

  const handleOnPostChangeSync = useCallback(() => {
    if (selectedSectionId) {
      dispatch(fetchCourseSectionQuery([selectedSectionId]));
    }
    if (courseId) {
      invalidateLinksQuery(queryClient, courseId);
      queryClient.invalidateQueries({
        queryKey: courseOutlineQueryKeys.course(courseId),
      });
    }
  }, [dispatch, selectedSectionId, queryClient, courseId]);

  if (!itemData?.upstreamInfo?.upstreamRef) {
    return null;
  }

  return (
    <div className="px-3">
      <Card isLoading={isPending} className="my-3">
        <Card.Section>
          <Stack gap={3}>
            <Stack direction="horizontal" gap={2}>
              <Icon src={Newsstand} />
              <h4 className="mb-0"><FormattedMessage {...messages.libraryReferenceCardText} /></h4>
            </Stack>
            <TopLevelTextAndButton
              blockData={itemData}
              displayName={itemData.displayName}
              openSyncModal={openSyncModal}
            />
            <HasTopParentTextAndButton
              blockData={itemData}
              displayName={itemData.displayName}
              openSyncModal={openSyncModal}
            />
          </Stack>
        </Card.Section>
      </Card>
      {blockSyncData && (
        <PreviewLibraryXBlockChanges
          blockData={blockSyncData}
          isModalOpen={isSyncModalOpen}
          closeModal={closeSyncModal}
          postChange={handleOnPostChangeSync}
        />
      )}
    </div>
  )
};

