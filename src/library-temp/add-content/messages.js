import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  collectionButton: {
    id: 'library-home.add-content.buttons.collection',
    defaultMessage: 'Collection',
    description: 'Content of button to create a Collection.',
  },
  textTypeButton: {
    id: 'library-home.add-content.buttons.types.text',
    defaultMessage: 'Text',
    description: 'Content of button to create a Text component.',
  },
  problemTypeButton: {
    id: 'library-home.add-content.buttons.types.problem',
    defaultMessage: 'Problem',
    description: 'Content of button to create a Problem component.',
  },
  openResponseTypeButton: {
    id: 'library-home.add-content.buttons.types.open-response',
    defaultMessage: 'Open Reponse',
    description: 'Content of button to create a Open Response component.',
  },
  dragDropTypeButton: {
    id: 'library-home.add-content.buttons.types.drag-drop',
    defaultMessage: 'Drag Drop',
    description: 'Content of button to create a Drag Drog component.',
  },
  videoTypeButton: {
    id: 'library-home.add-content.buttons.types.video',
    defaultMessage: 'Video',
    description: 'Content of button to create a Video component.',
  },
  otherTypeButton: {
    id: 'library-home.add-content.buttons.types.other',
    defaultMessage: 'Advanced / Other',
    description: 'Content of button to create a Advanced / Other component.',
  },
  successCreateMessage: {
    id: 'library-home.add-content.success.text',
    defaultMessage: 'Content created successfully.',
    description: 'Message when creation of content in library is success',
  },
  errorCreateMessage: {
    id: 'library-home.add-content.error.text',
    defaultMessage: 'There was an error creating the content.',
    description: 'Message when creation of content in library is on error',
  },
});

export default messages;
