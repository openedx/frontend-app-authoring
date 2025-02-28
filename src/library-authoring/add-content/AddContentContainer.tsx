import React, { useContext, useMemo } from 'react';
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
import {
  useCreateLibraryBlock,
  useLibraryPasteClipboard,
  useAddComponentsToCollection,
  useBlockTypesMetadata,
} from '../data/apiHooks';
import { useLibraryContext } from '../common/context/LibraryContext';
import { PickLibraryContentModal } from './PickLibraryContentModal';
import { blockTypes } from '../../editors/data/constants/app';

import messages from './messages';
import type { BlockTypeMetadata } from '../data/api';

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
  advancedBlocks: Record<string, BlockTypeMetadata>,
  isBlockTypeEnabled: (blockType) => boolean,
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
  advancedBlocks,
  isBlockTypeEnabled,
}: AddAdvancedContentViewProps) => {
  const intl = useIntl();
  return (
    <>
      <div className="d-flex">
        <Button variant="tertiary" iconBefore={KeyboardBackspace} onClick={closeAdvancedList}>
          {intl.formatMessage(messages.backToAddContentListButton)}
        </Button>
      </div>
      {Object.keys(advancedBlocks).map((blockType) => (
        isBlockTypeEnabled(blockType) ? (
          <AddContentButton
            key={`add-content-${blockType}`}
            contentType={{
              name: advancedBlocks[blockType].displayName,
              blockType,
              icon: AutoAwesome,
              disabled: false,
            }}
            onCreateContent={onCreateContent}
          />
        ) : null
      ))}
    </>
  );
};

export const parseErrorMsg = (
  intl,
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

const AddContentContainer = () => {
  const intl = useIntl();
  const {
    libraryId,
    collectionId,
    openCreateCollectionModal,
    openComponentEditor,
  } = useLibraryContext();
  const updateComponentsMutation = useAddComponentsToCollection(libraryId, collectionId);
  const createBlockMutation = useCreateLibraryBlock();
  const pasteClipboardMutation = useLibraryPasteClipboard();
  const { showToast } = useContext(ToastContext);
  const canEdit = useSelector(getCanEdit);
  const { sharedClipboardData } = useCopyToClipboard(canEdit);
  const { showPasteXBlock } = useCopyToClipboard(canEdit);

  const [isAddLibraryContentModalOpen, showAddLibraryContentModal, closeAddLibraryContentModal] = useToggle();
  const [isAdvancedListOpen, showAdvancedList, closeAdvancedList] = useToggle();

  // We use block types data from backend to verify the enabled basic and advanced blocks.
  // Also, we use that data to get the translated display name of the block.
  const { data: blockTypesDataList } = useBlockTypesMetadata(libraryId);
  const blockTypesData = useMemo(() => blockTypesDataList?.reduce((acc, block) => {
    acc[block.blockType] = block;
    return acc;
  }, {}), [blockTypesDataList]);

  const isBlockTypeEnabled = (blockType: string) => !getConfig().LIBRARY_UNSUPPORTED_BLOCKS.includes(blockType);

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
  ];

  const isBasicBlock = (blockType: string) => contentTypes.some(
    content => content.blockType === blockType,
  );

  const advancedBlocks = useMemo(() => (blockTypesData ? Object.fromEntries(
    Object.entries(blockTypesData).filter(([key]) => !isBasicBlock(key)),
  ) : {}), [blockTypesData]) as Record<string, BlockTypeMetadata>;

  // Include the 'Advanced / Other' button if there are enabled advanced Xblocks
  if (Object.keys(advancedBlocks).length > 0) {
    const pasteButton = {
      name: intl.formatMessage(messages.otherTypeButton),
      disabled: false,
      icon: AutoAwesome,
      blockType: 'advancedXBlock',
    };
    contentTypes.push(pasteButton);
  }

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
        intl,
        error,
        messages.errorPasteClipboardMessageWithDetail,
        messages.errorPasteClipboardMessage,
      ));
    });
  };
  const onCreateBlock = (blockType: string) => {
    const suportedEditorTypes = Object.values(blockTypes);
    if (suportedEditorTypes.includes(blockType)) {
      // linkComponent on editor close.
      openComponentEditor('', (data) => data && linkComponent(data.id), blockType);
    } else {
      createBlockMutation.mutateAsync({
        libraryId,
        blockType,
        definitionId: `${uuid4()}`,
      }).then((data) => {
        // We can't start editing this right away so just show a toast message:
        showToast(intl.formatMessage(messages.successCreateMessage));
        linkComponent(data.id);
      }).catch((error) => {
        showToast(parseErrorMsg(
          intl,
          error,
          messages.errorCreateMessageWithDetail,
          messages.errorCreateMessage,
        ));
      });
    }
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
          advancedBlocks={advancedBlocks}
          isBlockTypeEnabled={isBlockTypeEnabled}
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
