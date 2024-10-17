import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import {
  Stack,
  Button,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import {
  Article,
  AutoAwesome,
  BookOpen,
  Create,
  ThumbUpOutline,
  Question,
  VideoCamera,
  ContentPaste,
} from '@openedx/paragon/icons';
import { v4 as uuid4 } from 'uuid';
import { useParams } from 'react-router-dom';

import { ToastContext } from '../../generic/toast-context';
import { useCopyToClipboard } from '../../generic/clipboard';
import { getCanEdit } from '../../course-unit/data/selectors';
import { useCreateLibraryBlock, useLibraryPasteClipboard, useAddComponentsToCollection } from '../data/apiHooks';
import { useLibraryContext } from '../common/context';
import { canEditComponent } from '../components/ComponentEditorModal';

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
  const { collectionId } = useParams();
  const {
    libraryId,
    openCreateCollectionModal,
    openComponentEditor,
  } = useLibraryContext();
  const createBlockMutation = useCreateLibraryBlock();
  const updateComponentsMutation = useAddComponentsToCollection(libraryId, collectionId);
  const pasteClipboardMutation = useLibraryPasteClipboard();
  const { showToast } = useContext(ToastContext);
  const canEdit = useSelector(getCanEdit);
  const { showPasteXBlock, sharedClipboardData } = useCopyToClipboard(canEdit);

  const parsePasteErrorMsg = (error: any) => {
    let errMsg: string;
    try {
      const { customAttributes: { httpErrorResponseData } } = error;
      errMsg = JSON.parse(httpErrorResponseData).block_type;
    } catch (_err) {
      errMsg = intl.formatMessage(messages.errorPasteClipboardMessage);
    }
    return errMsg;
  };

  const isBlockTypeEnabled = (blockType: string) => getConfig().LIBRARY_SUPPORTED_BLOCKS.includes(blockType);

  const collectionButtonData = {
    name: intl.formatMessage(messages.collectionButton),
    disabled: false,
    icon: BookOpen,
    blockType: 'collection',
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

  const onPaste = () => {
    if (!isBlockTypeEnabled(sharedClipboardData.content?.blockType)) {
      showToast(intl.formatMessage(messages.unsupportedBlockPasteClipboardMessage));
      return;
    }
    pasteClipboardMutation.mutateAsync({
      libraryId,
      blockId: `${uuid4()}`,
    }).then(() => {
      showToast(intl.formatMessage(messages.successPasteClipboardMessage));
    }).catch((error) => {
      showToast(parsePasteErrorMsg(error));
    });
  };

  const onCreateBlock = (blockType: string) => {
    createBlockMutation.mutateAsync({
      libraryId,
      blockType,
      definitionId: `${uuid4()}`,
    }).then((data) => {
      const hasEditor = canEditComponent(data.id);
      updateComponentsMutation.mutateAsync([data.id]).catch(() => {
        showToast(intl.formatMessage(messages.errorAssociateComponentMessage));
      });
      if (hasEditor) {
        openComponentEditor(data.id);
      } else {
        // We can't start editing this right away so just show a toast message:
        showToast(intl.formatMessage(messages.successCreateMessage));
      }
    }).catch(() => {
      showToast(intl.formatMessage(messages.errorCreateMessage));
    });
  };

  const onCreateContent = (blockType: string) => {
    if (blockType === 'paste') {
      onPaste();
    } else if (blockType === 'collection') {
      openCreateCollectionModal();
    } else {
      onCreateBlock(blockType);
    }
  };

  if (pasteClipboardMutation.isLoading) {
    showToast(intl.formatMessage(messages.pastingClipboardMessage));
  }

  return (
    <Stack direction="vertical">
      {!collectionId && <AddContentButton contentType={collectionButtonData} onCreateContent={onCreateContent} />}
      <hr className="w-100 bg-gray-500" />
      {contentTypes.map((contentType) => (
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
