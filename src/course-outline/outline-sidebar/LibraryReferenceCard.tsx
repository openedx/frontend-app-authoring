import { FormattedMessage } from "@edx/frontend-platform/i18n";
import { Button, Card, Icon, Stack } from "@openedx/paragon";
import { Cached, LinkOff, Newsstand } from "@openedx/paragon/icons";
import { useCourseItemData } from "@src/course-outline/data/apiHooks";
import { useOutlineSidebarContext } from "@src/course-outline/outline-sidebar/OutlineSidebarContext";
import { UpstreamInfo } from "@src/data/types";
import { getBlockType, normalizeContainerType } from "@src/generic/key-utils";
import messages from './messages';

interface SubProps {
  upstreamInfo: UpstreamInfo;
  displayName: string;
}

const HasTopParentTextAndButton = ({ upstreamInfo, displayName }: SubProps) => {
  const { openContainerInfoSidebar } = useOutlineSidebarContext();
  if (!upstreamInfo.topLevelParentKey) {
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
        <Button variant='outline-primary' iconBefore={LinkOff}>
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

const TopLevelTextAndButton = ({ upstreamInfo, displayName }: SubProps) => {
  const messageValues = {
    name: displayName,
  }

  if (upstreamInfo.errorMessage) {
    return (
      <Stack direction="vertical" gap={2}>
        <FormattedMessage {...messages.topParentBrokenLinkText} values={messageValues} />
        <Button variant='outline-primary' iconBefore={LinkOff}>
          <FormattedMessage {...messages.topParentBrokenLinkBtn} />
        </Button>
      </Stack>
    );
  }

  if (upstreamInfo.readyToSync) {
    return (
      <Stack direction="vertical" gap={2}>
        <FormattedMessage {...messages.topParentReaadyToSyncText} values={messageValues} />
        <Button variant='outline-primary' iconBefore={Cached}>
          <FormattedMessage {...messages.topParentReaadyToSyncBtn} values={messageValues} />
        </Button>
      </Stack>
    );
  }

  if (upstreamInfo.downstreamCustomized.length > 0) {
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
  const { data: itemData, isLoading } = useCourseItemData(itemId);
  if (!itemData?.upstreamInfo?.upstreamRef) {
    return null;
  }

  return (
    <Card isLoading={isLoading} className="mr-2">
      <Card.Section>
        <Stack gap={3}>
          <Stack direction="horizontal" gap={2}>
            <Icon src={Newsstand} />
            <h4 className="mb-0"><FormattedMessage {...messages.libraryReferenceCardText} /></h4>
          </Stack>
          <HasTopParentTextAndButton upstreamInfo={itemData.upstreamInfo} displayName={itemData.displayName} />
          <TopLevelTextAndButton upstreamInfo={itemData.upstreamInfo} displayName={itemData.displayName} />
        </Stack>
      </Card.Section>
    </Card>
  )
};

