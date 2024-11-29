import React, { useContext } from 'react';
import type { MessageDescriptor } from 'react-intl';
import { useSelector } from 'react-redux';
import {
  Stack,
  Button,
  useToggle,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import {
  Article,
  AutoAwesome,
  BookOpen,
  Create,
  Folder,
  ThumbUpOutline,
  Question,
  VideoCamera,
  ContentPaste,
} from '@openedx/paragon/icons';
import { v4 as uuid4 } from 'uuid';

import { ToastContext } from '../../generic/toast-context';
import { useCopyToClipboard } from '../../generic/clipboard';
import { getCanEdit } from '../../course-unit/data/selectors';
import { useCreateLibraryBlock, useLibraryPasteClipboard, useAddComponentsToCollection } from '../data/apiHooks';
import { useLibraryContext } from '../common/context/LibraryContext';
import { canEditComponent } from '../components/ComponentEditorModal';
import { PickLibraryContentModal } from './PickLibraryContentModal';

import messages from './messages';

type ContentType = {
  name: string,
  disabled: boolean,
  icon: React.ComponentType,
  blockType: string,
};

type AddContentButtonProps = {
  contentType: ContentType,
  onCreateContent: (blockType: string) => void,
};

const AddContentButton = ({ contentType, onCreateContent } : AddContentButtonProps) => {
  const {
    name,
    disabled,
    icon,
    blockType,
  } = contentType;
  return (
    <Button
      variant="outline-primary"
      disabled={disabled}
      className="m-2"
      iconBefore={icon}
      onClick={() => onCreateContent(blockType)}
    >
      {name}
    </Button>
  );
};

const AddContentContainer = () => {
  const intl = useIntl();
  const {
    libraryId,
    collectionId,
    openCreateCollectionModal,
    openComponentEditor,
    componentPicker,
  } = useLibraryContext();
  const createBlockMutation = useCreateLibraryBlock();
  const updateComponentsMutation = useAddComponentsToCollection(libraryId, collectionId);
  const pasteClipboardMutation = useLibraryPasteClipboard();
  const { showToast } = useContext(ToastContext);
  const canEdit = useSelector(getCanEdit);
  const { showPasteXBlock, sharedClipboardData } = useCopyToClipboard(canEdit);

  const [isAddLibraryContentModalOpen, showAddLibraryContentModal, closeAddLibraryContentModal] = useToggle();

  const parseErrorMsg = (
    error: any,
    detailedMessage: MessageDescriptor,
    defaultMessage: MessageDescriptor,
  ) => {
    try {
      const { response: { data } } = error;
      const detail = data && (Array.isArray(data) ? data.join() : String(data));
      if (detail) {
        return intl.formatMessage(detailedMessage, { detail });
      }
    } catch (_err) {
      // ignore
    }
    return intl.formatMessage(defaultMessage);
  };

  const isBlockTypeEnabled = (blockType: string) => getConfig().LIBRARY_SUPPORTED_BLOCKS.includes(blockType);

  const collectionButtonData = {
    name: intl.formatMessage(messages.collectionButton),
    disabled: false,
    icon: BookOpen,
    blockType: 'collection',
  };

  const libraryContentButtonData = {
    name: intl.formatMessage(messages.libraryContentButton),
    disabled: false,
    icon: Folder,
    blockType: 'libraryContent',
  };

  const contentTypes = [
    {
      name: intl.formatMessage(messages.textTypeButton),
      disabled: !isBlockTypeEnabled('html'),
      icon: Article,
      blockType: 'html',
    },
    {
      name: intl.formatMessage(messages.problemTypeButton),
      disabled: !isBlockTypeEnabled('problem'),
      icon: Question,
      blockType: 'problem',
    },
    {
      name: intl.formatMessage(messages.openResponseTypeButton),
      disabled: !isBlockTypeEnabled('openassessment'),
      icon: Create,
      blockType: 'openassessment',
    },
    {
      name: intl.formatMessage(messages.dragDropTypeButton),
      disabled: !isBlockTypeEnabled('drag-and-drop-v2'),
      icon: ThumbUpOutline,
      blockType: 'drag-and-drop-v2',
    },
    {
      name: intl.formatMessage(messages.videoTypeButton),
      disabled: !isBlockTypeEnabled('video'),
      icon: VideoCamera,
      blockType: 'video',
    },
    {
      name: intl.formatMessage(messages.otherTypeButton),
      disabled: !isBlockTypeEnabled('other'),
      icon: AutoAwesome,
      blockType: 'other', // This block doesn't exist yet.
    },
  ];

  // Include the 'Paste from Clipboard' button if there is an Xblock in the clipboard
  // that can be pasted
  if (showPasteXBlock) {
    const pasteButton = {
      name: intl.formatMessage(messages.pasteButton),
      disabled: false,
      icon: ContentPaste,
      blockType: 'paste',
    };
    contentTypes.push(pasteButton);
  }

  const linkComponent = (usageKey: string) => {
    updateComponentsMutation.mutateAsync([usageKey]).catch(() => {
      showToast(intl.formatMessage(messages.errorAssociateComponentMessage));
    });
  };

  const onPaste = () => {
    if (!isBlockTypeEnabled(sharedClipboardData.content?.blockType)) {
      showToast(intl.formatMessage(messages.unsupportedBlockPasteClipboardMessage));
      return;
    }
    pasteClipboardMutation.mutateAsync({
      libraryId,
      blockId: `${uuid4()}`,
    }).then((data) => {
      linkComponent(data.id);
      showToast(intl.formatMessage(messages.successPasteClipboardMessage));
    }).catch((error) => {
      showToast(parseErrorMsg(
        error,
        messages.errorPasteClipboardMessageWithDetail,
        messages.errorPasteClipboardMessage,
      ));
    });
  };

  const onCreateBlock = (blockType: string) => {
    createBlockMutation.mutateAsync({
      libraryId,
      blockType,
      definitionId: `${uuid4()}`,
    }).then((data) => {
      const hasEditor = canEditComponent(data.id);
      if (hasEditor) {
        // linkComponent on editor close.
        openComponentEditor(data.id, () => linkComponent(data.id));
      } else {
        // We can't start editing this right away so just show a toast message:
        showToast(intl.formatMessage(messages.successCreateMessage));
        linkComponent(data.id);
      }
    }).catch((error) => {
      showToast(parseErrorMsg(
        error,
        messages.errorCreateMessageWithDetail,
        messages.errorCreateMessage,
      ));
    });
  };

  const onCreateContent = (blockType: string) => {
    if (blockType === 'paste') {
      onPaste();
    } else if (blockType === 'collection') {
      openCreateCollectionModal();
    } else if (blockType === 'libraryContent') {
      showAddLibraryContentModal();
    } else {
      onCreateBlock(blockType);
    }
  };

  /* istanbul ignore next */
  if (pasteClipboardMutation.isLoading) {
    showToast(intl.formatMessage(messages.pastingClipboardMessage));
  }

  return (
    <Stack direction="vertical">
      {collectionId ? (
        componentPicker && (
          <>
            <AddContentButton contentType={libraryContentButtonData} onCreateContent={onCreateContent} />
            <PickLibraryContentModal
              isOpen={isAddLibraryContentModalOpen}
              onClose={closeAddLibraryContentModal}
            />
          </>
        )
      ) : (
        <AddContentButton contentType={collectionButtonData} onCreateContent={onCreateContent} />
      )}
      <hr className="w-100 bg-gray-500" />
      {/* Note: for MVP we are hiding the unuspported types, not just disabling them. */}
      {contentTypes.filter(ct => !ct.disabled).map((contentType) => (
        <AddContentButton
          key={`add-content-${contentType.blockType}`}
          contentType={contentType}
          onCreateContent={onCreateContent}
        />
      ))}
    </Stack>
  );
};

export default AddContentContainer;
