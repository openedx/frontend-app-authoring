import React, { useCallback, useContext, useMemo } from "react";
import { Button, Container, Stack } from "@openedx/paragon";
import { ContentLibrary } from "../data/api";
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from "./messages";
import classNames from 'classnames';
import { useCommitLibraryChanges, useRevertLibraryChanges } from "../data/apiHooks";
import { ToastContext } from "../../generic/toast-context";
import { convertToStringFromDateAndFormat } from "../../utils";
import { COMMA_SEPARATED_DATE_FORMAT, TIME_FORMAT } from "../../constants";

type LibraryPublishStatusProps = {
  library: ContentLibrary,
}

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
    let isPublished : boolean;
    let statusMessage : string;
    let extraStatusMessage : string | undefined = undefined;
    let bodyMessage : string | undefined = undefined;
    const buildDraftBodyMessage = (() => {
      if (library.lastDraftCreatedBy) {
        return intl.formatMessage(messages.lastDraftMsg, {
          date: <b>{convertToStringFromDateAndFormat(library.lastDraftCreated, COMMA_SEPARATED_DATE_FORMAT)}</b>,
          time: <b>{convertToStringFromDateAndFormat(library.lastDraftCreated, TIME_FORMAT)}</b>,
          user: <b>{library.lastDraftCreatedBy}</b>,
        });
      } else {
        return intl.formatMessage(messages.lastDraftMsgWithoutUser, {
          date: <b>{convertToStringFromDateAndFormat(library.lastDraftCreated, COMMA_SEPARATED_DATE_FORMAT)}</b>,
          time: <b>{convertToStringFromDateAndFormat(library.lastDraftCreated, TIME_FORMAT)}</b>,
        });
      }
    });

    if (!library.lastPublished) {
      // Library is never published (new)
      isPublished = false;
      statusMessage = intl.formatMessage(messages.draftStatusLabel);
      extraStatusMessage = intl.formatMessage(messages.neverPublishedLabel);
      bodyMessage = buildDraftBodyMessage();
    } else if (library.hasUnpublishedChanges || library.hasUnpublishedDeletes) {
      // Library is on Draft state
      isPublished = false;
      statusMessage = intl.formatMessage(messages.draftStatusLabel);
      extraStatusMessage = intl.formatMessage(messages.unpublishedStatusLabel);
      bodyMessage = buildDraftBodyMessage();
    } else {
      // Library is published
      isPublished = true;
      statusMessage = intl.formatMessage(messages.publishedStatusLabel);
      if (library.publishedBy) {
        bodyMessage = intl.formatMessage(messages.lastPublishedMsg, {
          date: <b>{convertToStringFromDateAndFormat(library.lastPublished, COMMA_SEPARATED_DATE_FORMAT)}</b>,
          time: <b>{convertToStringFromDateAndFormat(library.lastPublished, TIME_FORMAT)}</b>,
          user: <b>{library.publishedBy}</b>,
        })
      } else {
        bodyMessage = intl.formatMessage(messages.lastPublishedMsgWithoutUser, {
          date: <b>{convertToStringFromDateAndFormat(library.lastPublished, COMMA_SEPARATED_DATE_FORMAT)}</b>,
          time: <b>{convertToStringFromDateAndFormat(library.lastPublished, TIME_FORMAT)}</b>,
        })
      }
    }
    return {
      isPublished,
      statusMessage,
      extraStatusMessage,
      bodyMessage,
    }
  }, [library])
  
  return (
    <Stack>
      <Container className={classNames("library-publish-status", {
        "draft-status": !isPublished,
        "published-status": isPublished,
      })}>
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
          <div className='d-flex justify-content-end'>
            <Button disabled={isPublished} variant='link' onClick={revert}>
              {intl.formatMessage(messages.discardChangesButtonLabel)}
            </Button>  
          </div>
        </Stack>
      </Container>
    </Stack>
  );
};

export default LibraryPublishStatus;
