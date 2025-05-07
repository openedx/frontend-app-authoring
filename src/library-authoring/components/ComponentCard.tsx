import { useCallback } from 'react';
import {
  ActionRow,
} from '@openedx/paragon';

import { type ContentHit, PublishStatus } from '../../search-manager';
import { useComponentPickerContext } from '../common/context/ComponentPickerContext';
import { useLibraryContext } from '../common/context/LibraryContext';
import { SidebarBodyComponentId, useSidebarContext } from '../common/context/SidebarContext';
import { useLibraryRoutes } from '../routes';
import AddComponentWidget from './AddComponentWidget';
import BaseCard from './BaseCard';
import { ComponentMenu } from './ComponentMenu';

type ComponentCardProps = {
  hit: ContentHit,
};

const ComponentCard = ({ hit }: ComponentCardProps) => {
  const { showOnlyPublished } = useLibraryContext();
  const { openComponentInfoSidebar, sidebarComponentInfo } = useSidebarContext();
  const { componentPickerMode } = useComponentPickerContext();

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

  const { navigateTo } = useLibraryRoutes();
  const openComponent = useCallback(() => {
    openComponentInfoSidebar(usageKey);

    if (!componentPickerMode) {
      navigateTo({ componentId: usageKey });
    }
  }, [usageKey, navigateTo, openComponentInfoSidebar]);

  const selected = sidebarComponentInfo?.type === SidebarBodyComponentId.ComponentInfo
    && sidebarComponentInfo.id === usageKey;

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
      onSelect={openComponent}
      selected={selected}
    />
  );
};

export default ComponentCard;
