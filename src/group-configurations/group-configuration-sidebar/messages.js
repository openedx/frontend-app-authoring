import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  aboutTitle: {
    id: 'course-authoring.group-configurations.sidebar.about.title',
    defaultMessage: 'Content groups',
    description: 'Title for the content groups section in the sidebar.',
  },
  aboutDescription_1: {
    id: 'course-authoring.group-configurations.sidebar.about.description-1',
    defaultMessage: 'If you have cohorts enabled in your course, you can use content groups to create cohort-specific courseware. In other words, you can customize the content that particular cohorts see in your course.',
    description: 'First description for the content groups section in the sidebar.',
  },
  aboutDescription_2: {
    id: 'course-authoring.group-configurations.sidebar.about.description-2',
    defaultMessage: 'Each content group that you create can be associated with one or more cohorts. In addition to making course content available to all learners, you can restrict access to some content to learners in specific content groups. Only learners in the cohorts that are associated with the specified content groups see the additional content.',
    description: 'Second description for the content groups section in the sidebar.',
  },
  aboutDescription_3: {
    id: 'course-authoring.group-configurations.sidebar.about.description-3',
    defaultMessage: 'Click {strongText} to add a new content group. To edit the name of a content group, hover over its box and click {strongText2}. You can delete a content group only if it is not in use by a unit. To delete a content group, hover over its box and click the delete icon.',
    description: 'Third description for the content groups section in the sidebar. Mentions how to add, edit, and delete content groups.',
  },
  aboutDescription_3_strong: {
    id: 'course-authoring.group-configurations.sidebar.about.description-3.strong',
    defaultMessage: 'New content group',
    description: 'Strong text (button label) used in the third description for adding a new content group.',
  },
  about_2_title: {
    id: 'course-authoring.group-configurations.sidebar.about-2.title',
    defaultMessage: 'Experiment group configurations',
    description: 'Title for the experiment group configurations section in the sidebar.',
  },
  about_2_description_1: {
    id: 'course-authoring.group-configurations.sidebar.about-2.description-1',
    defaultMessage: 'Use experiment group configurations if you are conducting content experiments, also known as A/B testing, in your course. Experiment group configurations define how many groups of learners are in a content experiment. When you create a content experiment for a course, you select the group configuration to use.',
    description: 'First description for the experiment group configurations section in the sidebar.',
  },
  about_2_description_2: {
    id: 'course-authoring.group-configurations.sidebar.about-2.description-2',
    defaultMessage: 'Click {strongText} to add a new configuration. To edit a configuration, hover over its box and click {strongText2}. You can delete a group configuration only if it is not in use in an experiment. To delete a configuration, hover over its box and click the delete icon.',
    description: 'Second description for the experiment group configurations section in the sidebar. Mentions how to add, edit, and delete group configurations.',
  },
  about_2_description_2_strong: {
    id: 'course-authoring.group-configurations.sidebar.about-2.description-2.strong',
    defaultMessage: 'New group configuration',
    description: 'Strong text (button label) used in the second description for adding a new group configuration.',
  },
  about_3_title: {
    id: 'course-authoring.group-configurations.sidebar.about-3.title',
    defaultMessage: 'Enrollment track groups',
    description: 'Title for the enrollment track groups section in the sidebar.',
  },
  about_3_description_1: {
    id: 'course-authoring.group-configurations.sidebar.about-3.description-1',
    defaultMessage: 'Enrollment track groups allow you to offer different course content to learners in each enrollment track. Learners enrolled in each enrollment track in your course are automatically included in the corresponding enrollment track group.',
    description: 'First description for the enrollment track groups section in the sidebar.',
  },
  about_3_description_2: {
    id: 'course-authoring.group-configurations.sidebar.about-3.description-2',
    defaultMessage: 'On unit pages in the course outline, you can restrict access to components to learners based on their enrollment track.',
    description: 'Second description for the enrollment track groups section in the sidebar.',
  },
  about_3_description_3: {
    id: 'course-authoring.group-configurations.sidebar.about-3.description-3',
    defaultMessage: 'You cannot edit enrollment track groups, but you can expand each group to view details of the course content that is designated for learners in the group.',
    description: 'Third description for the enrollment track groups section in the sidebar. Mentions the limitations and options for managing enrollment track groups.',
  },
  aboutDescription_strong_edit: {
    id: 'course-authoring.group-configurations.sidebar.about.description.strong-edit',
    defaultMessage: 'edit',
    description: 'Strong text used to indicate the edit action.',
  },
  learnMoreBtn: {
    id: 'course-authoring.group-configurations.sidebar.learnmore.button',
    defaultMessage: 'Learn more',
    description: 'Label for the "Learn more" button in the sidebar.',
  },
});

export default messages;
