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
  courseContentTitle: {
    id: 'course-authoring.library-authoring.component-comparison.courseContent',
    defaultMessage: 'Course content',
    description: 'Title shown for course content when comparing changes',
  },
  publishedLibraryContentTitle: {
    id: 'course-authoring.library-authoring.component-comparison.publishedLibraryContent',
    defaultMessage: 'Published library content',
    description: 'Title shown for published library content when comparing changes',
  },
});

export default messages;
