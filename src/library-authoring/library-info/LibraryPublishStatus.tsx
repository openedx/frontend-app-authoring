import React, { useCallback, useContext, useMemo } from 'react';
import classNames from 'classnames';
import { Button, Container, Stack } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useCommitLibraryChanges, useRevertLibraryChanges } from '../data/apiHooks';
import { ContentLibrary } from '../data/api';
import { ToastContext } from '../../generic/toast-context';
import { convertToStringFromDateAndFormat } from '../../utils';
import { COMMA_SEPARATED_DATE_FORMAT, TIME_FORMAT } from '../../constants';
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
    const buildDraftBodyMessage = (() => {
      if (library.lastDraftCreatedBy) {
        return intl.formatMessage(messages.lastDraftMsg, {
          date: <b>{convertToStringFromDateAndFormat(library.lastDraftCreated, COMMA_SEPARATED_DATE_FORMAT)}</b>,
          time: <b>{convertToStringFromDateAndFormat(library.lastDraftCreated, TIME_FORMAT)}</b>,
          user: <b>{library.lastDraftCreatedBy}</b>,
        });
      }
      return intl.formatMessage(messages.lastDraftMsgWithoutUser, {
        date: <b>{convertToStringFromDateAndFormat(library.lastDraftCreated, COMMA_SEPARATED_DATE_FORMAT)}</b>,
        time: <b>{convertToStringFromDateAndFormat(library.lastDraftCreated, TIME_FORMAT)}</b>,
      });
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
          date: <b>{convertToStringFromDateAndFormat(library.lastPublished, COMMA_SEPARATED_DATE_FORMAT)}</b>,
          time: <b>{convertToStringFromDateAndFormat(library.lastPublished, TIME_FORMAT)}</b>,
          user: <b>{library.publishedBy}</b>,
        });
      } else {
        bodyMessageResult = intl.formatMessage(messages.lastPublishedMsgWithoutUser, {
          date: <b>{convertToStringFromDateAndFormat(library.lastPublished, COMMA_SEPARATED_DATE_FORMAT)}</b>,
          time: <b>{convertToStringFromDateAndFormat(library.lastPublished, TIME_FORMAT)}</b>,
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
      <Container>
        <Stack>
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
