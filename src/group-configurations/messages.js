import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  headingTitle: {
    id: 'course-authoring.group-configurations.heading-title',
    defaultMessage: 'Group configurations',
  },
  headingSubtitle: {
    id: 'course-authoring.group-configurations.heading-sub-title',
    defaultMessage: 'Settings',
  },
  containsGroups: {
    id: 'course-authoring.group-configurations.container.contains-groups',
    defaultMessage: 'Contains {len} groups',
  },
  containsGroup: {
    id: 'course-authoring.group-configurations.container.contains-group',
    defaultMessage: 'Contains 1 group',
  },
  notInUse: {
    id: 'course-authoring.group-configurations.container.not-in-use',
    defaultMessage: 'Not in use',
  },
  usedInLocations: {
    id: 'course-authoring.group-configurations.container.used-in-locations',
    defaultMessage: 'Used in {len} locations',
  },
  usedInLocation: {
    id: 'course-authoring.group-configurations.container.used-in-location',
    defaultMessage: 'Used in 1 location',
  },
});

export default messages;
