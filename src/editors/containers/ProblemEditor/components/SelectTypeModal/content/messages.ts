import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({

  advanceProblemButtonLabel: {
    id: 'authoring.problemEditor.problemSelect.advanceButton.label',
    defaultMessage: 'Advanced problem types',
    description: 'Button label for advance problem types option',
  },
  advanceMenuTitle: {
    id: 'authoring.problemEditor.advanceProblem.menu.title',
    defaultMessage: 'Advanced problems',
    description: 'Title for advanced problem menu',
  },
  advanceMenuGoBack: {
    id: 'authoring.problemEditor.advanceProblem.menu.goBack',
    defaultMessage: 'Go back',
    description: 'Return to the previous menu that shows basic problem types',
  },

  // Direct problem type message pattern - replacing redundant advanceProblemTypeLabel
  'problemType.blankadvanced.title': {
    id: 'authoring.problemeditor.advancedproblemtype.blank.title',
    defaultMessage: 'Blank problem',
    description: 'Title for blank advanced problem type',
  },
  'problemType.circuitschematic.title': {
    id: 'authoring.problemeditor.advancedproblemtype.circuitschematic.title',
    defaultMessage: 'Circuit schematic builder',
    description: 'Title for circuit schematic builder advanced problem type',
  },
  'problemType.jsinputresponse.title': {
    id: 'authoring.problemeditor.advancedproblemtype.jsinput.title',
    defaultMessage: 'Custom JavaScript display and grading',
    description: 'Title for custom JavaScript display and grading advanced problem type',
  },
  'problemType.customgrader.title': {
    id: 'authoring.problemeditor.advancedproblemtype.customgrader.title',
    defaultMessage: 'Custom Python-evaluated input',
    description: 'Title for custom Python-evaluated input advanced problem type',
  },
  'problemType.imageresponse.title': {
    id: 'authoring.problemeditor.advancedproblemtype.image.title',
    defaultMessage: 'Image mapped input',
    description: 'Title for image mapped input advanced problem type',
  },
  'problemType.formularesponse.title': {
    id: 'authoring.problemeditor.advancedproblemtype.formula.title',
    defaultMessage: 'Math expression input',
    description: 'Title for math expression input advanced problem type',
  },
  'problemType.problemwithhint.title': {
    id: 'authoring.problemeditor.advancedproblemtype.problemwithhint.title',
    defaultMessage: 'Problem with adaptive hint',
    description: 'Title for problem with adaptive hint advanced problem type',
  },

  // Basic Problem Type Messages by Key
  'problemType.multiplechoiceresponse.title': {
    id: 'authoring.problemeditor.problemtype.singleselect.title',
    defaultMessage: 'Single select',
    description: 'Title for single select problem type',
  },
  'problemType.multiplechoiceresponse.description': {
    id: 'authoring.problemeditor.problemtype.singleselect.description',
    defaultMessage: 'Learners must select the correct answer from a list of possible options.',
    description: 'Preview description for single select problem type',
  },
  'problemType.choiceresponse.title': {
    id: 'authoring.problemeditor.problemtype.multiselect.title',
    defaultMessage: 'Multi-select',
    description: 'Title for multi-select problem type',
  },
  'problemType.choiceresponse.description': {
    id: 'authoring.problemeditor.problemtype.multiselect.description',
    defaultMessage: 'Learners must select all correct answers from a list of possible options.',
    description: 'Preview description for multi-select problem type',
  },
  'problemType.optionresponse.title': {
    id: 'authoring.problemeditor.problemtype.dropdown.title',
    defaultMessage: 'Dropdown',
    description: 'Title for dropdown problem type',
  },
  'problemType.optionresponse.description': {
    id: 'authoring.problemeditor.problemtype.dropdown.description',
    defaultMessage: 'Learners must select the correct answer from a list of possible options',
    description: 'Preview description for dropdown problem type',
  },
  'problemType.numericalresponse.title': {
    id: 'authoring.problemeditor.problemtype.numeric.title',
    defaultMessage: 'Numerical input',
    description: 'Title for numerical input problem type',
  },
  'problemType.numericalresponse.description': {
    id: 'authoring.problemeditor.problemtype.numeric.description',
    defaultMessage: 'Specify one or more correct numeric answers, submitted in a response field.',
    description: 'Preview description for numerical input problem type',
  },
  'problemType.stringresponse.title': {
    id: 'authoring.problemeditor.problemtype.textinput.title',
    defaultMessage: 'Text input',
    description: 'Title for text input problem type',
  },
  'problemType.stringresponse.description': {
    id: 'authoring.problemeditor.problemtype.textinput.description',
    defaultMessage: 'Specify one or more correct text answers, including numbers and special characters, submitted in a response field.',
    description: 'Preview description for text input problem type',
  },
  'problemType.advanced.title': {
    id: 'authoring.problemeditor.problemtype.advanced.title',
    defaultMessage: 'Advanced Problem',
    description: 'Title for advanced problem type',
  },
  'problemType.advanced.description': {
    id: 'authoring.problemeditor.problemtype.advanced.description',
    defaultMessage: 'An Advanced Problem Type',
    description: 'Description for advanced problem type',
  },
  problemSupportStatus: {
    id: 'authoring.problemEditor.advanceProblem.supportStatus',
    defaultMessage: '{supportStatus}',
    description: 'Text for advance problem type\'s support status',
  },
  supportStatusTooltipMessage: {
    id: 'authoring.problemEditor.advanceProblem.supportStatus.tooltipMessage',
    defaultMessage: `{supportStatus,  select,
      Provisional {Provisionally supported tools might lack the robustness of functionality
        that your courses require. edX does not have control over the quality of the software,
        or of the content that can be provided using these tools.
        \n \n
        Test these tools thoroughly before using them in your course, especially in graded
        sections. Complete documentation might not be available for provisionally supported
        tools, or documentation might be available from sources other than edX.}
      Not_supported {Tools with no support are not maintained by edX, and might be deprecated
        in the future. They are not recommended for use in courses due to non-compliance with one
        or more of the base requirements, such as testing, accessibility, internationalization,
        and documentation.}
      other { }
    }`,
    description: 'Message for support status tooltip',
  },
  problemTextInPreviewTitle: {
    id: 'authoring.problemEditor.preview.problemTextInPreviewTitle',
    defaultMessage: 'problem',
    description: 'Problem text in title for the problem preview column',
  },
  previewTitle: {
    id: 'authoring.problemEditor.preview.title',
    defaultMessage: '{previewTitle} problem',
    description: 'Title for the problem preview column',
  },
  previewAltText: {
    id: 'authoring.problemEditor.preview.altText',
    defaultMessage: `A preview illustration of a {problemType, select,
      multiplechoiceresponse {single select}
      stringreponse {text input}
      numericalresponse {numerical input}
      optionresponse {dropdown}
      choiceresponse {multiple select}
      other {null}
    } problem`,
    description: 'Alt text for the illustration of the problem preview',
  },
  previewDescription: {
    id: 'authoring.problemEditor.preview.description',
    defaultMessage: '{previewDescription}',
    description: 'Description of the selected problem type',
  },
  learnMoreButtonLabel: {
    id: 'authoring.problemEditor.learnMoreButtonLabel.label',
    defaultMessage: 'Learn more',
    description: 'Label for Learn more button',
  },
  learnMoreAdvancedButtonLabel: {
    id: 'authoring.problemEditor.advanceProblem.learnMoreButtonLabel.label',
    defaultMessage: 'Learn more about advanced problem types',
    description: 'Label for Learn more about advanced problem types button',
  },
});

export default messages;
