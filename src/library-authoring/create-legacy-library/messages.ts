import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  createLibrary: {
    id: 'course-authoring.library-authoring.create-legacy-library',
    defaultMessage: 'Create new legacy library',
    description: 'Header for the create legacy library form',
  },
  titleLabel: {
    id: 'course-authoring.library-authoring.create-legacy-library.form.title.label',
    defaultMessage: 'Legacy library name',
    description: 'Label for the title field when creating a legacy library.',
  },
  createLibraryButton: {
    id: 'course-authoring.library-authoring.create-legacy-library.form.create-library.button',
    defaultMessage: 'Create legacy library',
    description: 'Button text for creating a new legacy library.',
  },
  createLibraryButtonPending: {
    id: 'course-authoring.library-authoring.create-legacy-library.form.create-library.button.pending',
    defaultMessage: 'Creating legacy library..',
    description: 'Button text while the legacy library is being created.',
  },
});

export default messages;
