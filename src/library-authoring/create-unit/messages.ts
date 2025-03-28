import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  createUnitModalTitle: {
    id: 'course-authoring.library-authoring.modals.create-unit.title',
    defaultMessage: 'New Unit',
    description: 'Title of the Create Unit modal',
  },
  createUnitModalCancel: {
    id: 'course-authoring.library-authoring.modals.create-unit.cancel',
    defaultMessage: 'Cancel',
    description: 'Label of the Cancel button of the Create Unit modal',
  },
  createUnitModalCreate: {
    id: 'course-authoring.library-authoring.modals.create-unit.create',
    defaultMessage: 'Create',
    description: 'Label of the Create button of the Create Unit modal',
  },
  createUnitModalNameLabel: {
    id: 'course-authoring.library-authoring.modals.create-unit.form.name',
    defaultMessage: 'Name your unit',
    description: 'Label of the Name field of the Create Unit modal form',
  },
  createUnitModalNamePlaceholder: {
    id: 'course-authoring.library-authoring.modals.create-unit.form.name.placeholder',
    defaultMessage: 'Give a descriptive title',
    description: 'Placeholder of the Name field of the Create Unit modal form',
  },
  createUnitModalNameInvalid: {
    id: 'course-authoring.library-authoring.modals.create-unit.form.name.invalid',
    defaultMessage: 'Unit name is required',
    description: 'Message when the Name field of the Create Unit modal form is invalid',
  },
  createUnitSuccess: {
    id: 'course-authoring.library-authoring.modals.create-unit.success',
    defaultMessage: 'Unit created successfully',
    description: 'Success message when creating a library unit',
  },
  createUnitError: {
    id: 'course-authoring.library-authoring.modals.create-unit.error',
    defaultMessage: 'There is an error when creating the library unit',
    description: 'Error message when creating a library unit',
  },
});

export default messages;
