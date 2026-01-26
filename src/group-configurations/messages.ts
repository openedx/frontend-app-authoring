import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  headingTitle: {
    id: 'course-authoring.group-configurations.heading-title',
    defaultMessage: 'Group configurations',
    description: 'Title for the heading of the group configurations section.',
  },
  headingSubtitle: {
    id: 'course-authoring.group-configurations.heading-sub-title',
    defaultMessage: 'Settings',
    description: 'Subtitle for the heading of the group configurations section.',
  },
  containsGroups: {
    id: 'course-authoring.group-configurations.container.contains-groups',
    defaultMessage: 'Contains {len, plural, one {1 group} other {{len} groups}}',
    description: 'Message indicating the number of groups contained within a container.',
  },
  notInUse: {
    id: 'course-authoring.group-configurations.container.not-in-use',
    defaultMessage: 'Not in use',
    description: 'Message indicating that the group configurations are not currently in use.',
  },
  usedInLocations: {
    id: 'course-authoring.group-configurations.container.used-in-locations',
    defaultMessage: 'Used in {len, plural, one {1 location} other {{len} locations}}',
    description: 'Message indicating the number of locations where the group configurations are used.',
  },
});

export default messages;
