// @ts-check
import React from 'react';
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
} from '@openedx/paragon/icons';
import { v4 as uuid4 } from 'uuid';
import { useDispatch } from 'react-redux';
import { useCreateLibraryBlock } from '../data/apiHooks';
import messages from './messages';
import { showToast } from '../data/slice';

const AddContentContainer = () => {
  const intl = useIntl();
  const createBlockMutation = useCreateLibraryBlock();
  const libraryId = 'lib:SampleTaxonomyOrg1:first2';
  const dispatch = useDispatch();

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
    },
  ];

  const onCreateContent = (blockType) => {
    createBlockMutation.mutateAsync({
      libraryId,
      blockType,
      definitionId: `${uuid4()}`,
    }).then(() => {
      dispatch(showToast({ toastMessage: intl.formatMessage(messages.successCreateMessage) }));
    }).catch(() => {
      dispatch(showToast({ toastMessage: intl.formatMessage(messages.errorCreateMessage) }));
    });
  };

  return (
    <Stack direction="vertical">
      <Button
        variant="outline-primary"
        disabled
        className="m-2 rounded-0"
        iconBefore={BookOpen}
      >
        {intl.formatMessage(messages.collectionButton)}
      </Button>
      <hr className="w-100 bg-gray-500" />
      {contentTypes.map((contentType) => (
        <Button
          variant="outline-primary"
          disabled={contentType.disabled}
          className="m-2 rounded-0"
          iconBefore={contentType.icon}
          onClick={() => onCreateContent(contentType.blockType)}
        >
          {contentType.name}
        </Button>
      ))}
    </Stack>
  );
};

AddContentContainer.propTypes = {};

export default AddContentContainer;
