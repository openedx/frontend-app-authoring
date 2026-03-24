import { LoadingSpinner } from "@src/generic/Loading";
import { useLibraryBlockDraftHistory, useLibraryBlockMetadata, useLibraryBlockPublishHistory } from "@src/library-authoring/data/apiHooks";
import { HistoryCreatedLogGroup, HistoryDraftLogGroup, HistoryPublishLogGroup } from "./HistoryLogGroup";

export interface HistoryComponentLogProps {
  componentId: string;
  displayName: string;
}

export const HistoryComponentLog = ({
  componentId,
  displayName,
}: HistoryComponentLogProps) => {
  const {
    data: draftHistory,
    isPending: isPendingDraftHistory,
  } = useLibraryBlockDraftHistory(componentId);

  const {
    data: publishHistoryGroups,
    isPending: isPendingPublishHistoryGroups,
  } = useLibraryBlockPublishHistory(componentId);

  const {
    data: componentData,
    isPending: isPendingComponentData,
  } = useLibraryBlockMetadata(componentId);
  
  if (isPendingDraftHistory || isPendingComponentData || isPendingPublishHistoryGroups) {
    return <LoadingSpinner />
  }
  
  return (
    <div className="history-log">
      {draftHistory && draftHistory.length !== 0 && (
        <HistoryDraftLogGroup
          displayName={displayName}
          entries={draftHistory}
        /> 
      )}
      {publishHistoryGroups && publishHistoryGroups.length !== 0 && (
        publishHistoryGroups.map((publishGroup) => {
          return (
            <div key={publishGroup.publishLogUuid}>
              <HistoryPublishLogGroup
                {...publishGroup}
                itemId={componentId}
              />
            </div>
          )
        })
      )}
      <HistoryCreatedLogGroup
        user={componentData?.createdBy}
        displayName={componentData?.displayName ?? ''}
        itemType={componentData?.blockType ?? ''}
        createdAt={componentData?.created ?? ''}
      />
    </div>
  );
};
