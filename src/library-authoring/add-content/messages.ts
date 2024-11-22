import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  collectionButton: {
    id: 'course-authoring.library-authoring.add-content.buttons.collection',
    defaultMessage: 'Collection',
    description: 'Content of button to create a Collection.',
  },
  libraryContentButton: {
    id: 'course-authoring.library-authoring.add-content.buttons.library-content',
    defaultMessage: 'Existing Library Content',
    description: 'Content of button to add existing library content to a collection.',
  },
  addToCollectionButton: {
    id: 'course-authoring.library-authoring.add-content.buttons.library-content.add-to-collection',
    defaultMessage: 'Add to Collection',
    description: 'Button to add library content to a collection.',
  },
  selectedComponents: {
    id: 'course-authoring.library-authoring.add-content.selected-components',
    defaultMessage: '{count, plural, one {# Selected Component} other {# Selected Components}}',
    description: 'Title for selected components in library.',
  },
  textTypeButton: {
    id: 'course-authoring.library-authoring.add-content.buttons.types.text',
    defaultMessage: 'Text',
    description: 'Content of button to create a Text component.',
  },
  problemTypeButton: {
    id: 'course-authoring.library-authoring.add-content.buttons.types.problem',
    defaultMessage: 'Problem',
    description: 'Content of button to create a Problem component.',
  },
  openResponseTypeButton: {
    id: 'course-authoring.library-authoring.add-content.buttons.types.open-response',
    defaultMessage: 'Open Reponse',
    description: 'Content of button to create a Open Response component.',
  },
  dragDropTypeButton: {
    id: 'course-authoring.library-authoring.add-content.buttons.types.drag-drop',
    defaultMessage: 'Drag Drop',
    description: 'Content of button to create a Drag Drod component.',
  },
  videoTypeButton: {
    id: 'course-authoring.library-authoring.add-content.buttons.types.video',
    defaultMessage: 'Video',
    description: 'Content of button to create a Video component.',
  },
  otherTypeButton: {
    id: 'course-authoring.library-authoring.add-content.buttons.types.other',
    defaultMessage: 'Advanced / Other',
    description: 'Content of button to create a Advanced / Other component.',
  },
  pasteButton: {
    id: 'course-authoring.library-authoring.add-content.buttons.paste',
    defaultMessage: 'Paste From Clipboard',
    description: 'Content of button to paste from clipboard.',
  },
  successCreateMessage: {
    id: 'course-authoring.library-authoring.add-content.success.text',
    defaultMessage: 'Content created successfully.',
    description: 'Message when creation of content in library is success',
  },
  errorCreateMessage: {
    id: 'course-authoring.library-authoring.add-content.error.text',
    defaultMessage: 'There was an error creating the content.',
    description: 'Message when creation of content in library is on error.',
  },
  errorCreateMessageWithDetail: {
    id: 'course-authoring.library-authoring.add-content.error.text-detail',
    defaultMessage: 'There was an error creating the content: {detail}',
    description: (
      'Message when creation of content in library is on error.'
      + ' The {detail} text provides more information about the error.'
    ),
  },
  successAssociateComponentMessage: {
    id: 'course-authoring.library-authoring.associate-collection-content.success.text',
    defaultMessage: 'Content linked successfully.',
    description: 'Message when linking of content to a collection in library is success',
  },
  errorAssociateComponentMessage: {
    id: 'course-authoring.library-authoring.associate-collection-content.error.text',
    defaultMessage: 'There was an error linking the content to this collection.',
    description: 'Message when linking of content to a collection in library fails',
  },
  addContentTitle: {
    id: 'course-authoring.library-authoring.sidebar.title.add-content',
    defaultMessage: 'Add Content',
    description: 'Title of add content in library container.',
  },
  successPasteClipboardMessage: {
    id: 'course-authoring.library-authoring.paste-clipboard.success.text',
    defaultMessage: 'Content pasted successfully.',
    description: 'Message when pasting clipboard in library is successful',
  },
  errorPasteClipboardMessage: {
    id: 'course-authoring.library-authoring.paste-clipboard.error.text',
    defaultMessage: 'There was an error pasting the content.',
    description: 'Message when pasting clipboard in library errors',
  },
  errorPasteClipboardMessageWithDetail: {
    id: 'course-authoring.library-authoring.paste-clipboard.error.text-detail',
    defaultMessage: 'There was an error pasting the content: {detail}',
    description: (
      'Message when pasting clipboard in library errors.'
      + ' The {detail} text provides more information about the error.'
    ),
  },
  pastingClipboardMessage: {
    id: 'course-authoring.library-authoring.paste-clipboard.loading.text',
    defaultMessage: 'Pasting content from clipboard...',
    description: 'Message when in process of pasting content in library',
  },
  unsupportedBlockPasteClipboardMessage: {
    id: 'course-authoring.library-authoring.paste-clipboard.unsupportedblock-error.text',
    defaultMessage: 'Libraries do not support this type of content yet.',
    description: 'Message when unsupported block is pasted in library',
  },
});

export default messages;
