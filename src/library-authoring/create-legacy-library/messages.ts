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
  warningTitle: {
    id: 'course-authoring.library-authoring.create-legacy-library.warning.title',
    defaultMessage: 'You are creating content in a deprecated format',
    description: 'Warning to discourage users from creating a new Legacy Library',
  },
  warningBody: {
    id: 'course-authoring.library-authoring.create-legacy-library.warning.body',
    defaultMessage: 'Legacy libraries will be unsupported in a future release. Any content you create in a legacy library will soon need to be migrated. Consider using the Libraries (Beta) feature instead.',
    description: 'Warning to discourage users from creating a new Legacy Library',
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
