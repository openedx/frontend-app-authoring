import { defineMessages } from '@edx/frontend-platform/i18n';

export const messages = defineMessages({
  collectionButton: {
    id: 'course-authoring.library-authoring.add-content.buttons.collection',
    defaultMessage: 'Collection',
    description: 'Content of button to create a Collection.',
  },
  unitButton: {
    id: 'course-authoring.library-authoring.add-content.buttons.unit',
    defaultMessage: 'Unit',
    description: 'Content of button to create a Unit.',
  },
  sectionButton: {
    id: 'course-authoring.library-authoring.add-content.buttons.section',
    defaultMessage: 'Section',
    description: 'Content of button to create a Section.',
  },
  subsectionButton: {
    id: 'course-authoring.library-authoring.add-content.buttons.subsection',
    defaultMessage: 'Subsection',
    description: 'Content of button to create a Subsection.',
  },
  libraryContentButton: {
    id: 'course-authoring.library-authoring.add-content.buttons.library-content',
    defaultMessage: 'Existing Library Content',
    description: 'Content of button to add existing library content to a collection or container.',
  },
  addToButton: {
    id: 'course-authoring.library-authoring.add-content.buttons.library-content.add-to-collection',
    defaultMessage: 'Add to Collection',
    description: 'Button to add library content to a collection.',
  },
  selectContentTitle: {
    id: 'course-authoring.library-authoring.add-content.select-components',
    defaultMessage: 'Select components',
    description: 'Title for the content picker when selecting components in library.',
  },
  selectedContent: {
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
    defaultMessage: 'Open Response',
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
  successAssociateComponentToContainerMessage: {
    id: 'course-authoring.library-authoring.associate-container-content.success.text',
    defaultMessage: 'Content linked successfully.',
    description: 'Message when linking of content to a container in library is success',
  },
  errorAssociateComponentToContainerMessage: {
    id: 'course-authoring.library-authoring.associate-container-content.error.text',
    defaultMessage: 'There was an error linking the content to this container.',
    description: 'Message when linking of content to a container in library fails',
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
  backToAddContentListButton: {
    id: 'course-authoring.library-authoring.add-content.buttons.back',
    defaultMessage: 'Back to List',
    description: 'Messag of button in advanced creation view to return to the main creation view.',
  },
});

export const unitMessages = defineMessages({
  addToButton: {
    id: 'course-authoring.library-authoring.add-content.buttons.library-content.add-to-unit',
    defaultMessage: 'Add to Unit',
    description: 'Button to add library content to a unit.',
  },
});

export const subsectionMessages = defineMessages({
  unitButton: {
    id: 'course-authoring.library-authoring.add-content.buttons.new-unit',
    defaultMessage: 'New Unit',
    description: 'Content of button to create a new Unit in a Subsection.',
  },
  libraryContentButton: {
    id: 'course-authoring.library-authoring.add-content.buttons.library-unit',
    defaultMessage: 'Existing Unit',
    description: 'Content of button to add an existing Unit to a Subsection.',
  },
  addToButton: {
    id: 'course-authoring.library-authoring.add-content.buttons.library-content.add-to-subsection',
    defaultMessage: 'Add to Subsection',
    description: 'Button to add Units to a Subsection.',
  },
  selectContentTitle: {
    id: 'course-authoring.library-authoring.add-content.select-units',
    defaultMessage: 'Select units',
    description: 'Title for the content picker when selecting units in library.',
  },
  selectedContent: {
    id: 'course-authoring.library-authoring.add-content.selected-units',
    defaultMessage: '{count, plural, one {# Selected Unit} other {# Selected Units}}',
    description: 'Title for selected units in library.',
  },
});

export const sectionMessages = defineMessages({
  subsectionButton: {
    id: 'course-authoring.library-authoring.add-content.buttons.new-subsection',
    defaultMessage: 'New Subsection',
    description: 'Content of button to create a new Subsection in a Section.',
  },
  libraryContentButton: {
    id: 'course-authoring.library-authoring.add-content.buttons.library-subsection',
    defaultMessage: 'Existing Subsection',
    description: 'Content of button to add an existing Subsection to a Section.',
  },
  addToButton: {
    id: 'course-authoring.library-authoring.add-content.buttons.library-content.add-to-section',
    defaultMessage: 'Add to Section',
    description: 'Button to add library content to a section.',
  },
  selectContentTitle: {
    id: 'course-authoring.library-authoring.add-content.select-subsections',
    defaultMessage: 'Select subsections',
    description: 'Title for the content picker when selecting subsections in library.',
  },
  selectedContent: {
    id: 'course-authoring.library-authoring.add-content.selected-subsections',
    defaultMessage: '{count, plural, one {# Selected Subsections} other {# Selected Subsections}}',
    description: 'Title for selected subsections in library.',
  },
});

/*
 * Returns the appropriate message set for the given route conditions.
 */
export const getContentMessages = (
  insideSection: boolean,
  insideSubsection: boolean,
  insideUnit: boolean,
) => {
  if (insideSection) {
    return {
      ...messages,
      ...sectionMessages,
    };
  }
  if (insideSubsection) {
    return {
      ...messages,
      ...subsectionMessages,
    };
  }
  if (insideUnit) {
    return {
      ...messages,
      ...unitMessages,
    };
  }
  return messages;
};

export default messages;
