import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  sidebarTitle: {
    id: 'course-authoring.course-team.sidebar.title',
    defaultMessage: 'Course team roles',
  },
  sidebarAbout_1: {
    id: 'course-authoring.course-team.sidebar.about-1',
    defaultMessage: 'Course team members with the Staff role are course co-authors. They have full writing and editing privileges on all course content.',
  },
  sidebarAbout_2: {
    id: 'course-authoring.course-team.sidebar.about-2',
    defaultMessage: 'Admins are course team members who can add and remove other course team members.',
  },
  sidebarAbout_3: {
    id: 'course-authoring.course-team.sidebar.about-3',
    defaultMessage: 'All course team members can access content in Studio, the LMS, and Insights, but are not automatically enrolled in the course.',
  },
  ownershipTitle: {
    id: 'course-authoring.course-team.sidebar.ownership.title',
    defaultMessage: 'Transferring ownership',
  },
  ownershipDescription: {
    id: 'course-authoring.course-team.sidebar.ownership.description',
    defaultMessage: 'Every course must have an Admin. If you are the Admin and you want to transfer ownership of the course, click {strong} to make another user the Admin, then ask that user to remove you from the Course Team list.',
  },
  addAdminAccess: {
    id: 'course-authoring.course-team.sidebar.ownership.addAdminAccess',
    defaultMessage: 'Add admin access',
  },
});

export default messages;
