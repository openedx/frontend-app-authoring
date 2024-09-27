import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import {
  Stack,
  Button,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
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
import { useCreateLibraryBlock, useLibraryPasteClipboard, useUpdateCollectionComponents } from '../data/apiHooks';
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
  const { libraryId, collectionId } = useParams();
  const createBlockMutation = useCreateLibraryBlock();
  const updateComponentsMutation = useUpdateCollectionComponents(libraryId, collectionId);
  const pasteClipboardMutation = useLibraryPasteClipboard();
  const { showToast } = useContext(ToastContext);
  const canEdit = useSelector(getCanEdit);
  const { showPasteXBlock } = useCopyToClipboard(canEdit);
  const {
    openCreateCollectionModal,
    openComponentEditor,
  } = useLibraryContext();

  const collectionButtonData = {
    name: intl.formatMessage(messages.collectionButton),
    disabled: false,
    icon: BookOpen,
    blockType: 'collection',
  };
  const contentTypes = [
    {
      name: intl.formatMessage(messages.textTypeButton),
      disabled: false,
      icon: Article,
      blockType: 'html',
    },
    {
      name: intl.formatMessage(messages.problemTypeButton),
      disabled: false,
      icon: Question,
      blockType: 'problem',
    },
    {
      name: intl.formatMessage(messages.openResponseTypeButton),
      disabled: false,
      icon: Create,
      blockType: 'openassessment',
    },
    {
      name: intl.formatMessage(messages.dragDropTypeButton),
      disabled: false,
      icon: ThumbUpOutline,
      blockType: 'drag-and-drop-v2',
    },
    {
      name: intl.formatMessage(messages.videoTypeButton),
      disabled: false,
      icon: VideoCamera,
      blockType: 'video',
    },
    {
      name: intl.formatMessage(messages.otherTypeButton),
      disabled: true,
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

  const onCreateContent = (blockType: string) => {
    if (libraryId) {
      if (blockType === 'paste') {
        pasteClipboardMutation.mutateAsync({
          libraryId,
          blockId: `${uuid4()}`,
        }).then(() => {
          showToast(intl.formatMessage(messages.successPasteClipboardMessage));
        }).catch(() => {
          showToast(intl.formatMessage(messages.errorPasteClipboardMessage));
        });
      } else if (blockType === 'collection') {
        openCreateCollectionModal();
      } else {
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
      }
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
