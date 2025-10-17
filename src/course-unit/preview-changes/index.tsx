import {
  useCallback, useContext, useMemo, useState,
} from 'react';
import {
  ActionRow, Button, Icon, ModalDialog, useToggle,
} from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';

import { ToastContext } from '@src/generic/toast-context';
import Loading from '@src/generic/Loading';
import CompareChangesWidget from '@src/library-authoring/component-comparison/CompareChangesWidget';
import AlertMessage from '@src/generic/alert-message';
import LoadingButton from '@src/generic/loading-button';
import DeleteModal from '@src/generic/delete-modal/DeleteModal';
import { useIframe } from '@src/generic/hooks/context/hooks';
import { useEventListener } from '@src/generic/hooks';
import { getItemIcon } from '@src/generic/block-type-utils';
import { CompareContainersWidget } from '@src/container-comparison/CompareContainersWidget';

import { messageTypes } from '../constants';
import { useAcceptLibraryBlockChanges, useIgnoreLibraryBlockChanges } from '../data/apiHooks';
import messages from './messages';

type ConfirmationModalType = 'ignore' | 'update' | 'keep' | undefined;

const ConfirmationModal = ({
  modalType,
  onClose,
  updateAndRefresh,
}: {
  modalType: ConfirmationModalType,
  onClose: () => void,
  updateAndRefresh: (accept: boolean, overrideCustomizations: boolean) => void,
}) => {
  const intl = useIntl();

  const {
    title,
    description,
    btnLabel,
    btnVariant,
    accept,
    overrideCustomizations,
  } = useMemo(() => {
    let resultTitle: string | undefined;
    let resultDescription: string | undefined;
    let resutlBtnLabel: string | undefined;
    let resultAccept: boolean = false;
    let resultOverrideCustomizations: boolean = false;
    let resultBtnVariant: 'danger' | 'primary' = 'danger';

    switch (modalType) {
      case 'ignore':
        resultTitle = intl.formatMessage(messages.confirmationTitle);
        resultDescription = intl.formatMessage(messages.confirmationDescription);
        resutlBtnLabel = intl.formatMessage(messages.confirmationConfirmBtn);
        break;
      case 'update':
        resultTitle = intl.formatMessage(messages.updateToPublishedLibraryContentTitle);
        resultDescription = intl.formatMessage(messages.updateToPublishedLibraryContentBody);
        resutlBtnLabel = intl.formatMessage(messages.updateToPublishedLibraryContentConfirm);
        resultAccept = true;
        resultOverrideCustomizations = true;
        break;
      case 'keep':
        resultTitle = intl.formatMessage(messages.keepCourseContentTitle);
        resultDescription = intl.formatMessage(messages.keepCourseContentBody);
        resutlBtnLabel = intl.formatMessage(messages.keepCourseContentButton);
        resultBtnVariant = 'primary';
        break;
      default:
        break;
    }

    return {
      title: resultTitle,
      description: resultDescription,
      btnLabel: resutlBtnLabel,
      accept: resultAccept,
      btnVariant: resultBtnVariant,
      overrideCustomizations: resultOverrideCustomizations,
    };
  }, [modalType]);

  return (
    <DeleteModal
      isOpen={modalType !== undefined}
      close={onClose}
      variant="warning"
      title={title}
      description={description}
      onDeleteSubmit={() => updateAndRefresh(accept, overrideCustomizations)}
      btnLabel={btnLabel}
      buttonVariant={btnVariant}
    />
  );
};

export interface LibraryChangesMessageData {
  displayName: string,
  downstreamBlockId: string,
  upstreamBlockId: string,
  upstreamBlockVersionSynced: number,
  isLocallyModified?: boolean,
  isContainer: boolean,
  blockType?: string | null,
  isReadyToSyncIndividually?: boolean,
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

  const [confirmationModalType, setConfirmationModalType] = useState<ConfirmationModalType>();

  const acceptChangesMutation = useAcceptLibraryBlockChanges();
  const ignoreChangesMutation = useIgnoreLibraryBlockChanges();

  const isTextWithLocalChanges = (blockData.blockType === 'html' && blockData.isLocallyModified);

