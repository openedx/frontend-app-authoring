import { useCallback, useContext, useState } from "react";
import { ActionRow, Button, ModalDialog, useToggle } from "@openedx/paragon";
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';

import { useEventListener } from "../../generic/hooks";
import { messageTypes } from "../constants";
import CompareChangesWidget from "../../library-authoring/component-comparison/CompareChangesWidget";
import { useAcceptLibraryBlockChanges, useIgnoreLibraryBlockChanges } from "../data/apiHooks";
import { useIframe } from "../context/hooks";
import DeleteModal from '../../generic/delete-modal/DeleteModal';
import messages from './messages';
import { ToastContext } from "../../generic/toast-context";
import LoadingButton from "../../generic/loading-button";

interface LibraryChangesMessageData {
  displayName: string,
  downstreamBlockId: string,
  courseAuthoringMfeUrl: string,
  upstreamBlockId: string,
  upstreamBlockVersionSynced: number,
  isVertical: boolean,
}

const PreviewLibraryXBlockChanges = () => {
  const intl = useIntl();
  const { showToast } = useContext(ToastContext);

  // Main preview library modal toggle.
  const [isModalOpen, openModal, closeModal] = useToggle(false);
  // ignore changes confirmation modal toggle.
  const [isConfirmModalOpen, openConfirmModal, closeConfirmModal] = useToggle(false);

  const [blockData, setBlockData] = useState<LibraryChangesMessageData | undefined>(undefined);

  const acceptChangesMutation = useAcceptLibraryBlockChanges();
  const ignoreChangesMutation = useIgnoreLibraryBlockChanges();

  const { sendMessageToIframe } = useIframe();

  const receiveMessage = useCallback(({ data }: { data: {
    payload: LibraryChangesMessageData;
    type: string;
  } }) => {
    const { payload, type } = data;

    if (type === messageTypes.showXBlockLibraryChangesPreview) {
      setBlockData(payload);
      openModal();
    }
  }, [openModal]);

  useEventListener('message', receiveMessage);

  const getTitle = useCallback(() => {
    if (blockData?.displayName) {
      return blockData?.displayName;
    }
    if (blockData?.isVertical) {
      return "Unit";
    }
    return "Component";
  }, [blockData]);

  const getBody = useCallback(() => {
    if (!blockData) {
      return null;
    }
    return (
      <CompareChangesWidget
        usageKey={blockData.upstreamBlockId}
        oldVersion={blockData.upstreamBlockVersionSynced || 'published'}
        newVersion='published'
      />
    );
  }, [blockData]);

  const handleAcceptChanges = useCallback(async () => {
    if (!blockData) {
      return;
    }
    try {
      await acceptChangesMutation.mutateAsync(blockData.downstreamBlockId);
      sendMessageToIframe(messageTypes.refreshXBlock, null);
    } catch (e) {
      showToast(intl.formatMessage(messages.acceptChangesFailure));
    } finally {
      closeModal();
    }
  }, [blockData]);

  const handleIgnoreChanges = useCallback(async () => {
    if (!blockData) {
      return;
    }
    try {
      await ignoreChangesMutation.mutateAsync(blockData.downstreamBlockId);
      sendMessageToIframe(messageTypes.refreshXBlock, null);
    } catch (e) {
      showToast(intl.formatMessage(messages.ignoreChangesFailure));
    } finally {
      closeModal();
    }
  }, [blockData]);

  return (
    <ModalDialog
      isOpen={isModalOpen}
      onClose={closeModal}
      size="xl"
      className="lib-preview-xblock-changes-modal"
      hasCloseButton
      isFullscreenOnMobile
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          <FormattedMessage
            {...messages.title}
            values={{blockTitle: getTitle()}}
          />
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        {getBody()}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <LoadingButton
            onClick={handleAcceptChanges}
            label={intl.formatMessage(messages.acceptChangesBtn)}
          />
          <Button
            variant="tertiary"
            onClick={openConfirmModal}
          >
            <FormattedMessage {...messages.ignoreChangesBtn} />
          </Button>
          <ModalDialog.CloseButton variant="tertiary">
            <FormattedMessage {...messages.cancelBtn} />
          </ModalDialog.CloseButton>
        </ActionRow>
      </ModalDialog.Footer>
      <DeleteModal
        isOpen={isConfirmModalOpen}
        close={closeConfirmModal}
        variant="warning"
        title={intl.formatMessage(messages.confirmationTitle)}
        description={intl.formatMessage(messages.confirmationDescription)}
        onDeleteSubmit={handleIgnoreChanges}
        btnLabel={intl.formatMessage(messages.confirmationConfirmBtn)}
      />
    </ModalDialog>
  )
}

export default PreviewLibraryXBlockChanges;
