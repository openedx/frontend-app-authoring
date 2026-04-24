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

  if (isPendingDraftHistory || isPendingContainer || isPendingPublishHistoryGroups || isPendingCreationEntry) {
    return <LoadingSpinner />;
  }

  return (
    <div className="history-log">
      {draftHistory && draftHistory.length !== 0 && (
        <HistoryDraftLogGroup
          displayName={container?.displayName ?? ''}
          entries={draftHistory}
        />
      )}
      {publishHistoryGroups && publishHistoryGroups.length !== 0 && (
        publishHistoryGroups.map((publishGroup) => (
          <div key={`${publishGroup.publishLogUuid}-${publishGroup.directPublishedEntities[0].entityKey}`}>
            <HistoryPublishLogGroup
              {...publishGroup}
              itemId={publishGroup.scopeEntityKey || containerId}
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
