import { ActionRow, Button, ModalDialog, useToggle } from "@openedx/paragon";
import { useCallback } from "react";
import { useEventListener } from "../../generic/hooks";
import { messageTypes } from "../constants";

interface LibraryChangesMessageData {
  downstreamBlockId: string,
  courseAuthoringMfeUrl: string,
  upstreamBlockId: string,
  upstreamBlockVersionSynced: number,
}

const PreviewLibraryXBlockChanges = () => {
  const [isModalOpen, openModal, closeModal] = useToggle(false);

  const receiveMessage = useCallback(({ data }: { data: {
    payload: LibraryChangesMessageData;
    type: string;
  } }) => {
    const { payload, type } = data;

    if (type === messageTypes.showXBlockLibraryChangesPreview) {
      openModal();
    }
  }, [openModal]);

  useEventListener('message', receiveMessage);

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
          Preview changes
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        Preview Body
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <Button
          >
            Accept changes
          </Button>
          <Button
            variant="tertiary"
          >
            Ignore changes
          </Button>
          <ModalDialog.CloseButton variant="tertiary">
            Cancel
          </ModalDialog.CloseButton>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  )
}

export default PreviewLibraryXBlockChanges;
