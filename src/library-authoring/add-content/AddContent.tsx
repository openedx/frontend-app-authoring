import React, { useContext, useMemo } from 'react';
import type { IntlShape, MessageDescriptor } from 'react-intl';
import { useSelector } from 'react-redux';
import {
  Stack,
  Button,
  useToggle,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import {
  AutoAwesome,
  KeyboardBackspace,
} from '@openedx/paragon/icons';
import { v4 as uuid4 } from 'uuid';

import { ToastContext } from '@src/generic/toast-context';
import { getItemIcon } from '@src/generic/block-type-utils';
import { useClipboard } from '@src/generic/clipboard';
import { getCanEdit } from '@src/course-unit/data/selectors';
import { blockTypes } from '@src/editors/data/constants/app';
import { ContainerType } from '@src/generic/key-utils';

import {
  useCreateLibraryBlock,
  useLibraryPasteClipboard,
  useBlockTypesMetadata,
  useAddItemsToCollection,
  useAddItemsToContainer,
} from '../data/apiHooks';
import { useLibraryContext } from '../common/context/LibraryContext';
import { PickLibraryContentModal } from './PickLibraryContentModal';

import { useLibraryRoutes } from '../routes';
import genericMessages from '../generic/messages';
import { messages, getContentMessages } from './messages';
import type { BlockTypeMetadata } from '../data/api';

type ContentType = {
  name: string,
  disabled?: boolean,
  icon?: React.ComponentType,
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
  isBlockTypeEnabled: (blockType: string) => boolean,
};

const AddContentButton = ({ contentType, onCreateContent } : AddContentButtonProps) => {
  const {
    name,
    disabled = false,
    icon,
    blockType,
  } = contentType;
  return (
    <Button
      variant="outline-primary"
      disabled={disabled}
      className="m-2"
      iconBefore={icon || getItemIcon(blockType)}
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
  const { componentPicker } = useLibraryContext();
  const {
    insideCollection,
    insideUnit,
    insideSection,
    insideSubsection,
  } = useLibraryRoutes();

  const contentMessages = useMemo(() => (
    getContentMessages(insideSection, insideSubsection, insideUnit)
  ), [insideSection, insideSubsection, insideUnit]);

  const collectionButton = (
    <AddContentButton
      key="collection"
      contentType={{
        name: intl.formatMessage(contentMessages.collectionButton),
        blockType: 'collection',
      }}
      onCreateContent={onCreateContent}
    />
  );

  const unitButton = (
    <AddContentButton
      key="unit"
      contentType={{
        name: intl.formatMessage(contentMessages.unitButton),
        blockType: 'unit',
      }}
      onCreateContent={onCreateContent}
    />
  );

  const sectionButton = (
    <AddContentButton
      key="section"
      contentType={{
        name: intl.formatMessage(contentMessages.sectionButton),
        blockType: 'section',
      }}
      onCreateContent={onCreateContent}
    />
  );

  const subsectionButton = (
    <AddContentButton
      key="subsection"
      contentType={{
        name: intl.formatMessage(contentMessages.subsectionButton),
        blockType: 'subsection',
      }}
      onCreateContent={onCreateContent}
    />
  );

  let existingContentIcon = getItemIcon('libraryContent');

  if (insideSection) {
    existingContentIcon = getItemIcon('subsection');
  } else if (insideSubsection) {
    existingContentIcon = getItemIcon('unit');
  }

  const existingContentButton = (
    <AddContentButton
      key="libraryContent"
      contentType={{
        name: intl.formatMessage(contentMessages.libraryContentButton),
        blockType: 'libraryContent',
        icon: existingContentIcon,
      }}
      onCreateContent={onCreateContent}
    />
  );

  /* Note: for MVP we are hiding the unsupported types, not just disabling them. */
  const componentButtons = contentTypes.filter(ct => !ct.disabled).map((contentType) => (
    <AddContentButton
      key={`add-content-${contentType.blockType}`}
      contentType={contentType}
      onCreateContent={onCreateContent}
    />
  ));
  const separator = (
    <hr className="w-100 bg-gray-500" />
  );

  // Extract the paste button for use on Section and Subsection
  const pasteButton = componentButtons.find(ct => ct.key === 'add-content-paste');

  /** List buttons that should be displayed based on current path */
  const visibleButtons = useMemo(() => {
    if (insideCollection) {
      // except for add collection button, show everything.
      return [
        existingContentButton,
        sectionButton,
        subsectionButton,
        unitButton,
        separator,
        ...componentButtons,
      ];
    }
    if (insideUnit) {
      // Only show existing content button + component buttons
      return [
        existingContentButton,
        separator,
        ...componentButtons,
      ];
    }
    if (insideSection) {
      // Only allow adding subsections
      return [
        existingContentButton,
        subsectionButton,
        pasteButton,
      ];
    }
    if (insideSubsection) {
      // Only allow adding units
      return [
        existingContentButton,
        unitButton,
        pasteButton,
      ];
    }
    // except for existing content, show everything.
    return [
      collectionButton,
      sectionButton,
      subsectionButton,
      unitButton,
      separator,
      ...componentButtons,
    ];
  }, [componentButtons, insideCollection, insideUnit, insideSection, insideSubsection]);

  return (
    <>
      {visibleButtons}
      {componentPicker && visibleButtons.includes(existingContentButton) && (
        <PickLibraryContentModal
          isOpen={isAddLibraryContentModalOpen}
          onClose={closeAddLibraryContentModal}
        />
      )}
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
  // Sort block types alphabetically by default display name
  const sortedBlockTypes = Object.keys(advancedBlocks).sort((typeA, typeB) => (
    advancedBlocks[typeA].displayName.localeCompare(advancedBlocks[typeB].displayName)
  ));
  return (
    <>
      <div className="d-flex">
        <Button variant="tertiary" iconBefore={KeyboardBackspace} onClick={closeAdvancedList}>
          {intl.formatMessage(messages.backToAddContentListButton)}
        </Button>
      </div>
      {sortedBlockTypes.map((blockType) => (
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
  intl: IntlShape,
  error: any,
  detailedMessage: MessageDescriptor,
  defaultMessage: MessageDescriptor,
) => {
  try {
    const { response: { data } } = error;
    let detail = '';
    if (Array.isArray(data)) {
      detail = data.join(', ');
    } else if (typeof data === 'string') {
      /* istanbul ignore next */
      detail = data.substring(0, 400); // In case this is a giant HTML response, only show the first little bit.
    } else if (data) {
      detail = JSON.stringify(data);
    }
    if (detail) {
      return intl.formatMessage(detailedMessage, { detail });
    }
  } catch (_err) {
    // ignore
  }
  return intl.formatMessage(defaultMessage);
};

const AddContent = () => {
  const intl = useIntl();
  const {
    libraryId,
    collectionId,
    containerId,
    openCreateCollectionModal,
    setCreateContainerModalType,
    openComponentEditor,
  } = useLibraryContext();
  const {
    insideCollection,
    insideUnit,
    insideSubsection,
    insideSection,
  } = useLibraryRoutes();
  const addComponentsToCollectionMutation = useAddItemsToCollection(libraryId, collectionId);
  const addComponentsToContainerMutation = useAddItemsToContainer(containerId);
  const createBlockMutation = useCreateLibraryBlock();
  const pasteClipboardMutation = useLibraryPasteClipboard();
  const { showToast } = useContext(ToastContext);
  const canEdit = useSelector(getCanEdit);
  const {
    showPasteUnit,
    showPasteSubsection,
    showPasteXBlock,
    isPasteable,
    sharedClipboardData,
  } = useClipboard(canEdit);

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
      blockType: 'html',
    },
    {
      name: intl.formatMessage(messages.problemTypeButton),
      disabled: !isBlockTypeEnabled('problem'),
      blockType: 'problem',
    },
    {
      name: intl.formatMessage(messages.openResponseTypeButton),
      disabled: !isBlockTypeEnabled('openassessment'),
      blockType: 'openassessment',
    },
    {
      name: intl.formatMessage(messages.dragDropTypeButton),
      disabled: !isBlockTypeEnabled('drag-and-drop-v2'),
      blockType: 'drag-and-drop-v2',
    },
    {
      name: intl.formatMessage(messages.videoTypeButton),
      disabled: !isBlockTypeEnabled('video'),
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
    const advancedButton = {
      name: intl.formatMessage(messages.otherTypeButton),
      disabled: false,
      icon: AutoAwesome,
      blockType: 'advancedXBlock',
    };
    contentTypes.push(advancedButton);
  }

  // Include the 'Paste from Clipboard' button if there is an Xblock in the clipboard
  // that can be pasted
  const showPasteButton = false
    // We are not in a unit, subsection, or section, so we can paste any XBlock
    || (!(insideUnit || insideSubsection || insideSection) && isPasteable)
    // We are in a unit, so we can paste only components
    || (insideUnit && showPasteXBlock)
    // We are in a subsection, so we can only paste units
    || (insideSubsection && showPasteUnit)
    // We are in a section, so we can only paste subsections
    || (insideSection && showPasteSubsection);

  if (showPasteButton) {
    const pasteButton = {
      name: intl.formatMessage(messages.pasteButton),
      disabled: false,
      blockType: 'paste',
    };
    contentTypes.push(pasteButton);
  }

  const linkComponent = (opaqueKey: string) => {
    if (collectionId && insideCollection) {
      addComponentsToCollectionMutation.mutateAsync([opaqueKey]).catch(() => {
        showToast(intl.formatMessage(genericMessages.manageCollectionsFailed));
      });
    }
    if (containerId && (insideUnit || insideSubsection || insideSection)) {
      addComponentsToContainerMutation.mutateAsync([opaqueKey]).catch(() => {
        showToast(intl.formatMessage(messages.errorAssociateComponentToContainerMessage));
      });
    }
  };

  const onPaste = () => {
    const clipboardBlockType = sharedClipboardData?.content?.blockType;

    // istanbul ignore if: this should never happen
    if (!clipboardBlockType) {
      return;
    }

    if (!isBlockTypeEnabled(clipboardBlockType)) {
      showToast(intl.formatMessage(messages.unsupportedBlockPasteClipboardMessage));
      return;
    }
    pasteClipboardMutation.mutateAsync({
      libraryId,
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
    } else if ([
      ContainerType.Unit,
      ContainerType.Subsection,
      ContainerType.Section,
    ].includes(blockType as ContainerType)) {
      setCreateContainerModalType(blockType as ContainerType);
    } else {
      onCreateBlock(blockType);
    }
  };

  /* istanbul ignore next */
  if (pasteClipboardMutation.isPending) {
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

export default AddContent;
