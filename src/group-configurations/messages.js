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
    defaultMessage: 'Contains {len} groups',
    description: 'Message indicating the number of groups contained within a container.',
  },
  containsGroup: {
    id: 'course-authoring.group-configurations.container.contains-group',
    defaultMessage: 'Contains 1 group',
    description: 'Message indicating that there is only one group contained within a container.',
  },
  notInUse: {
    id: 'course-authoring.group-configurations.container.not-in-use',
    defaultMessage: 'Not in use',
    description: 'Message indicating that the group configurations are not currently in use.',
  },
  usedInLocations: {
    id: 'course-authoring.group-configurations.container.used-in-locations',
    defaultMessage: 'Used in {len} locations',
    description: 'Message indicating the number of locations where the group configurations are used.',
  },
  usedInLocation: {
    id: 'course-authoring.group-configurations.container.used-in-location',
    defaultMessage: 'Used in 1 location',
    description: 'Message indicating that the group configurations are used in only one location.',
  },
});

export default messages;
