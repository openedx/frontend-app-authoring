import { ComponentProps, ReactNode, useState } from "react";
import moment from "moment";
import classNames from "classnames";
import { Avatar, Collapsible, Icon, Stack, useToggle } from "@openedx/paragon";
import { KeyboardArrowDown, KeyboardArrowUp } from "@openedx/paragon/icons";
import { FormattedMessage, useIntl } from "@edx/frontend-platform/i18n";

import { useLibraryBlockPublishHistoryEntries } from "@src/library-authoring/data/apiHooks";
import { LoadingSpinner } from "@src/generic/Loading";

import { LibraryHistoryEntry, LibraryPublishContributor, LibraryPublishHistoryGroup } from "../../data/api";
import messages from "./messages";
import { getItemIcon } from "@src/generic/block-type-utils";

const MAX_VISIBLE_CONTRIBUTORS = 5;

export interface HistoryLogGroupTitleProps {
  titleMessage: string | ReactNode;
  dateMessage: string;
  disableCollapsible?: boolean;
}

export interface HistoryCreatedLogGroupProps {
  user?: string | null;
  displayName: string;
  itemType: string;
  createdAt: string;
}

export interface HistoryDraftLogGroupProps {
  displayName: string;
  entries: LibraryHistoryEntry[];
}

export interface HistoryLogGroupEntriesProps {
  entries: LibraryHistoryEntry[];
}

export interface HistoryPublishLogGroupProps extends LibraryPublishHistoryGroup {
  itemId: string;
}

interface ContributorAvatarProps {
  username: string;
  src: string;
  className: string;
  size: ComponentProps<typeof Avatar>['size'];
}

interface ContributorsAvatarsProps {
  contributors: LibraryPublishContributor[];
}

const ContributorAvatar = ({
  username,
  src,
  className,
  size,
}: ContributorAvatarProps) => {
  const [imgError, setImgError] = useState(false);
  return (
    <Avatar
      className={className}
      size={size}
      src={imgError ? undefined : src}
      alt={username}
      onError={() => setImgError(true)}
    />
  );
};

const HistoryLogGroupTitle = ({
  titleMessage,
  dateMessage,
  disableCollapsible = false,
}: HistoryLogGroupTitleProps) => {
  return (
    <Stack direction="horizontal" gap={2} className="mb-1">
      <Avatar className="history-log-group-avatar big-avatar" size="md"/>
      <Stack>
        <Stack direction="horizontal" gap={1}>
          {titleMessage}
        </Stack>
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
        ? messages.historyEditEntry
        : messages.historyRenameEntry;
      
      return (
        <div key={entry.changedAt}>
          <Stack direction="horizontal" gap={2} className="ml-1.5">
            <ContributorAvatar
              username={entry.changedBy.username}
              src={entry.changedBy.profileImageUrls.medium}
              className="history-log-group-avatar small-avatar"
              size="sm"
            />
            <Stack>
              <Stack direction="horizontal" gap={1}>
                <FormattedMessage
                  {...entryMessage}
                  values={{
                    user: entry.changedBy.username,
                    displayName: <span className="history-log-title text-truncate">{entry.title}</span>,
                    icon: <Icon src={getItemIcon(entry.blockType)} />
                  }}
                />
              </Stack>
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
  user,
  displayName,
  itemType,
  createdAt,
}: HistoryCreatedLogGroupProps) => {
  const intl = useIntl();

  return (
    <div className="history-log-group publish-group">
      <HistoryLogGroupTitle
        titleMessage={intl.formatMessage(messages.createdTitle, {
          user: user ?? intl.formatMessage(messages.historyEntryDefaultUser),
          displayName: <span className="history-log-title text-truncate">{displayName}</span>,
          icon: <Icon src={getItemIcon(itemType)} />,
        })}
        dateMessage={moment(createdAt).fromNow()}
        disableCollapsible
      />
    </div>
  );
};

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
            titleMessage={intl.formatMessage(
              messages.draftTitle,
              {
                displayName: <span className="history-log-title text-truncate">{displayName}</span>
              }
            )}
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

const ContributorsAvatars = ({ contributors }: ContributorsAvatarsProps) => {
  const visible = contributors.slice(0, MAX_VISIBLE_CONTRIBUTORS);
  return (
    <Stack direction="horizontal" gap={2} className="ml-4.5">
      <div className="contributors-avatars">
        {visible.map(({ username, profileImageUrls }) => (
          <ContributorAvatar
            key={username}
            size='xs'
            className="contributors-avatar"
            username={username}
            src={profileImageUrls.small}
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
  publishLogUuid,
  title,
  publishedBy,
  publishedAt,
  blockType,
  contributors,
}: HistoryPublishLogGroupProps) => {
  const intl = useIntl();
  const [isOpenCollapsible, openCollapsible, closeCollapsible] = useToggle(false);

  const {
    data: entries,
    isPending,
  } = useLibraryBlockPublishHistoryEntries(itemId, publishLogUuid, isOpenCollapsible);

  return (
    <div className="history-log-group publish-group">
      <Collapsible.Advanced
        open={isOpenCollapsible}
        onOpen={openCollapsible}
        onClose={closeCollapsible}
      >
        <Collapsible.Trigger>
          <HistoryLogGroupTitle
            titleMessage={intl.formatMessage(
              messages.publishTitle,
              {
                user: publishedBy,
                displayName: <span className="history-log-title text-truncate">{title}</span>,
                icon: <Icon src={getItemIcon(blockType)} /> 
              },
            )}
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
