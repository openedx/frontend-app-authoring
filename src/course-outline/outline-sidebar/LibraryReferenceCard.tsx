import { FormattedMessage } from "@edx/frontend-platform/i18n";
import { Button, Card, Icon, Stack } from "@openedx/paragon";
import { Cached, LinkOff, Newsstand } from "@openedx/paragon/icons";
import { useCourseItemData } from "@src/course-outline/data/apiHooks";
import { useOutlineSidebarContext } from "@src/course-outline/outline-sidebar/OutlineSidebarContext";
import { useCourseAuthoringContext } from "@src/CourseAuthoringContext";
import { XBlock } from "@src/data/types";
import { getBlockType, normalizeContainerType } from "@src/generic/key-utils";
import messages from './messages';

interface SubProps {
  blockData: XBlock;
  displayName: string;
}

const HasTopParentTextAndButton = ({ blockData, displayName }: SubProps) => {
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

  if (upstreamInfo.readyToSync) {
    return (
      <Stack direction="vertical" gap={2}>
        <FormattedMessage {...messages.hasTopParentReadyToSyncText} values={messageValues} />
        <Button variant='outline-primary' iconBefore={Cached}>
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
        onClick={() => openContainerInfoSidebar(upstreamInfo.topLevelParentKey!)}
      >
        <FormattedMessage {...messages.hasTopParentBtn} values={messageValues} />
      </Button>
    </Stack>
  );
}

const TopLevelTextAndButton = ({ blockData, displayName }: SubProps) => {
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

  if (upstreamInfo?.errorMessage) {
    return (
      <Stack direction="vertical" gap={2}>
        <FormattedMessage {...messages.topParentBrokenLinkText} values={messageValues} />
        <Button variant='outline-primary' iconBefore={LinkOff} onClick={handleUnlinkClick}>
          <FormattedMessage {...messages.topParentBrokenLinkBtn} />
        </Button>
      </Stack>
    );
  }

  if (upstreamInfo?.readyToSync) {
    return (
      <Stack direction="vertical" gap={2}>
        <FormattedMessage {...messages.topParentReaadyToSyncText} values={messageValues} />
        <Button variant='outline-primary' iconBefore={Cached}>
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
            <HasTopParentTextAndButton
              blockData={itemData}
              displayName={itemData.displayName}
            />
            <TopLevelTextAndButton
              blockData={itemData}
              displayName={itemData.displayName}
            />
          </Stack>
        </Card.Section>
      </Card>
    </div>
  )
};

