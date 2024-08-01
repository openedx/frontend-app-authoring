import React, { useCallback, useContext, useMemo } from 'react';
import classNames from 'classnames';
import { Button, Container, Stack } from '@openedx/paragon';
import { FormattedDate, FormattedTime, useIntl } from '@edx/frontend-platform/i18n';
import { useCommitLibraryChanges, useRevertLibraryChanges } from '../data/apiHooks';
import { ContentLibrary } from '../data/api';
import { ToastContext } from '../../generic/toast-context';
import messages from './messages';

type LibraryPublishStatusProps = {
  library: ContentLibrary,
};

const LibraryPublishStatus = ({ library } : LibraryPublishStatusProps) => {
  const intl = useIntl();
  const commitLibraryChanges = useCommitLibraryChanges();
  const revertLibraryChanges = useRevertLibraryChanges();
  const { showToast } = useContext(ToastContext);

  const commit = useCallback(() => {
    commitLibraryChanges.mutateAsync(library.id)
      .then(() => {
        showToast(intl.formatMessage(messages.publishSuccessMsg));
      }).catch(() => {
        showToast(intl.formatMessage(messages.publishErrorMsg));
      });
  }, []);

  const revert = useCallback(() => {
    revertLibraryChanges.mutateAsync(library.id)
      .then(() => {
        showToast(intl.formatMessage(messages.revertSuccessMsg));
      }).catch(() => {
        showToast(intl.formatMessage(messages.revertErrorMsg));
      });
  }, []);

  const {
    isPublished,
    statusMessage,
    extraStatusMessage,
    bodyMessage,
  } = useMemo(() => {
    let isPublishedResult: boolean;
    let statusMessageResult : string;
    let extraStatusMessageResult : string | undefined;
    let bodyMessageResult : string | undefined;

    const buildDate = ((date : string) => (
      <b>
        <FormattedDate
          value={date}
          year="numeric"
          month="long"
          day="2-digit"
        />
      </b>
    ));

    const buildTime = ((date: string) => (
      <b>
        <FormattedTime
          value={date}
          hour12={false}
        />
      </b>
    ));

    const buildDraftBodyMessage = (() => {
      if (library.lastDraftCreatedBy && library.lastDraftCreated) {
        return intl.formatMessage(messages.lastDraftMsg, {
          date: buildDate(library.lastDraftCreated),
          time: buildTime(library.lastDraftCreated),
          user: <b>{library.lastDraftCreatedBy}</b>,
        });
      }
      if (library.lastDraftCreated) {
        return intl.formatMessage(messages.lastDraftMsgWithoutUser, {
          date: buildDate(library.lastDraftCreated),
          time: buildTime(library.lastDraftCreated),
        });
      }
      if (library.created) {
        return intl.formatMessage(messages.lastDraftMsgWithoutUser, {
          date: buildDate(library.created),
          time: buildTime(library.created),
        });
      }
      return '';
    });

    if (!library.lastPublished) {
      // Library is never published (new)
      isPublishedResult = false;
      statusMessageResult = intl.formatMessage(messages.draftStatusLabel);
      extraStatusMessageResult = intl.formatMessage(messages.neverPublishedLabel);
      bodyMessageResult = buildDraftBodyMessage();
    } else if (library.hasUnpublishedChanges || library.hasUnpublishedDeletes) {
      // Library is on Draft state
      isPublishedResult = false;
      statusMessageResult = intl.formatMessage(messages.draftStatusLabel);
      extraStatusMessageResult = intl.formatMessage(messages.unpublishedStatusLabel);
      bodyMessageResult = buildDraftBodyMessage();
    } else {
      // Library is published
      isPublishedResult = true;
      statusMessageResult = intl.formatMessage(messages.publishedStatusLabel);
      if (library.publishedBy) {
        bodyMessageResult = intl.formatMessage(messages.lastPublishedMsg, {
          date: buildDate(library.lastPublished),
          time: buildTime(library.lastPublished),
          user: <b>{library.publishedBy}</b>,
        });
      } else {
        bodyMessageResult = intl.formatMessage(messages.lastPublishedMsgWithoutUser, {
          date: buildDate(library.lastPublished),
          time: buildTime(library.lastPublished),
        });
      }
    }
    return {
      isPublished: isPublishedResult,
      statusMessage: statusMessageResult,
      extraStatusMessage: extraStatusMessageResult,
      bodyMessage: bodyMessageResult,
    };
  }, [library]);

  return (
    <Stack>
      <Container className={classNames('library-publish-status', {
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
          <Button disabled={isPublished} onClick={commit}>
            {intl.formatMessage(messages.publishButtonLabel)}
          </Button>
          <div className="d-flex justify-content-end">
            <Button disabled={isPublished} variant="link" onClick={revert}>
              {intl.formatMessage(messages.discardChangesButtonLabel)}
            </Button>
          </div>
        </Stack>
      </Container>
    </Stack>
  );
};

export default LibraryPublishStatus;
