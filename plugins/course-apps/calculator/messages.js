import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  heading: {
    id: 'course-authoring.pages-resources.calculator.heading',
    defaultMessage: 'Configure calculator',
  },
  enableCalculatorLabel: {
    id: 'course-authoring.pages-resources.calculator.enable-calculator.label',
    defaultMessage: 'Calculator',
  },
  enableCalculatorHelp: {
    id: 'course-authoring.pages-resources.calculator.enable-calculator.help',
    defaultMessage: `The calculator supports numbers, operators, constants,
      functions, and other mathematical concepts. When enabled, an icon to
      access the calculator appears on all pages in the body of your course.`,
  },
  enableCalculatorLink: {
    id: 'course-authoring.pages-resources.calculator.enable-calculator.link',
    defaultMessage: 'Learn more about the calculator',
  },
});

export default messages;
