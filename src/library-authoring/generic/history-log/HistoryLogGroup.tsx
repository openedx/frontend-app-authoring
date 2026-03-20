import moment from "moment";
import classNames from "classnames";
import { Avatar, Collapsible, Icon, Stack, useToggle } from "@openedx/paragon";
import { KeyboardArrowDown, KeyboardArrowUp } from "@openedx/paragon/icons";
import { FormattedMessage, useIntl } from "@edx/frontend-platform/i18n";

import { useLibraryBlockPublishHistoryEntries } from "@src/library-authoring/data/apiHooks";
import { LoadingSpinner } from "@src/generic/Loading";

import { LibraryHistoryEntry } from "../../data/api";
import messages from "./messages";

const MAX_VISIBLE_CONTRIBUTORS = 5;

export interface HistoryLogGroupTitleProps {
  titleMessage: string;
  dateMessage: string;
  disableCollapsible?: boolean;
}

export interface HistoryCreatedLogGroupProps {
  titleMessage: string;
  createdAt: string;
}

export interface HistoryDraftLogGroupProps {
  displayName: string;
  entries: LibraryHistoryEntry[];
}

export interface HistoryLogGroupEntriesProps {
  entries: LibraryHistoryEntry[];
}

export interface HistoryPublishLogGroup {
  itemId: string;
  publishGroupId: string;
  titleMessage: string;
  publishedAt: string;
  contributors: string[];
}

const HistoryLogGroupTitle = ({
  titleMessage,
  dateMessage,
  disableCollapsible = false,
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
      {!disableCollapsible && (
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

const HistoryLogGroupEntries = ({
  entries,
}: HistoryLogGroupEntriesProps) => (
  <Stack gap={0}>
    <div className="history-log-vert" />
    {entries.map((entry) => {
      const entryMessage = entry.action === 'edited'
        ? messages.historyEditComponentEntry
        : messages.historyRenameComponentEntry;
      return (
        <div key={entry.changedAt}>
          <Stack direction="horizontal" gap={2} className="ml-1.5">
            <Avatar
              className="history-log-group-avatar small-avatar"
              size="sm"
              alt={entry.changedBy}
            />
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
);

export const HistoryCreatedLogGroup = ({
  titleMessage,
  createdAt,
}: HistoryCreatedLogGroupProps) => (
  <div className="history-log-group publish-group">
    <HistoryLogGroupTitle
      titleMessage={titleMessage}
      dateMessage={moment(createdAt).fromNow()}
      disableCollapsible
    />
  </div>
);

export const HistoryDraftLogGroup = ({
  displayName,
  entries,
}: HistoryDraftLogGroupProps) => {
  const intl = useIntl();

  return (
    <div className="history-log-group draft-group">
      <Collapsible.Advanced>
        <Collapsible.Trigger>
          <HistoryLogGroupTitle
            titleMessage={intl.formatMessage(messages.draftTitle, { displayName })}
            dateMessage={intl.formatMessage(
              messages.draftTitleDate,
              {
                count: entries.length,
                date: moment(entries?.at(-1)?.changedAt ?? '').fromNow(),
              }
            )}
          />
        </Collapsible.Trigger>
        <Collapsible.Body>
          <HistoryLogGroupEntries entries={entries} />
        </Collapsible.Body>
      </Collapsible.Advanced>
      <div className="history-log-vert" />
    </div>
  );
};

interface ContributorsAvatarsProps {
  contributors: string[];
}

const ContributorsAvatars = ({ contributors }: ContributorsAvatarsProps) => {
  const visible = contributors.slice(0, MAX_VISIBLE_CONTRIBUTORS);
  return (
    <Stack direction="horizontal" gap={2} className="ml-4.5">
      <div className="contributors-avatars">
        {visible.map((username) => (
          <Avatar
            key={username}
            className="contributors-avatar"
            size="xs"
            alt={username}
          />
        ))}
      </div>
      <span className="small">
        <FormattedMessage
          {...messages.historyContributors}
          values={{ count: contributors.length }}
        />
      </span>
    </Stack>
  );
};

export const HistoryPublishLogGroup = ({
  itemId,
  publishGroupId,
  titleMessage,
  publishedAt,
  contributors,
}: HistoryPublishLogGroup) => {
  const [isOpenCollapsible, openCollapsible, closeCollapsible] = useToggle(false);

  const {
    data: entries,
    isPending,
  } = useLibraryBlockPublishHistoryEntries(itemId, publishGroupId, isOpenCollapsible);

  return (
    <div className="history-log-group publish-group">
      <Collapsible.Advanced
        open={isOpenCollapsible}
        onOpen={openCollapsible}
        onClose={closeCollapsible}
      >
        <Collapsible.Trigger>
          <HistoryLogGroupTitle
            titleMessage={titleMessage}
            dateMessage={moment(publishedAt).fromNow()}
          />
        </Collapsible.Trigger>
        <Collapsible.Body>
          {isPending ? (
            <>
              <div className="history-log-vert" />
              <div className="ml-2 mt-2 w-100">
                <LoadingSpinner />
              </div>
            </>
          ): (
            <HistoryLogGroupEntries entries={entries ?? []} />
          )}
        </Collapsible.Body>
      </Collapsible.Advanced>
      <Stack direction="horizontal">
        <div className={classNames(
          "history-log-vert",
          {
            "history-log-vert-long": !isOpenCollapsible, 
          }
        )} />
        {!isOpenCollapsible && (
          <ContributorsAvatars contributors={contributors} />
        )}
      </Stack>
    </div>
  );
};
