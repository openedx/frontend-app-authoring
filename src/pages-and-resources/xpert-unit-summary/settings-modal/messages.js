import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  cancel: {
    id: 'course-authoring.pages-resources.app-settings-modal.button.cancel',
    defaultMessage: 'Cancel',
  },
  save: {
    id: 'course-authoring.pages-resources.app-settings-modal.button.save',
    defaultMessage: 'Save',
  },
  saving: {
    id: 'course-authoring.pages-resources.app-settings-modal.button.saving',
    defaultMessage: 'Saving',
  },
  saved: {
    id: 'course-authoring.pages-resources.app-settings-modal.button.saved',
    defaultMessage: 'Saved',
  },
  retry: {
    id: 'course-authoring.pages-resources.app-settings-modal.button.retry',
    defaultMessage: 'Retry',
  },
  enabled: {
    id: 'course-authoring.pages-resources.app-settings-modal.badge.enabled',
    defaultMessage: 'Enabled',
  },
  disabled: {
    id: 'course-authoring.pages-resources.app-settings-modal.badge.disabled',
    defaultMessage: 'Disabled',
  },
  resetAllUnits: {
    id: 'course-authoring.pages-resources.app-settings-modal.reset-all-units',
    defaultMessage: 'Reset all units',
  },
  resetAllUnitsTooltipChecked: {
    id: 'course-authoring.pages-resources.app-settings-modal.reset-all-units-tooltip.checked',
    defaultMessage: 'Immediately reset any unit-level changes and checked "Enable summaries" on all units.',
  },
  resetAllUnitsTooltipUnchecked: {
    id: 'course-authoring.pages-resources.app-settings-modal.reset-all-units-tooltip.unchecked',
    defaultMessage: 'Immediately reset any unit-level changes and unchecked "Enable summaries" on all units.',
  },
  reset: {
    id: 'course-authoring.pages-resources.app-settings-modal.reset',
    defaultMessage: 'Reset',
  },
  errorSavingTitle: {
    id: 'course-authoring.pages-resources.app-settings-modal.save-error.title',
    defaultMessage: 'We couldn\'t apply your changes.',
  },
  errorSavingMessage: {
    id: 'course-authoring.pages-resources.app-settings-modal.save-error.message',
    defaultMessage: 'Please check your entries and try again.',
  },
});

export default messages;
