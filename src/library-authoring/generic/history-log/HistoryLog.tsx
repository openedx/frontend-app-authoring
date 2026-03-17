import { useIntl } from "@edx/frontend-platform/i18n";
import { LoadingSpinner } from "@src/generic/Loading";
import { useLibraryBlockDraftHistory, useLibraryBlockMetadata } from "@src/library-authoring/data/apiHooks";
import { HistoryLogGroup } from "./HistoryLogGroup";
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
    data: componentData,
    isPending: isPendingComponentData,
  } = useLibraryBlockMetadata(componentId);
  
  if (isPendingDraftHistory || isPendingComponentData) {
    return <LoadingSpinner />
  }

  return (
    <div className="history-log">
      {draftHistory && draftHistory.length !== 0 && (
        <HistoryLogGroup
          variant="draft"
          displayName={displayName}
          titleDate={draftHistory?.at(-1)?.changedAt ?? ''}
          entries={draftHistory ?? []}
        />
      )}
      <HistoryLogGroup
        variant="created"
        displayName={componentData?.createdBy ?? intl.formatMessage(messages.historyEntryDefaultUser)}
        titleDate={componentData?.created ?? ''}
        entries={[]}
      />
    </div>
  );
};
