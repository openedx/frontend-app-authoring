import { useCallback, useRef } from 'react';
import {
  ActionRow,
} from '@openedx/paragon';

import { type ContentHit, PublishStatus } from '../../search-manager';
import { useComponentPickerContext } from '../common/context/ComponentPickerContext';
import { useLibraryContext } from '../common/context/LibraryContext';
import { SidebarBodyItemId, useSidebarContext } from '../common/context/SidebarContext';
import AddComponentWidget from './AddComponentWidget';
import BaseCard from './BaseCard';
import { ComponentMenu } from './ComponentMenu';

type ComponentCardProps = {
  hit: ContentHit,
};

const DOUBLE_CLICK_DELAY = 500; // ms

const ComponentCard = ({ hit }: ComponentCardProps) => {
  const { showOnlyPublished, openComponentEditor } = useLibraryContext();
  const { openComponentInfoSidebar, openItemSidebar, sidebarItemInfo } = useSidebarContext();
  const { componentPickerMode } = useComponentPickerContext();

  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    blockType,
    formatted,
    tags,
    usageKey,
    publishStatus,
  } = hit;
  const componentDescription: string = (
    showOnlyPublished ? formatted.published?.description : formatted.description
  ) ?? '';
  const displayName: string = (
    showOnlyPublished ? formatted.published?.displayName : formatted.displayName
  ) ?? '';

  const selectComponent = useCallback(
    () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
        openItemSidebar(usageKey, SidebarBodyItemId.ComponentInfo);
        openComponentEditor(usageKey);
      } else {
        clickTimerRef.current = setTimeout(() => {
          clickTimerRef.current = null;

          if (componentPickerMode) {
            openComponentInfoSidebar(usageKey);
          } else {
            openItemSidebar(usageKey, SidebarBodyItemId.ComponentInfo);
          }
        }, DOUBLE_CLICK_DELAY);
      }
    },
    [usageKey, openItemSidebar, openComponentInfoSidebar, componentPickerMode],
  );

  const selected = sidebarItemInfo?.type === SidebarBodyItemId.ComponentInfo
    && sidebarItemInfo.id === usageKey;

  return (
    <BaseCard
      itemType={blockType}
      displayName={displayName}
      description={componentDescription}
      tags={tags}
      actions={(
        <ActionRow>
          {componentPickerMode ? (
            <AddComponentWidget usageKey={usageKey} blockType={blockType} />
          ) : (
            <ComponentMenu usageKey={usageKey} />
          )}
        </ActionRow>
      )}
      hasUnpublishedChanges={publishStatus !== PublishStatus.Published}
      onSelect={selectComponent}
      selected={selected}
    />
  );
};

export default ComponentCard;
