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
  KeyboardBackspace,
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

type AddContentViewProps = {
  contentTypes: ContentType[],
  onCreateContent: (blockType: string) => void,
  isAddLibraryContentModalOpen: boolean,
  closeAddLibraryContentModal: () => void,
};

type AddAdvancedContentViewProps = {
  closeAdvancedList: () => void,
  onCreateContent: (blockType: string) => void,
  isBlockTypeEnabled: (blockType: string) => boolean,
  isBasicBlock: (blockType: string) => boolean,
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

const AddContentView = ({
  contentTypes,
  onCreateContent,
  isAddLibraryContentModalOpen,
  closeAddLibraryContentModal,
}: AddContentViewProps) => {
  const intl = useIntl();
  const {
    collectionId,
    componentPicker,
  } = useLibraryContext();

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

  return (
    <>
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
    </>
  );
};

const AddAdvancedContentView = ({
  closeAdvancedList,
  onCreateContent,
  isBlockTypeEnabled,
  isBasicBlock,
}: AddAdvancedContentViewProps) => {
  const intl = useIntl();
  // We use block types data from backend to verify if the blocks
  // in `LIBRARY_ADVANCED_BLOCKS` exists. This is to avoid show a non-existent
  // block in the advanced blocks list.
  // Also, we use that data to get the translated display name of the block.
  const { blockTypesData } = useLibraryContext();
  const advancedBlocks = getConfig().LIBRARY_ADVANCED_BLOCKS.filter((block) => {
    if (!blockTypesData
        || !Object.prototype.hasOwnProperty.call(blockTypesData, block)
        || !isBlockTypeEnabled(block)
        || isBasicBlock(block)) {
      return false;
    }
    return true;
  });

  return (
    <>
      <div className="d-flex">
        <Button variant="tertiary" iconBefore={KeyboardBackspace} onClick={closeAdvancedList}>
          {intl.formatMessage(messages.backToAddContentListButton)}
        </Button>
      </div>
      {advancedBlocks.map((blockType) => (
        <AddContentButton
          key={`add-content-${blockType}`}
          contentType={{
            name: blockTypesData ? blockTypesData[blockType].displayName : blockType,
            blockType,
            icon: AutoAwesome,
            disabled: false,
          }}
          onCreateContent={onCreateContent}
        />
      ))}
    </>
  );
};

const AddContentContainer = () => {
  const intl = useIntl();
  const {
    libraryId,
    collectionId,
    openCreateCollectionModal,
    openComponentEditor,
  } = useLibraryContext();
  const createBlockMutation = useCreateLibraryBlock();
  const updateComponentsMutation = useAddComponentsToCollection(libraryId, collectionId);
  const pasteClipboardMutation = useLibraryPasteClipboard();
  const { showToast } = useContext(ToastContext);
  const canEdit = useSelector(getCanEdit);
  const { sharedClipboardData } = useCopyToClipboard(canEdit);
  const { showPasteXBlock } = useCopyToClipboard(canEdit);

  const [isAddLibraryContentModalOpen, showAddLibraryContentModal, closeAddLibraryContentModal] = useToggle();
  const [isAdvancedListOpen, showAdvancedList, closeAdvancedList] = useToggle();

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

  const isAdvancedEnabled = () => {
    const blocks = getConfig().LIBRARY_ADVANCED_BLOCKS;
    return Array.isArray(blocks) && blocks.length > 0;
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
      disabled: !isAdvancedEnabled(),
      icon: AutoAwesome,
      blockType: 'advancedXBlock',
    },
  ];

  const isBasicBlock = (blockType: string) => contentTypes.some(
    content => content.blockType === blockType,
  );

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
    } else if (blockType === 'advancedXBlock') {
      showAdvancedList();
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
      {isAdvancedListOpen ? (
        <AddAdvancedContentView
          closeAdvancedList={closeAdvancedList}
          onCreateContent={onCreateContent}
          isBlockTypeEnabled={isBlockTypeEnabled}
          isBasicBlock={isBasicBlock}
        />
      ) : (
        <AddContentView
          contentTypes={contentTypes}
          onCreateContent={onCreateContent}
          isAddLibraryContentModalOpen={isAddLibraryContentModalOpen}
          closeAddLibraryContentModal={closeAddLibraryContentModal}
        />
      )}
    </Stack>
  );
};

export default AddContentContainer;
