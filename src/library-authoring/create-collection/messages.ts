import { defineMessages as _defineMessages } from '@edx/frontend-platform/i18n';
import type { defineMessages as defineMessagesType } from 'react-intl';

// frontend-platform currently doesn't provide types... do it ourselves.
const defineMessages = _defineMessages as typeof defineMessagesType;

const messages = defineMessages({
  createCollectionModalTitle: {
    id: 'course-authoring.library-authoring.modals.create-collection.title',
    defaultMessage: 'New Collection',
    description: 'Title of the Create Collection modal',
  },
  createCollectionModalCancel: {
    id: 'course-authoring.library-authoring.modals.create-collection.cancel',
    defaultMessage: 'Cancel',
    description: 'Label of the Cancel button of the Create Collection modal',
  },
  createCollectionModalCreate: {
    id: 'course-authoring.library-authoring.modals.create-collection.create',
    defaultMessage: 'Create',
    description: 'Label of the Create button of the Create Collection modal',
  },
  createCollectionModalNameLabel: {
    id: 'course-authoring.library-authoring.modals.create-collection.form.name',
    defaultMessage: 'Name your collection',
    description: 'Label of the Name field of the Create Collection modal form',
  },
  createCollectionModalNamePlaceholder: {
    id: 'course-authoring.library-authoring.modals.create-collection.form.name.placeholder',
    defaultMessage: 'Give a descriptive title',
    description: 'Placeholder of the Name field of the Create Collection modal form',
  },
  createCollectionModalNameInvalid: {
    id: 'course-authoring.library-authoring.modals.create-collection.form.name.invalid',
    defaultMessage: 'Collection name is required',
    description: 'Message when the Name field of the Create Collection modal form is invalid',
  },
  createCollectionModalDescriptionLabel: {
    id: 'course-authoring.library-authoring.modals.create-collection.form.description',
    defaultMessage: 'Add a description (optional)',
    description: 'Label of the Description field of the Create Collection modal form',
  },
  createCollectionModalDescriptionPlaceholder: {
    id: 'course-authoring.library-authoring.modals.create-collection.form.description.placeholder',
    defaultMessage: 'Add description',
    description: 'Placeholder of the Description field of the Create Collection modal form',
  },
  createCollectionModalDescriptionDetails: {
    id: 'course-authoring.library-authoring.modals.create-collection.form.description.details',
    defaultMessage: 'Descriptions can help you and your team better organize and find what you are looking for',
    description: 'Details of the Description field of the Create Collection modal form',
  },
  createCollectionSuccess: {
    id: 'course-authoring.library-authoring.modals.create-collection.success',
    defaultMessage: 'Collection created successfully',
    description: 'Success message when creating a library collection',
  },
  createCollectionError: {
    id: 'course-authoring.library-authoring.modals.create-collection.error',
    defaultMessage: 'There is an error when creating the library collection',
    description: 'Error message when creating a library collection',
  },
});

export default messages;
