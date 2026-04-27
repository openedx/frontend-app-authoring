import { LoadingSpinner } from '@src/generic/Loading';
import {
  useContainer,
  useLibraryBlockCreationEntry,
  useLibraryBlockDraftHistory,
  useLibraryBlockMetadata,
  useLibraryBlockPublishHistory,
  useLibraryContainerCreationEntry,
  useLibraryContainerDraftHistory,
  useLibraryContainerPublishHistory,
} from '@src/library-authoring/data/apiHooks';
import { HistoryCreatedLogGroup, HistoryDraftLogGroup, HistoryPublishLogGroup } from './HistoryLogGroup';
import { useMemo } from 'react';
import { LibraryPublishHistoryGroup } from '@src/library-authoring/data/api';

/**
 * History log for a single component (block).
 *
 * Renders, top to bottom: pending draft edits, publish groups, and the creation entry.
 * For the container equivalent see HistoryContainerLog, which adds logic to split publish
 * groups into those before and after the container's creation time.
 */
export const HistoryComponentLog = ({ componentId }: { componentId: string; }) => {
  const {
    data: draftHistory,
    isPending: isPendingDraftHistory,
  } = useLibraryBlockDraftHistory(componentId);

  const {
    data: publishHistoryGroups,
    isPending: isPendingPublishHistoryGroups,
  } = useLibraryBlockPublishHistory(componentId);

  const {
    data: creationEntry,
    isPending: isPendingCreationEntry,
  } = useLibraryBlockCreationEntry(componentId);

  const {
    data: componentMetadata,
    isPending: isPendingComponentMetadata,
  } = useLibraryBlockMetadata(componentId);

  if (isPendingDraftHistory || isPendingPublishHistoryGroups || isPendingCreationEntry || isPendingComponentMetadata) {
    return <LoadingSpinner />;
  }

  return (
    <div className="history-log">
      {draftHistory && draftHistory.length !== 0 && (
        <HistoryDraftLogGroup
          itemId={componentId}
          displayName={componentMetadata?.displayName || ''}
          entries={draftHistory}
        />
      )}
      {publishHistoryGroups && publishHistoryGroups.length !== 0 && (
        publishHistoryGroups.map((publishGroup) => (
          <div key={`${publishGroup.publishLogUuid}-${publishGroup.directPublishedEntities[0].entityKey}`}>
            <HistoryPublishLogGroup
              {...publishGroup}
              itemId={publishGroup.scopeEntityKey || componentId}
            />
          </div>
        ))
      )}
      {creationEntry && (
        <HistoryCreatedLogGroup
          user={creationEntry.contributor?.username}
          displayName={creationEntry.title}
          itemType={creationEntry.itemType}
          createdAt={creationEntry.changedAt}
        />
      )}
    </div>
  );
};

/**
 * History log for a container (e.g. a Unit).
 *
 * Similar to HistoryComponentLog but uses container-specific API hooks and splits publish groups
 * into those after and before the container's creation time. The latter can occur when the container
 * has children that were published before the container itself was created.
 * These "before creation" groups are rendered below the creation entry.
 *
 * These two components are kept separate because the hooks they use are different and the
 * before/after creation split logic only applies to containers.
 */
export const HistoryContainerLog = ({ containerId }: { containerId: string; }) => {
  const {
    data: draftHistory,
    isPending: isPendingDraftHistory,
  } = useLibraryContainerDraftHistory(containerId);

  const {
    data: publishHistoryGroups,
    isPending: isPendingPublishHistoryGroups,
  } = useLibraryContainerPublishHistory(containerId);

  const {
    data: creationEntry,
    isPending: isPendingCreationEntry,
  } = useLibraryContainerCreationEntry(containerId);

  const {
    data: container,
    isPending: isPendingContainer,
  } = useContainer(containerId);

  const creationTime = creationEntry?.changedAt;

  const {
    groupsAfterCreation,
    groupsBeforeCreation,
  } = useMemo(() => {
    return {
      groupsAfterCreation: publishHistoryGroups?.filter(
        (group) => !creationTime || group.publishedAt >= creationTime,
      ) ?? [],
      groupsBeforeCreation: publishHistoryGroups?.filter(
        (group) => creationTime && group.publishedAt < creationTime,
      ) ?? [],
    };
  }, [publishHistoryGroups, creationTime]);

  if (isPendingDraftHistory || isPendingContainer || isPendingPublishHistoryGroups || isPendingCreationEntry) {
    return <LoadingSpinner />;
  }

  const hasBeforeCreationGroups = groupsBeforeCreation.length > 0;

  const renderPublishGroups = (
    groups: LibraryPublishHistoryGroup[],
    isBeforeGroup: boolean,
  ) =>
    groups.map((publishGroup, index, arr) => {
      const isLast = index === arr.length - 1;
      return (
        <div key={`${publishGroup.publishLogUuid}-${publishGroup.directPublishedEntities[0].entityKey}`}>
          <HistoryPublishLogGroup
            {...publishGroup}
            itemId={publishGroup.scopeEntityKey || containerId}
            hideLogVert={isLast && isBeforeGroup}
          />
        </div>
      );
    });

  return (
    <div className="history-log">
      {draftHistory && draftHistory.length !== 0 && (
        <HistoryDraftLogGroup
          itemId={containerId}
          displayName={container?.displayName ?? ''}
          entries={draftHistory}
        />
      )}
      {renderPublishGroups(groupsAfterCreation, false)}
      {creationEntry && (
        <HistoryCreatedLogGroup
          user={creationEntry.contributor?.username}
          displayName={creationEntry.title}
          itemType={creationEntry.itemType}
          createdAt={creationEntry.changedAt}
          showLogVert={hasBeforeCreationGroups}
        />
      )}
      {hasBeforeCreationGroups && renderPublishGroups(groupsBeforeCreation, true)}
    </div>
  );
};
