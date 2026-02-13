import { FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Button, Card, Icon, Stack,
} from '@openedx/paragon';
import { Cached, LinkOff, Newsstand } from '@openedx/paragon/icons';
import { useCourseItemData } from '@src/course-outline/data/apiHooks';
import { PreviewLibraryXBlockChanges } from '@src/course-unit/preview-changes';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { XBlock } from '@src/data/types';
import { ContainerType, getBlockType, normalizeContainerType } from '@src/generic/key-utils';
import { useToggleWithValue } from '@src/hooks';
import { useMemo } from 'react';
import messages from './messages';

interface SubProps {
  blockData: XBlock;
  displayName: string;
  openSyncModal: (val: XBlock) => void;
  sectionId?: string;
}

interface HasTopParentSubProps extends SubProps {
  goToParent: (containerId: string, subsectionId?: string, sectionId?: string) => void;
}

const HasTopParentTextAndButton = ({
  blockData,
  displayName,
  openSyncModal,
  goToParent,
  sectionId,
}: HasTopParentSubProps) => {
  const { upstreamInfo } = blockData;
  const { openUnlinkModal } = useCourseAuthoringContext();
  const { data: parentData, isPending } = useCourseItemData(upstreamInfo?.topLevelParentKey);

  const handleUnlinkClick = () => {
    // istanbul ignore if
    if (!sectionId || !parentData) {
      return;
    }
    openUnlinkModal({ value: parentData, sectionId });
  };

  const handleSyncClick = () => {
    // istanbul ignore if
    if (!parentData) {
      return;
    }
    openSyncModal(parentData);
  };

  const handleGoToParent = () => {
    // istanbul ignore if
    if (!upstreamInfo?.topLevelParentKey) {
      return null;
    }
    const category = getBlockType(upstreamInfo.topLevelParentKey) as ContainerType;
    if ([ContainerType.Chapter, ContainerType.Section].includes(category)) {
      return goToParent(
        upstreamInfo.topLevelParentKey,
        undefined,
        upstreamInfo.topLevelParentKey,
      );
    }
    // Only possible option is sequential or subsection
    return goToParent(
      upstreamInfo.topLevelParentKey,
      upstreamInfo.topLevelParentKey,
      sectionId,
    );
  };

  if (!upstreamInfo?.topLevelParentKey) {
    return null;
  }

  const messageValues = {
    parentType: normalizeContainerType(getBlockType(upstreamInfo.topLevelParentKey)),
    name: displayName,
  };

  if (upstreamInfo.errorMessage) {
    return (
      <Stack direction="vertical" gap={2}>
        <FormattedMessage {...messages.hasTopParentBrokenLinkText} values={messageValues} />
        <Button
          variant="outline-primary"
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
          variant="outline-primary"
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
        variant="outline-primary"
        onClick={handleGoToParent}
      >
        <FormattedMessage {...messages.hasTopParentBtn} values={messageValues} />
      </Button>
    </Stack>
  );
};

const TopLevelTextAndButton = ({
  blockData,
  displayName,
  openSyncModal,
  sectionId,
}: SubProps) => {
  const { upstreamInfo } = blockData;
  const { openUnlinkModal } = useCourseAuthoringContext();
  const messageValues = {
    name: displayName,
  };

  const handleUnlinkClick = () => {
    // istanbul ignore if
    if (!sectionId) {
      return;
    }
    openUnlinkModal({ value: blockData, sectionId });
  };

  const handleSyncClick = () => {
    openSyncModal(blockData);
  };

  if (upstreamInfo?.errorMessage) {
    return (
      <Stack direction="vertical" gap={2}>
        <FormattedMessage {...messages.topParentBrokenLinkText} values={messageValues} />
        <Button
          variant="outline-primary"
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
          variant="outline-primary"
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
};

interface Props {
  itemId?: string;
  sectionId?: string;
  postChange: (accept: boolean) => void,
  goToParent: (containerId: string, subsectionId?: string, sectionId?: string) => void;
}

/**
 * Libray reference card to show info and actions about
 * upstream link of an item.
 */
export const LibraryReferenceCard = ({
  itemId,
  sectionId,
  postChange,
  goToParent,
}: Props) => {
  const { data: itemData, isPending } = useCourseItemData(itemId);
  const [isSyncModalOpen, syncModalData, openSyncModal, closeSyncModal] = useToggleWithValue<XBlock>();

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
      isContainer: ['vertical', 'sequential', 'chapter'].includes(syncModalData.category),
      blockType: normalizeContainerType(syncModalData.category),
    };
  }, [syncModalData]);

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
              sectionId={sectionId}
            />
            <HasTopParentTextAndButton
              blockData={itemData}
              displayName={itemData.displayName}
              openSyncModal={openSyncModal}
              sectionId={sectionId}
              goToParent={goToParent}
            />
          </Stack>
        </Card.Section>
      </Card>
      {blockSyncData && (
        <PreviewLibraryXBlockChanges
          blockData={blockSyncData}
          isModalOpen={isSyncModalOpen}
          closeModal={closeSyncModal}
          postChange={postChange}
        />
      )}
    </div>
  );
};
