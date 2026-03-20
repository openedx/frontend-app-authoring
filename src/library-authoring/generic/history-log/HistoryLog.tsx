import { useIntl } from "@edx/frontend-platform/i18n";
import { LoadingSpinner } from "@src/generic/Loading";
import { useLibraryBlockDraftHistory, useLibraryBlockMetadata, useLibraryBlockPublishHistory } from "@src/library-authoring/data/apiHooks";
import { HistoryCreatedLogGroup, HistoryDraftLogGroup, HistoryPublishLogGroup } from "./HistoryLogGroup";
import messages from "./messages";

export interface HistoryComponentLogProps {
  componentId: string;
  displayName: string;
}

export const HistoryComponentLog = ({
  componentId,
  displayName,
}: HistoryComponentLogProps) => {
  const intl = useIntl();
  
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

  const createdGroupTitle = intl.formatMessage(
    messages.createdComponentTitle,
    {
      user: componentData?.createdBy ?? intl.formatMessage(messages.historyEntryDefaultUser),
    },
  );
  
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
          const titleMessage = intl.formatMessage(
            messages.publishComponentTitle,
            {
              user: publishGroup.publishedBy,
            },
          )

          return (
            <div key={publishGroup.publishLogUuid}>
              <HistoryPublishLogGroup
                itemId={componentId}
                publishGroupId={publishGroup.publishLogUuid}
                titleMessage={titleMessage}
                contributors={publishGroup.contributors}
                publishedAt={publishGroup.publishedAt}
              />
            </div>
          )
        })
      )}
      <HistoryCreatedLogGroup
        titleMessage={createdGroupTitle}
        createdAt={componentData?.created ?? ''}
      />
    </div>
  );
};
