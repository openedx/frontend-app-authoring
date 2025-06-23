import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  connectionError: {
    id: 'authoring.alert.error.connection',
    defaultMessage: 'We encountered a technical error when loading this page. This might be a temporary issue, so please try again in a few minutes. If the problem persists, please go to the {supportLink} for help.',
    description: 'Error message shown to users when there is a connectivity issue with the server.',
  },
  supportText: {
    id: 'authoring.alert.support.text',
    defaultMessage: 'Support Page',
  },
  sidebarDashboardTitle: {
    id: 'sidebar.dashboard.title',
    defaultMessage: 'Dashboard',
    description: 'Title of the dashboard sidebar item',
  },
  sidebarCreateNewCourseTitle: {
    id: 'sidebar.create-new-course.title',
    defaultMessage: 'Create New Course',
    description: 'Title of the create new course sidebar item',
  },
  sidebarMyCoursesTitle: {
    id: 'sidebar.my-courses.title',
    defaultMessage: 'My Courses',
    description: 'Title of the my courses sidebar item',
  },
  sidebarContentLibrariesTitle: {
    id: 'sidebar.content-libraries.title',
    defaultMessage: 'Content Libraries',
    description: 'Title of the content libraries sidebar item',
  },
  sidebarCalendarTitle: {
    id: 'sidebar.calendar.title',
    defaultMessage: 'Calendar',
    description: 'Title of the calendar sidebar item',
  },
  sidebarClassPlannerTitle: {
    id: 'sidebar.class-planner.title',
    defaultMessage: 'Class Planner',
    description: 'Title of the class planner sidebar item',
  },
  sidebarInsightsReportsTitle: {
    id: 'sidebar.insights-reports.title',
    defaultMessage: 'Insights & Reports',
    description: 'Title of the insights & reports sidebar item',
  },
  sidebarTitanAITitle: {
    id: 'sidebar.titan-ai.title',
    defaultMessage: 'TitanAI Assistant',
    description: 'Title of the titan ai assistant sidebar item',
  },
  sidebarSharedResourcesTitle: {
    id: 'sidebar.shared-resources.title',
    defaultMessage: 'Shared Resources',
    description: 'Title of the shared resources sidebar item',
  },
  sidebarTaxonomiesTitle: {
    id: 'sidebar.taxonomies.title',
    defaultMessage: 'Taxonomies',
    description: 'Title of the taxonomies sidebar item',
  },
});

export default messages;
