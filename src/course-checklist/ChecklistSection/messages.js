import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  welcomeMessageShortDescription: {
    id: 'welcomeMessageShortDescription',
    defaultMessage: 'Add a welcome message',
    description: 'Label for a section that describes a welcome message for a course',
  },
  welcomeMessageLongDescription: {
    id: 'welcomeMessageLongDescription',
    defaultMessage: 'Personally welcome learners into your course and prepare learners for a positive course experience.',
    description: 'Description for a section that prompts a user to enter a welcome message for a course',
  },
  gradingPolicyShortDescription: {
    id: 'gradingPolicyShortDescription',
    defaultMessage: 'Create your course grading policy',
    description: 'Label for a section that describes a grading policy for a course',
  },
  gradingPolicyLongDescription: {
    id: 'gradingPolicyLongDescription',
    defaultMessage: 'Establish your grading policy, including assignment types and passing score. All assignments add up to 100%.',
    description: 'Description for a section that prompts a user to enter a grading policy for a course',
  },
  gradingPolicyComment: {
    id: 'gradingPolicyComment',
    defaultMessage: 'Your current grading policy adds up to {percent}%.',
    description: 'Description for a section that displays a course\'s grading policy total',
  },
  certificateShortDescription: {
    id: 'certificateShortDescription',
    defaultMessage: 'Enable your certificate',
    description: 'Label for a section that describes a certificate for completing a course',
  },
  certificateLongDescription: {
    id: 'certificateLongDescription',
    defaultMessage: 'Make sure that all text is correct, signatures have been uploaded, and the certificate has been activated.',
    description: 'Description for a section that prompts a user to create a course completion certificate',
  },
  courseDatesShortDescription: {
    id: 'courseDatesShortDescription',
    defaultMessage: 'Set important course dates',
    description: 'Label for a section that describes a certificate for completing a course',
  },
  courseDatesLongDescription: {
    id: 'courseDatesLongDescription',
    defaultMessage: 'Establish your course schedule, including when the course starts and ends.',
    description: 'Description for a section that prompts a user to set up a course schedule',
  },
  assignmentDeadlinesShortDescription: {
    id: 'assignmentDeadlinesShortDescription',
    defaultMessage: 'Validate assignment deadlines',
    description: 'Label for a section that describes course assignment deadlines',
  },
  assignmentDeadlinesLongDescription: {
    id: 'assignmentDeadlinesLongDescription',
    defaultMessage: 'Ensure all assignment deadlines are between course start and end dates.',
    description: 'Description for a section that prompts a user to enter course assignment deadlines',
  },
  assignmentDeadlinesComment: {
    id: 'assignmentDeadlinesComment',
    defaultMessage: 'The following assignments have deadlines that do not fall between course start and end date:',
    description: 'Description for a section that displays which assignments are outside of a course\'s start and end date',
  },
  videoDurationShortDescription: {
    id: 'videoDurationShortDescription',
    defaultMessage: 'Check video duration',
    description: 'Label for a section that describes video durations',
  },
  videoDurationLongDescription: {
    id: 'videoDurationLongDescription',
    defaultMessage: 'Learners engage best with short videos followed by opportunities to practice. Ensure that 80% or more of course videos are less than 10 minutes long.',
    description: 'Description for a section that prompts a user to follow best practices for video length',
  },
  mobileFriendlyVideoShortDescription: {
    id: 'mobileFriendlyVideoShortDescription',
    defaultMessage: 'Create mobile-friendly video',
    description: 'Label for a section that describes mobile friendly videos',
  },
  mobileFriendlyVideoLongDescription: {
    id: 'mobileFriendlyVideoLongDescription',
    defaultMessage: 'Mobile-friendly videos can be viewed across all supported devices. Ensure that at least 90% of course videos are mobile friendly by uploading course videos to the edX video pipeline.',
    description: 'Description for a section that prompts a user to follow best practices for mobile friendly videos',
  },
  diverseSequencesShortDescription: {
    id: 'diverseSequencesShortDescription',
    defaultMessage: 'Build diverse learning sequences',
    description: 'Label for a section that describes diverse sequences of educational content',
  },
  diverseSequencesLongDescription: {
    id: 'diverseSequencesLongDescription',
    defaultMessage: 'Research shows that a diverse content experience drives learner engagement. We recommend that 80% or more of your learning sequences or subsections include multiple content types (such as video, discussion, or problem).',
    description: 'Description for a section that prompts a user to follow best practices diverse sequences of educational content',
  },
  weeklyHighlightsShortDescription: {
    id: 'weeklyHighlightsShortDescription',
    defaultMessage: 'Set weekly highlights',
    description: 'Label for a section that describes weekly highlights',
  },
  weeklyHighlightsLongDescription: {
    id: 'weeklyHighlightsLongDescription',
    defaultMessage: 'Enable and specify weekly highlights to keep learners engaged and on track in your course.',
    description: 'Description for a section that prompts a user to follow best practices for course weekly highlights',
  },
  unitDepthShortDescription: {
    id: 'unitDepthShortDescription',
    defaultMessage: 'Manage unit depth',
    description: 'Label for a section that describes course unit depth',
  },
  unitDepthLongDescription: {
    id: 'unitDepthLongDescription',
    defaultMessage: 'Breaking up course content into manageable pieces promotes learner engagement. We recommend units contain no more than three components.',
    description: 'Description for a section that prompts a user to follow best practices for course unit depth',
  },
  proctoringEmailShortDescription: {
    id: 'proctoringEmailShortDescription',
    defaultMessage: 'Add a proctortrack escalation email',
    description: 'Label for a section that describes proctoring escalation email',
  },
  proctoringEmailLongDescription: {
    id: 'proctoringEmailLongDescription',
    defaultMessage: 'Courses using Proctortrack require an escalation email. Ensure learners and Support can contact your course team regarding proctoring issues (e.g. appeals, exam resets, etc).',
    description: 'Description for a section that prompts the user to add a Proctortrack escalation email for the course',
  },
  updateLinkLabel: {
    id: 'updateLinkLabel',
    defaultMessage: 'Update',
    description: 'Label for a link that takes the user to a page where they can update settings',
  },
  completionCountLabel: {
    id: 'completionCountLabel',
    defaultMessage: '{completed}/{total} completed',
    description: 'Label that describes how many tasks have been completed out of a total number of tasks',
  },
  completedItemLabel: {
    id: 'completedItemLabel',
    defaultMessage: 'completed',
    description: 'Label that describes a completed task',
  },
  uncompletedItemLabel: {
    id: 'uncompletedItemLabel',
    defaultMessage: 'uncompleted',
    description: 'Label that describes an uncompleted task',
  },
});

export default messages;
