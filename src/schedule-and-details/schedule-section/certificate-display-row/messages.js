import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  certificateBehaviorLabel: {
    id: 'course-authoring.schedule.schedule-section.certificate-behavior.label',
    defaultMessage: 'Certificate display behavior',
  },
  certificateBehaviorHelpText: {
    id: 'course-authoring.schedule.schedule-section.certificate-behavior.help-text',
    defaultMessage: 'Certificates are awarded at the end of a course run',
  },
  certificateAvailableDateLabel: {
    id: 'course-authoring.schedule.schedule-section.certificate-available-date.label',
    defaultMessage: 'Certificate available date',
  },
  certificateDisplayBehaviorToggleTitle: {
    id: 'course-authoring.schedule.schedule-section.certificate-behavior.toggle.title',
    defaultMessage: 'Read more about this setting',
  },
  certificateDisplayBehaviorToggleParagraph: {
    id: 'course-authoring.schedule.schedule-section.certificate-behavior.toggle.paragraph',
    defaultMessage: 'In all configurations of this setting, certificates are generated for learners as soon as they achieve the passing threshold in the course (which can occur before a final assignment based on course design).',
  },
  certificateDisplayBehaviorToggleHeading1: {
    id: 'course-authoring.schedule.schedule-section.certificate-behavior.toggle.heading-1',
    defaultMessage: 'Immediately upon passing',
  },
  certificateDisplayBehaviorToggleParagraph1: {
    id: 'course-authoring.schedule.schedule-section.certificate-behavior.toggle.paragraph-1',
    defaultMessage: 'Learners can access their certificate as soon as they achieve a passing grade above the course grade threshold. Note: learners can achieve a passing grade before encountering all assignments in some course configurations.',
  },
  certificateDisplayBehaviorToggleHeading2: {
    id: 'course-authoring.schedule.schedule-section.certificate-behavior.toggle.heading-2',
    defaultMessage: 'On course end date',
  },
  certificateDisplayBehaviorToggleParagraph2: {
    id: 'course-authoring.schedule.schedule-section.certificate-behavior.toggle.paragraph-2',
    defaultMessage: 'Learners with passing grades can access their certificate once the end date of the course has elapsed.',
  },
  certificateDisplayBehaviorToggleHeading3: {
    id: 'course-authoring.schedule.schedule-section.certificate-behavior.toggle.heading-3',
    defaultMessage: 'A date after the course end date',
  },
  certificateDisplayBehaviorToggleParagraph3: {
    id: 'course-authoring.schedule.schedule-section.certificate-behavior.toggle.paragraph-3',
    defaultMessage: 'Learners with passing grades can access their certificate after the date that you set has elapsed.',
  },
  certificateBehaviorDropdownOption1: {
    id: 'course-authoring.schedule.schedule-section.certificate-behavior.dropdown.option-1',
    defaultMessage: 'Immediately upon passing',
  },
  certificateBehaviorDropdownOption2: {
    id: 'course-authoring.schedule.schedule-section.certificate-behavior.dropdown.option-2',
    defaultMessage: 'End date of course',
  },
  certificateBehaviorDropdownOption3: {
    id: 'course-authoring.schedule.schedule-section.certificate-behavior.dropdown.option-3',
    defaultMessage: 'A date after the course end date',
  },
  certificateBehaviorDropdownEmpty: {
    id: 'course-authoring.schedule.schedule-section.certificate-behavior.dropdown.empty',
    defaultMessage: 'Select certificate display behavior',
  },
});

export default messages;
