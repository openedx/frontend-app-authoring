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
  AutoAwesome,
  KeyboardBackspace,
} from '@openedx/paragon/icons';
import { v4 as uuid4 } from 'uuid';

import { ToastContext } from '../../generic/toast-context';
import { getItemIcon } from '../../generic/block-type-utils';
import { useClipboard } from '../../generic/clipboard';
import { getCanEdit } from '../../course-unit/data/selectors';
import {
  useCreateLibraryBlock,
  useLibraryPasteClipboard,
  useBlockTypesMetadata,
  useAddItemsToCollection,
  useAddComponentsToContainer,
} from '../data/apiHooks';
import { useLibraryContext } from '../common/context/LibraryContext';
import { PickLibraryContentModal } from './PickLibraryContentModal';
import { blockTypes } from '../../editors/data/constants/app';

import { ContentType as LibraryContentTypes } from '../routes';
import genericMessages from '../generic/messages';
import messages from './messages';
import type { BlockTypeMetadata } from '../data/api';
import { getContainerTypeFromId, ContainerType } from '../../generic/key-utils';

type ContentType = {
  name: string,
  disabled: boolean,
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
  const {
    collectionId,
    componentPicker,
    unitId,
  } = useLibraryContext();
  let upstreamContainerType: ContainerType | undefined;
  if (unitId) {
    upstreamContainerType = getContainerTypeFromId(unitId);
  }

  const collectionButtonData = {
    name: intl.formatMessage(messages.collectionButton),
    disabled: false,
    blockType: 'collection',
  };

  const unitButtonData = {
    name: intl.formatMessage(messages.unitButton),
    disabled: false,
    blockType: 'vertical',
  };

  const libraryContentButtonData = {
    name: intl.formatMessage(messages.libraryContentButton),
    disabled: false,
    blockType: 'libraryContent',
  };

  const extraFilter = unitId ? ['NOT block_type = "unit"', 'NOT type = "collections"'] : undefined;
  const visibleTabs = unitId ? [LibraryContentTypes.components] : undefined;

  return (
    <>
      {(collectionId || unitId) && componentPicker && (
        /// Show the "Add Library Content" button for units and collections
        <>
          <AddContentButton contentType={libraryContentButtonData} onCreateContent={onCreateContent} />
          <PickLibraryContentModal
            isOpen={isAddLibraryContentModalOpen}
            onClose={closeAddLibraryContentModal}
            extraFilter={extraFilter}
            visibleTabs={visibleTabs}
          />
        </>
      )}
      {!collectionId && !unitId && (
        // Doesn't show the "Collection" button if we are in a unit or collection
        <AddContentButton contentType={collectionButtonData} onCreateContent={onCreateContent} />
      )}
      {upstreamContainerType !== ContainerType.Unit && (
        // Doesn't show the "Unit" button if we are in a unit
        <AddContentButton contentType={unitButtonData} onCreateContent={onCreateContent} />
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
  intl,
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
    openCreateCollectionModal,
    openCreateUnitModal,
    openComponentEditor,
    unitId,
  } = useLibraryContext();
  const addComponentsToCollectionMutation = useAddItemsToCollection(libraryId, collectionId);
  const addComponentsToContainerMutation = useAddComponentsToContainer(unitId);
  const createBlockMutation = useCreateLibraryBlock();
  const pasteClipboardMutation = useLibraryPasteClipboard();
  const { showToast } = useContext(ToastContext);
  const canEdit = useSelector(getCanEdit);
  const { showPasteUnit, showPasteXBlock, sharedClipboardData } = useClipboard(canEdit);

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
  if (showPasteXBlock || showPasteUnit) {
    const pasteButton = {
      name: intl.formatMessage(messages.pasteButton),
      disabled: false,
      blockType: 'paste',
    };
    contentTypes.push(pasteButton);
  }

  const linkComponent = (opaqueKey: string) => {
    if (collectionId) {
      addComponentsToCollectionMutation.mutateAsync([opaqueKey]).catch(() => {
        showToast(intl.formatMessage(genericMessages.manageCollectionsFailed));
      });
    }
    if (unitId) {
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
    } else if (blockType === 'vertical') {
      openCreateUnitModal();
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

export default AddContent;
