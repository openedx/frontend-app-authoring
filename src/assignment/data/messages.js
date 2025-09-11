import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  pageTitle: {
    id: 'assignment.pageTitle',
    defaultMessage: 'Assignments',
    description: 'Page title for assignments',
  },
  allCourses: {
    id: 'assignment.dropdown.allCourses',
    defaultMessage: 'All Courses',
    description: 'Option label for showing all courses in dropdown',
  },
  allStatus: {
    id: 'assignment.dropdown.allStatus',
    defaultMessage: 'All Status',
    description: 'Option label for showing all status in dropdown',
  },
  searchPlaceholder: {
    id: 'assignment.searchPlaceholder',
    defaultMessage: 'Search assignments...',
    description: 'Placeholder for search input',
  },
  clearSearch: {
    id: 'assignment.clearSearch',
    defaultMessage: 'Clear search',
    description: 'Alt text for clear search (close icon)',
  },
  courseFilterLabel: {
    id: 'assignment.courseFilterLabel',
    defaultMessage: 'Course',
    description: 'Label for course filter',
  },
  statusFilterLabel: {
    id: 'assignment.statusFilterLabel',
    defaultMessage: 'Status',
    description: 'Label for status filter',
  },
  fromDateLabel: {
    id: 'assignment.fromDateLabel',
    defaultMessage: 'From Date',
    description: 'Label for from date picker',
  },
  toDateLabel: {
    id: 'assignment.toDateLabel',
    defaultMessage: 'To Date',
    description: 'Label for to date picker',
  },
  todayButton: {
    id: 'assignment.todayButton',
    defaultMessage: 'Today',
    description: 'Button for today filter',
  },
  thisWeekButton: {
    id: 'assignment.thisWeekButton',
    defaultMessage: 'Week',
    description: 'Button for this week filter',
  },
  thisMonthButton: {
    id: 'assignment.thisMonthButton',
    defaultMessage: 'Month',
    description: 'Button for this month filter',
  },
  resetButton: {
    id: 'assignment.resetButton',
    defaultMessage: 'Reset',
    description: 'Button to reset date filter',
  },
  dateFilterToggle: {
    id: 'assignment.dateFilterToggle',
    defaultMessage: 'Toggle date filter',
    description: 'Alt text for calendar/close toggle button',
  },
  errorLoad: {
    id: 'assignment.error.load',
    defaultMessage: 'Error loading assignments',
    description: 'Error message for data load',
  },
  errorInvalidDateRange: {
    id: 'assignment.error.invalidDateRange',
    defaultMessage: 'Date range cannot exceed 3 months',
    description: 'Error for invalid date range',
  },
  tableHeaders: {
    assignmentName: { id: 'assignment.table.assignmentName', defaultMessage: 'Assignment Name' },
    courseName: { id: 'assignment.table.courseName', defaultMessage: 'Course Name' },
    unitName: { id: 'assignment.table.unitName', defaultMessage: 'Unit Name' },
    dueDate: { id: 'assignment.table.dueDate', defaultMessage: 'Due Date' },
    type: { id: 'assignment.table.type', defaultMessage: 'Type' },
    responses: { id: 'assignment.table.responses', defaultMessage: 'Responses' },
    marks: { id: 'assignment.table.marks', defaultMessage: 'Marks' },
    status: { id: 'assignment.table.status', defaultMessage: 'Status' },
    review: { id: 'assignment.table.review', defaultMessage: 'Review' },
  },
  openReview: {
    id: 'assignment.table.openReview',
    defaultMessage: 'Open review',
    description: 'Alt text / tooltip for review icon button in table',
  },
});

export default messages;
