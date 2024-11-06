import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  xblockIframeTitle: {
    id: 'course-authoring.course-unit.xblock.iframe.title',
    defaultMessage: 'Course unit iframe',
  },
  xblockIframeLabel: {
    id: 'course-authoring.course-unit.xblock.iframe.label',
    defaultMessage: '{xblockCount} xBlocks inside the frame',
  },
  editModalIframeTitle: {
    id: 'course-authoring.course-unit.modal.edit.iframe.title',
    defaultMessage: 'Xblock Edit Modal',
    description: 'Title for the iframe that is used to edit an xblock',
  },
});

export default messages;
