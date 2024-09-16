import {
  FormattedDate,
  FormattedMessage,
  FormattedTime,
  useIntl,
} from '@edx/frontend-platform/i18n';
import { Button, Container, Stack } from '@openedx/paragon';
import classNames from 'classnames';

import messages from './messages';

const CustomFormattedDate = ({ date }: { date: string }) => (
  <b>
    <FormattedDate
      value={date}
      year="numeric"
      month="long"
      day="2-digit"
    />
  </b>
);

const CustomFormattedTime = ({ date }: { date: string }) => (
  <b>
    <FormattedTime
      value={date}
      hour12={false}
    />
  </b>
);

type DraftBodyMessageProps = {
  lastDraftCreatedBy: string | null;
  lastDraftCreated: string | null;
  created: string | null;
};
const DraftBodyMessage = ({ lastDraftCreatedBy, lastDraftCreated, created }: DraftBodyMessageProps) => {
  if (lastDraftCreatedBy && lastDraftCreated) {
    return (
      <FormattedMessage
        {...messages.lastDraftMsg}
        values={{
          date: <CustomFormattedDate date={lastDraftCreated} />,
          time: <CustomFormattedTime date={lastDraftCreated} />,
          user: <b>{lastDraftCreatedBy}</b>,
        }}
      />
    );
  }

  if (lastDraftCreated) {
    return (
      <FormattedMessage
        {...messages.lastDraftMsgWithoutUser}
        values={{
          date: <CustomFormattedDate date={lastDraftCreated} />,
          time: <CustomFormattedTime date={lastDraftCreated} />,
        }}
      />
    );
  }

  if (created) {
    return (
      <FormattedMessage
        {...messages.lastDraftMsgWithoutUser}
        values={{
          date: <CustomFormattedDate date={created} />,
          time: <CustomFormattedTime date={created} />,
        }}
      />
    );
  }

  return null;
};

type StatusWidgedProps = {
  lastPublished: string | null;
  hasUnpublishedChanges: boolean;
  hasUnpublishedDeletes?: boolean;
  lastDraftCreatedBy: string | null;
  lastDraftCreated: string | null;
  created: string | null;
  publishedBy: string | null;
  numBlocks?: number;
  onCommit?: () => void;
  onRevert?: () => void;
};

/**
  * This component displays the status of an entity (published, draft, etc.) and allows the user to publish
  * or discard changes.
  *
  * This component doesn't handle fetching the data or any other side effects. It only displays the status
  * and provides the buttons to commit or revert changes.
  *
  * @example
  * ```tsx
  * const { data: libraryData } = useContentLibrary(libraryId);
  * const onCommit = () => { commitChanges(libraryId); };
  * const onRevert = () => { revertChanges(libraryId); };
  *
  * return <StatusWidget {...libraryData} onCommit={onCommit} onRevert={onRevert} />;
  * ```
  */
const StatusWidget = ({
  lastPublished,
  hasUnpublishedChanges,
  hasUnpublishedDeletes,
  lastDraftCreatedBy,
  lastDraftCreated,
  created,
  publishedBy,
  numBlocks,
  onCommit,
  onRevert,
}: StatusWidgedProps) => {
  const intl = useIntl();

  let isNew: boolean | undefined;
  let isPublished: boolean;
  let statusMessage: string;
  let extraStatusMessage: string | undefined;
  let bodyMessage: React.ReactNode | undefined;

  if (!lastPublished) {
    // Entity is never published (new)
    isNew = numBlocks != null && numBlocks === 0; // allow discarding if components are added
    isPublished = false;
    statusMessage = intl.formatMessage(messages.draftStatusLabel);
    extraStatusMessage = intl.formatMessage(messages.neverPublishedLabel);
    bodyMessage = (<DraftBodyMessage {...{ lastDraftCreatedBy, lastDraftCreated, created }} />);
  } else if (hasUnpublishedChanges || hasUnpublishedDeletes) {
    // Entity is on Draft state
    isPublished = false;
    statusMessage = intl.formatMessage(messages.draftStatusLabel);
    extraStatusMessage = intl.formatMessage(messages.unpublishedStatusLabel);
    bodyMessage = (<DraftBodyMessage {...{ lastDraftCreatedBy, lastDraftCreated, created }} />);
  } else {
    // Entity is published
    isPublished = true;
    statusMessage = intl.formatMessage(messages.publishedStatusLabel);
    if (publishedBy) {
      bodyMessage = (
        <FormattedMessage
          {...messages.lastPublishedMsg}
          values={{
            date: <CustomFormattedDate date={lastPublished} />,
            time: <CustomFormattedTime date={lastPublished} />,
            user: <b>{publishedBy}</b>,
          }}
        />
      );
    } else {
      bodyMessage = (
        <FormattedMessage
          {...messages.lastPublishedMsgWithoutUser}
          values={{
            date: <CustomFormattedDate date={lastPublished} />,
            time: <CustomFormattedTime date={lastPublished} />,
          }}
        />
      );
    }
  }

  return (
    <Stack>
      <Container className={classNames('status-widget', {
        'draft-status': !isPublished,
        'published-status': isPublished,
      })}
      >
        <span className="font-weight-bold">
          {statusMessage}
        </span>
        { extraStatusMessage && (
          <span className="ml-1">
            {extraStatusMessage}
          </span>
        )}
      </Container>
      <Container className="mt-3">
        <Stack gap={3}>
          <span>
            {bodyMessage}
          </span>
          {onCommit && (
            <Button disabled={isPublished} onClick={onCommit}>
              {intl.formatMessage(messages.publishButtonLabel)}
            </Button>
          )}
          {onRevert && (
            <div className="d-flex justify-content-end">
              <Button disabled={isPublished || isNew} variant="link" onClick={onRevert}>
                {intl.formatMessage(messages.discardChangesButtonLabel)}
              </Button>
            </div>
          )}
        </Stack>
      </Container>
    </Stack>
  );
};

export default StatusWidget;
