import { ComponentProps, ReactNode, useState } from 'react';
import moment from 'moment';
import classNames from 'classnames';
import { Avatar, Collapsible, Icon, Stack, useToggle } from '@openedx/paragon';
import { KeyboardArrowDown, KeyboardArrowUp } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { useLibraryPublishHistoryEntries } from '@src/library-authoring/data/apiHooks';
import { LoadingSpinner } from '@src/generic/Loading';

import { LibraryHistoryEntry, LibraryPublishContributor, LibraryPublishHistoryGroup } from '../../data/api';
import messages from './messages';
import { getItemIcon } from '@src/generic/block-type-utils';

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
  showLogVert?: boolean;
}

export interface HistoryDraftLogGroupProps {
  displayName: string;
  entries: LibraryHistoryEntry[];
}

export interface HistoryLogGroupEntriesProps {
  entries: LibraryHistoryEntry[];
  hideLastLogVert?: boolean;
}

export interface HistoryPublishLogGroupProps extends LibraryPublishHistoryGroup {
  itemId: string;
  hideLogVert?: boolean;
}

interface ContributorAvatarProps {
  username?: string;
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
  const intl = useIntl();
  const [imgError, setImgError] = useState(false);
  return (
    <Avatar
      className={className}
      size={size}
      src={imgError ? undefined : src}
      alt={username || intl.formatMessage(messages.historyEntryDefaultUser)}
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
      <Avatar className="history-log-group-avatar big-avatar" size="md" />
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
            <Icon src={KeyboardArrowDown} />
          </Collapsible.Visible>
          <Collapsible.Visible whenOpen>
            <Icon src={KeyboardArrowUp} />
          </Collapsible.Visible>
        </>
      )}
    </Stack>
  );
};

const HistoryLogGroupEntries = ({
  entries,
  hideLastLogVert,
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
                src={entry.contributor.profileImageUrls.medium}
                className="history-log-group-avatar small-avatar"
                size="sm"
              />
              <Stack>
                <Stack direction="horizontal" gap={1}>
                  <FormattedMessage
                    {...entryMessage}
                    values={{
                      user: entry.contributor.username ?? intl.formatMessage(messages.historyEntryDefaultUser),
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
            {!isLast && !hideLastLogVert && <div className="history-log-vert" />}
          </div>
        );
      })}
    </Stack>
  );
};

export const HistoryCreatedLogGroup = ({
  user,
  displayName,
  itemType,
  createdAt,
  showLogVert,
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
      {showLogVert && <div className="history-log-vert" />}
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
                displayName: <span className="history-log-title text-truncate">{displayName}</span>,
              },
            )}
            dateMessage={intl.formatMessage(
              messages.draftTitleDate,
              {
                count: entries.length,
                date: moment(entries?.at(-1)?.changedAt ?? '').fromNow(),
              },
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
            size="xs"
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
  directPublishedEntities,
  publishedBy,
  publishedAt,
  contributors,
  hideLogVert,
}: HistoryPublishLogGroupProps) => {
  const intl = useIntl();
  const [isOpenCollapsible, openCollapsible, closeCollapsible] = useToggle(false);

  const {
    data: entries,
    isPending,
  } = useLibraryPublishHistoryEntries(itemId, publishLogUuid, isOpenCollapsible);

  const dateMessage = moment(publishedAt).fromNow();
  const hasContributors = contributors.length > 0;

  const titleMessage = directPublishedEntities.length === 1
    ? intl.formatMessage(messages.publishTitle, {
      user: publishedBy || intl.formatMessage(messages.historyEntryDefaultUser),
      displayName: <span className="history-log-title text-truncate">{directPublishedEntities[0].title}</span>,
      icon: <Icon src={getItemIcon(directPublishedEntities[0].entityType)} />,
    })
    : intl.formatMessage(messages.publishTitleMultiple, {
      user: publishedBy || intl.formatMessage(messages.historyEntryDefaultUser),
      icon: <Icon src={getItemIcon('default')} />,
    });

  return (
    <div className="history-log-group publish-group">
      {hasContributors ?
        (
          <Collapsible.Advanced
            open={isOpenCollapsible}
            onOpen={openCollapsible}
            onClose={closeCollapsible}
          >
            <Collapsible.Trigger>
              <HistoryLogGroupTitle titleMessage={titleMessage} dateMessage={dateMessage} />
            </Collapsible.Trigger>
            <Collapsible.Body>
              {isPending ?
                (
                  <>
                    <div className="history-log-vert" />
                    <div className="ml-2 mt-2 w-100">
                      <LoadingSpinner />
                    </div>
                  </>
                ) :
                <HistoryLogGroupEntries entries={entries ?? []} />}
            </Collapsible.Body>
          </Collapsible.Advanced>
        ) :
        (
          <>
            {!hideLogVert && (
              <HistoryLogGroupTitle titleMessage={titleMessage} dateMessage={dateMessage} disableCollapsible />
            )}
            <div className="history-log-vert" />
          </>
        )}
      {hasContributors && (
        <Stack direction="horizontal">
          {!hideLogVert && (
            <div
              className={classNames(
                'history-log-vert',
                {
                  'history-log-vert-long': !isOpenCollapsible,
                },
              )}
            />
          )}
          {!isOpenCollapsible &&
            (
              <div
                className={classNames(
                  {
                    'ml-4 pl-1': hideLogVert,
                  },
                )}
              >
                <ContributorsAvatars contributors={contributors} />
              </div>
            )}
        </Stack>
      )}
    </div>
  );
};