  const getBody = useCallback(() => {
    if (!blockData) {
      return <Loading />;
    }
    if (blockData.isContainer) {
      return (
        <CompareContainersWidget
          upstreamBlockId={blockData.upstreamBlockId}
          downstreamBlockId={blockData.downstreamBlockId}
          isReadyToSyncIndividually={blockData.isReadyToSyncIndividually}
        />
      );
    }

    return (
      <CompareChangesWidget
        usageKey={blockData.upstreamBlockId}
        oldUsageKey={blockData.downstreamBlockId}
        oldTitle={isTextWithLocalChanges ? blockData.displayName : undefined}
        oldVersion={blockData.upstreamBlockVersionSynced || 'published'}
        newVersion="published"
        hasLocalChanges={isTextWithLocalChanges}
        showNewTitle={isTextWithLocalChanges}
      />
    );
  }, [blockData, isTextWithLocalChanges]);

  const updateAndRefresh = useCallback(async (accept: boolean, overrideCustomizations: boolean) => {
    // istanbul ignore if: this should never happen
    if (!blockData) {
      return;
    }

    const mutation = accept ? acceptChangesMutation : ignoreChangesMutation;
    const failureMsg = accept ? messages.acceptChangesFailure : messages.ignoreChangesFailure;

    try {
      await mutation.mutateAsync({
        blockId: blockData.downstreamBlockId,
        overrideCustomizations,
      });
      postChange(accept);
    } catch (e) {
      showToast(intl.formatMessage(failureMsg));
    } finally {
      closeModal();
    }
  }, [blockData]);

  const itemIcon = getItemIcon(blockData.blockType || '');

  // Build title
  const defaultTitle = intl.formatMessage(
    blockData.isContainer
      ? messages.defaultContainerTitle
      : messages.defaultComponentTitle,
    {
      itemIcon: <Icon size="lg" src={itemIcon} />,
    },
  );
  const title = blockData.displayName
    ? intl.formatMessage(messages.title, {
      blockTitle: blockData?.displayName,
      blockIcon: <Icon size="lg" src={itemIcon} />,
    })
    : defaultTitle;

  // Build aria label
  const defaultAriaLabel = intl.formatMessage(
    blockData.isContainer
      ? messages.defaultContainerTitle
      : messages.defaultComponentTitle,
    {
      itemIcon: '',
    },
  );
  const ariaLabel = blockData.displayName
    ? intl.formatMessage(messages.title, {
      blockTitle: blockData?.displayName,
      blockIcon: '',
    })
    : defaultAriaLabel;

  return (
    <ModalDialog
      isOpen={isModalOpen}
      onClose={closeModal}
      size="xl"
      title={ariaLabel}
      className="lib-preview-xblock-changes-modal"
      hasCloseButton
      isFullscreenOnMobile
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          <div className="d-flex preview-title">
            {title}
          </div>
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        {isTextWithLocalChanges && (
          <AlertMessage
            show
            variant="info"
            icon={Info}
            title={intl.formatMessage(messages.localEditsAlert)}
          />
        )}
        {getBody()}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          {isTextWithLocalChanges ? (
            <Button
              variant="tertiary"
              onClick={() => setConfirmationModalType('update')}
            >
              <FormattedMessage {...messages.updateToPublishedLibraryContentButton} />
            </Button>
          ) : (
            <LoadingButton
              onClick={() => updateAndRefresh(true, false)}
              label={intl.formatMessage(messages.acceptChangesBtn)}
            />
          )}
          {isTextWithLocalChanges ? (
            <Button
              onClick={() => setConfirmationModalType('keep')}
            >
              <FormattedMessage {...messages.keepCourseContentButton} />
            </Button>
          ) : (
            <Button
              variant="tertiary"
              onClick={() => setConfirmationModalType('ignore')}
            >
              <FormattedMessage {...messages.ignoreChangesBtn} />
            </Button>
          )}
        </ActionRow>
      </ModalDialog.Footer>
      <ConfirmationModal
        modalType={confirmationModalType}
        onClose={() => setConfirmationModalType(undefined)}
        updateAndRefresh={updateAndRefresh}
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

  const blockPayload = { locator: blockData.downstreamBlockId };

  return (
    <PreviewLibraryXBlockChanges
      blockData={blockData}
      isModalOpen={isModalOpen}
      closeModal={closeModal}
      postChange={() => sendMessageToIframe(messageTypes.completeXBlockEditing, blockPayload)}
    />
  );
};

export default IframePreviewLibraryXBlockChanges;
