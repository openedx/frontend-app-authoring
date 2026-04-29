import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { LibraryHistoryEntry } from '@src/library-authoring/data/api';
import messages from './messages';
import { Icon, Stack } from '@openedx/paragon';
import { ContributorAvatar } from './ContributorAvatars';
import { getItemIcon } from '@src/generic/block-type-utils';
import moment from 'moment';

export interface HistoryLogGroupEntriesProps {
  entries: LibraryHistoryEntry[];
}

export const HistoryLogGroupEntries = ({
  entries,
}: HistoryLogGroupEntriesProps) => {
  const intl = useIntl();

  const getEntryMessage = (entry: LibraryHistoryEntry) => {
    switch (entry.action) {
      case 'edited':
        return messages.historyEditEntry;
      case 'renamed':
        return messages.historyRenameEntry;
      case 'created':
        return messages.historyCreatedEntry;
      default:
        return messages.historyEditEntry;
    }
  };

  return (
    <Stack gap={0}>
      <div className="history-log-vert" />
      {entries.map((entry, index, arr) => {
        const isLast = index === arr.length - 1;
        const entryMessage = getEntryMessage(entry);

        return (
          <div key={entry.changedAt}>
            <Stack direction="horizontal" gap={2} className="ml-1.5">
              <ContributorAvatar
                username={entry.contributor?.username || intl.formatMessage(messages.historyEntryDefaultUser)}
                src={entry.contributor?.profileImageUrls.medium}
                className="history-log-group-avatar small-avatar"
                size="sm"
              />
              <Stack>
                <Stack direction="horizontal" gap={1}>
                  <FormattedMessage
                    {...entryMessage}
                    values={{
                      user: entry.contributor?.username ?? intl.formatMessage(messages.historyEntryDefaultUser),
                      displayName: <span className="history-log-title text-truncate">{entry.title}</span>,
                      icon: <Icon src={getItemIcon(entry.itemType)} />,
                    }}
                  />
                </Stack>
                <span className="small text-gray-500">
                  {moment(entry.changedAt).fromNow()}
                </span>
              </Stack>
            </Stack>
            {!isLast && <div className="history-log-vert" />}
          </div>
        );
      })}
    </Stack>
  );
};
