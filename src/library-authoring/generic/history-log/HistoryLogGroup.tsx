import classNames from "classnames";
import moment from "moment";

import { FormattedMessage, useIntl } from "@edx/frontend-platform/i18n";
import { Avatar, Collapsible, Icon, Stack } from "@openedx/paragon";
import { KeyboardArrowDown, KeyboardArrowUp } from "@openedx/paragon/icons";

import { LibraryHistoryEntry } from "../../data/api";

import messages from "./messages";

export interface HistoryLogGroupProps {
  variant: 'draft' | 'published' | 'created';
  displayName: string;
  titleDate: string;
  entries: LibraryHistoryEntry[];
}

export interface HistoryLogGroupTitleProps {
  titleMessage: string;
  dateMessage: string;
  isCollapsible?: boolean;
}

const HistoryLogGroupTitle = ({
  titleMessage,
  dateMessage,
  isCollapsible = true,
}: HistoryLogGroupTitleProps) => {
  return (
    <Stack direction="horizontal" gap={2} className="mb-1">
      <Avatar className="history-log-group-avatar big-avatar" size="md"/>
      <Stack>
        <span>
          {titleMessage}
        </span>
        <span className="small text-gray-500">
          {dateMessage}
        </span>
      </Stack>
      {isCollapsible && (
        <>
          <Collapsible.Visible whenClosed>
            <Icon src={KeyboardArrowDown}/>
          </Collapsible.Visible>
          <Collapsible.Visible whenOpen>
            <Icon src={KeyboardArrowUp}/>
          </Collapsible.Visible>
        </>
      )}
    </Stack>
  )
};

export const HistoryLogGroup = ({
  variant,
  displayName,
  titleDate,
  entries,
}: HistoryLogGroupProps) => {
  const intl = useIntl();

  if (variant === 'created') {
    return (
      <div className="history-log-group publish-group">
        <HistoryLogGroupTitle
          titleMessage={intl.formatMessage(
            messages.createdComponentTitle,
            {
              user: displayName,
            }
          )}
          dateMessage={moment(titleDate).fromNow()}
          isCollapsible={entries.length !== 0}
        />
      </div>
    )
  }

  return (
    <div className={classNames(
      'history-log-group',
      {
        'draft-group': variant === 'draft',
        'publish-group': variant === 'published',
      },
    )}>
      <Collapsible.Advanced>
        <Collapsible.Trigger>
          <HistoryLogGroupTitle
            titleMessage={intl.formatMessage(
              messages.draftTitle,
              { displayName },
            )}
            dateMessage={intl.formatMessage(
              messages.draftTitleDate,
              {
                count: entries.length,
                date: moment(titleDate).fromNow(),
              }
            )}
          />
        </Collapsible.Trigger>
        <Collapsible.Body>
          <Stack gap={0}>
            <div className="history-log-vert" />
            {entries.map((entry) => {
              const entryMessage = entry.action === 'edited'
                ? messages.historyEditComponentEntry
                : messages.historyRenameComponentEntry;
              return (
                <div key={entry.changedAt}>
                  <Stack direction="horizontal" gap={2} className="ml-1.5">
                    <Avatar className="history-log-group-avatar small-avatar" size="sm" />
                    <Stack>
                      <span>
                        <FormattedMessage
                          {...entryMessage}
                          values={{ user: entry.changedBy }}
                        />
                      </span>
                      <span className="small text-gray-500">
                        {moment(entry.changedAt).fromNow()}
                      </span>
                    </Stack>
                    
                  </Stack>
                  <div className="history-log-vert" />
                </div>
              );
            })}
          </Stack>
        </Collapsible.Body>
      </Collapsible.Advanced>
      <div className="history-log-vert" />
    </div>
  );
};
