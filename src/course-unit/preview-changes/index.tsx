import { useCallback, useContext, useState } from 'react';
import {
  ActionRow, Button, ModalDialog, useToggle,
} from '@openedx/paragon';
import { Warning } from '@openedx/paragon/icons';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';

import { useEventListener } from '../../generic/hooks';
import { messageTypes } from '../constants';
import CompareChangesWidget from '../../library-authoring/component-comparison/CompareChangesWidget';
import { useAcceptLibraryBlockChanges, useIgnoreLibraryBlockChanges } from '../data/apiHooks';
import AlertMessage from '../../generic/alert-message';
import { useIframe } from '../../generic/hooks/context/hooks';
import DeleteModal from '../../generic/delete-modal/DeleteModal';
import messages from './messages';
import { ToastContext } from '../../generic/toast-context';
import LoadingButton from '../../generic/loading-button';
import Loading from '../../generic/Loading';

export interface LibraryChangesMessageData {
  displayName: string,
  downstreamBlockId: string,
  upstreamBlockId: string,
  upstreamBlockVersionSynced: number,
  isVertical: boolean,
}

export interface PreviewLibraryXBlockChangesProps {
  blockData: LibraryChangesMessageData,
  isModalOpen: boolean,
  closeModal: () => void,
  postChange: (accept: boolean) => void,
}

/**
 * Component to preview two xblock versions in a modal that depends on params
 * to display blocks, open-close modal, accept-ignore changes and post change triggers
 */
export const PreviewLibraryXBlockChanges = ({
  blockData,
  isModalOpen,
  closeModal,
  postChange,
}: PreviewLibraryXBlockChangesProps) => {
  const { showToast } = useContext(ToastContext);
  const intl = useIntl();

  // ignore changes confirmation modal toggle.
  const [isConfirmModalOpen, openConfirmModal, closeConfirmModal] = useToggle(false);

  const acceptChangesMutation = useAcceptLibraryBlockChanges();
  const ignoreChangesMutation = useIgnoreLibraryBlockChanges();

  const getBody = useCallback(() => {
    if (!blockData) {
      return <Loading />;
    }
    return (
      <CompareChangesWidget
        usageKey={blockData.upstreamBlockId}
        oldVersion={blockData.upstreamBlockVersionSynced || 'published'}
        newVersion="published"
        isContainer={blockData.isVertical}
      />
    );
  }, [blockData]);

  const updateAndRefresh = useCallback(async (accept: boolean) => {
    // istanbul ignore if: this should never happen
    if (!blockData) {
      return;
    }

    const mutation = accept ? acceptChangesMutation : ignoreChangesMutation;
    const failureMsg = accept ? messages.acceptChangesFailure : messages.ignoreChangesFailure;

    try {
      await mutation.mutateAsync(blockData.downstreamBlockId);
      postChange(accept);
    } catch (e) {
      showToast(intl.formatMessage(failureMsg));
    } finally {
      closeModal();
    }
  }, [blockData]);

  const defaultTitle = intl.formatMessage(
    blockData.isVertical
      ? messages.defaultUnitTitle
      : messages.defaultComponentTitle,
  );
  const title = blockData.displayName
    ? intl.formatMessage(messages.title, { blockTitle: blockData?.displayName })
    : defaultTitle;

  return (
    <ModalDialog
      isOpen={isModalOpen}
      onClose={closeModal}
      size="xl"
      title={title}
      className="lib-preview-xblock-changes-modal"
      hasCloseButton
      isFullscreenOnMobile
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {title}
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <AlertMessage
          show
          variant="warning"
          icon={Warning}
          title={intl.formatMessage(messages.olderVersionPreviewAlert)}
        />
        {getBody()}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <LoadingButton
            onClick={() => updateAndRefresh(true)}
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
        onDeleteSubmit={() => updateAndRefresh(false)}
        btnLabel={intl.formatMessage(messages.confirmationConfirmBtn)}
      />
    </ModalDialog>
  );
};

/**
 * Wrapper over PreviewLibraryXBlockChanges to preview two xblock versions in a modal
 * that depends on iframe message events to setBlockData and display modal.
 */
const IframePreviewLibraryXBlockChanges = () => {
  const [blockData, setBlockData] = useState<LibraryChangesMessageData | undefined>(undefined);

  // Main preview library modal toggle.
  const [isModalOpen, openModal, closeModal] = useToggle(false);

  const { sendMessageToIframe } = useIframe();

  const receiveMessage = useCallback(({ data }: {
    data: {
      payload: LibraryChangesMessageData;
      type: string;
    }
  }) => {
    const { payload, type } = data;

    if (type === messageTypes.showXBlockLibraryChangesPreview) {
      setBlockData(payload);
      openModal();
    }
  }, [openModal]);

  useEventListener('message', receiveMessage);

  if (!blockData) {
    return null;
  }

  return (
    <PreviewLibraryXBlockChanges
      blockData={blockData}
      isModalOpen={isModalOpen}
      closeModal={closeModal}
      postChange={() => sendMessageToIframe(messageTypes.refreshXBlock, null)}
    />
  );
};

export default IframePreviewLibraryXBlockChanges;
