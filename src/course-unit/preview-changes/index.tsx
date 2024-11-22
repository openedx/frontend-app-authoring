import { useCallback, useContext, useState } from 'react';
import {
  ActionRow, Button, ModalDialog, useToggle,
} from '@openedx/paragon';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';

import { useEventListener } from '../../generic/hooks';
import { messageTypes } from '../constants';
import CompareChangesWidget from '../../library-authoring/component-comparison/CompareChangesWidget';
import { useAcceptLibraryBlockChanges, useIgnoreLibraryBlockChanges } from '../data/apiHooks';
import { useIframe } from '../context/hooks';
import DeleteModal from '../../generic/delete-modal/DeleteModal';
import messages from './messages';
import { ToastContext } from '../../generic/toast-context';
import LoadingButton from '../../generic/loading-button';
import Loading from '../../generic/Loading';
import { useLibraryBlockMetadata } from '../../library-authoring/data/apiHooks';

export interface LibraryChangesMessageData {
  displayName: string,
  downstreamBlockId: string,
  upstreamBlockId: string,
  upstreamBlockVersionSynced: number,
  isVertical: boolean,
}

const PreviewLibraryXBlockChanges = () => {
  const { showToast } = useContext(ToastContext);
  const intl = useIntl();

  const [blockData, setBlockData] = useState<LibraryChangesMessageData | undefined>(undefined);

  // Main preview library modal toggle.
  const [isModalOpen, openModal, closeModal] = useToggle(false);
  // ignore changes confirmation modal toggle.
  const [isConfirmModalOpen, openConfirmModal, closeConfirmModal] = useToggle(false);

  const acceptChangesMutation = useAcceptLibraryBlockChanges();
  const ignoreChangesMutation = useIgnoreLibraryBlockChanges();
  const { data: componentMetadata } = useLibraryBlockMetadata(blockData?.upstreamBlockId);

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
    const oldName = blockData?.displayName;
    const newName = componentMetadata?.displayName;

    if (!oldName) {
      if (blockData?.isVertical) {
        return intl.formatMessage(messages.defaultUnitTitle);
      }
      return intl.formatMessage(messages.defaultComponentTitle);
    }
    if (oldName === newName || !newName) {
      return intl.formatMessage(messages.title, { blockTitle: oldName });
    }
    return intl.formatMessage(messages.diffTitle, { oldName, newName });
  }, [blockData, componentMetadata]);

  const getBody = useCallback(() => {
    if (!blockData) {
      return <Loading />;
    }
    return (
      <CompareChangesWidget
        usageKey={blockData.upstreamBlockId}
        oldVersion={blockData.upstreamBlockVersionSynced || 'published'}
        newVersion="published"
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
      sendMessageToIframe(messageTypes.refreshXBlock, null);
    } catch (e) {
      showToast(intl.formatMessage(failureMsg));
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
          {getTitle()}
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
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

export default PreviewLibraryXBlockChanges;
