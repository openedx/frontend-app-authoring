import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  oldVersionTitle: {
    id: 'course-authoring.library-authoring.component-comparison.oldVersion',
    defaultMessage: 'Old version',
    description: 'Title shown for old version when comparing changes',
  },
  newVersionTitle: {
    id: 'course-authoring.library-authoring.component-comparison.newVersion',
    defaultMessage: 'New version',
    description: 'Title shown for new version when comparing changes',
  },
  iframeTitlePrefix: {
    // This is only used in the "PreviewChangesEmbed" iframe for the legacy UI
    id: 'course-authoring.library-authoring.component-comparison.iframeTitlePrefix',
    defaultMessage: 'Compare Changes',
    description: 'Title used for the compare changes dialog',
  },
});

export default messages;
