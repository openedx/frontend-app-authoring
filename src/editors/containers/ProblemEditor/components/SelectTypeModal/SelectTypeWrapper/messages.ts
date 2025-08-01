import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({

  selectTypeTitle: {
    id: 'authoring.problemEditor.selectType.title',
    defaultMessage: 'Select problem type',
    description: 'Title for select problem type modal',
  },
  cancelButtonLabel: {
    id: 'authoring.problemeditor.selecttype.cancelButton.label',
    defaultMessage: 'Cancel',
    description: 'Label for cancel button.',
  },
  cancelButtonAriaLabel: {
    id: 'authoring.problemeditor.selecttype.cancelButton.ariaLabel',
    defaultMessage: 'Cancel',
    description: 'Screen reader label for cancel button.',
  },
  selectButtonLabel: {
    id: 'authoring.problemeditor.selecttype.selectButton.label',
    defaultMessage: 'Select',
    description: 'Label for select button.',
  },
  selectButtonAriaLabel: {
    id: 'authoring.problemeditor.selecttype.selectButton.ariaLabel',
    defaultMessage: 'Select',
    description: 'Screen reader label for select button.',
  },

  // Problem Type Titles
  singleSelectTitle: {
    id: 'authoring.problemeditor.problemtype.singleselect.title',
    defaultMessage: 'Single select',
    description: 'Title for single select problem type',
  },
  multiSelectTitle: {
    id: 'authoring.problemeditor.problemtype.multiselect.title',
    defaultMessage: 'Multi-select',
    description: 'Title for multi-select problem type',
  },
  dropdownTitle: {
    id: 'authoring.problemeditor.problemtype.dropdown.title',
    defaultMessage: 'Dropdown',
    description: 'Title for dropdown problem type',
  },
  numericalInputTitle: {
    id: 'authoring.problemeditor.problemtype.numeric.title',
    defaultMessage: 'Numerical input',
    description: 'Title for numerical input problem type',
  },
  textInputTitle: {
    id: 'authoring.problemeditor.problemtype.textinput.title',
    defaultMessage: 'Text input',
    description: 'Title for text input problem type',
  },
  advancedProblemTitle: {
    id: 'authoring.problemeditor.problemtype.advanced.title',
    defaultMessage: 'Advanced Problem',
    description: 'Title for advanced problem type',
  },

  // Advanced Problem Type Titles
  blankProblemTitle: {
    id: 'authoring.problemeditor.advancedproblemtype.blank.title',
    defaultMessage: 'Blank problem',
    description: 'Title for blank advanced problem type',
  },
  circuitSchematicTitle: {
    id: 'authoring.problemeditor.advancedproblemtype.circuitschematic.title',
    defaultMessage: 'Circuit schematic builder',
    description: 'Title for circuit schematic builder advanced problem type',
  },
  customJavaScriptTitle: {
    id: 'authoring.problemeditor.advancedproblemtype.jsinput.title',
    defaultMessage: 'Custom JavaScript display and grading',
    description: 'Title for custom JavaScript display and grading advanced problem type',
  },
  customPythonTitle: {
    id: 'authoring.problemeditor.advancedproblemtype.customgrader.title',
    defaultMessage: 'Custom Python-evaluated input',
    description: 'Title for custom Python-evaluated input advanced problem type',
  },
  imageMappedTitle: {
    id: 'authoring.problemeditor.advancedproblemtype.image.title',
    defaultMessage: 'Image mapped input',
    description: 'Title for image mapped input advanced problem type',
  },
  mathExpressionTitle: {
    id: 'authoring.problemeditor.advancedproblemtype.formula.title',
    defaultMessage: 'Math expression input',
    description: 'Title for math expression input advanced problem type',
  },
  problemWithHintTitle: {
    id: 'authoring.problemeditor.advancedproblemtype.problemwithhint.title',
    defaultMessage: 'Problem with adaptive hint',
    description: 'Title for problem with adaptive hint advanced problem type',
  },

  // Problem Type Descriptions
  singleSelectDescription: {
    id: 'authoring.problemeditor.problemtype.singleselect.description',
    defaultMessage: 'Learners must select the correct answer from a list of possible options.',
    description: 'Preview description for single select problem type',
  },
  multiSelectDescription: {
    id: 'authoring.problemeditor.problemtype.multiselect.description',
    defaultMessage: 'Learners must select all correct answers from a list of possible options.',
    description: 'Preview description for multi-select problem type',
  },
  dropdownDescription: {
    id: 'authoring.problemeditor.problemtype.dropdown.description',
    defaultMessage: 'Learners must select the correct answer from a list of possible options',
    description: 'Preview description for dropdown problem type',
  },
  numericalInputDescription: {
    id: 'authoring.problemeditor.problemtype.numeric.description',
    defaultMessage: 'Specify one or more correct numeric answers, submitted in a response field.',
    description: 'Preview description for numerical input problem type',
  },
  textInputDescription: {
    id: 'authoring.problemeditor.problemtype.textinput.description',
    defaultMessage: 'Specify one or more correct text answers, including numbers and special characters, submitted in a response field.',
    description: 'Preview description for text input problem type',
  },
  advancedProblemDescription: {
    id: 'authoring.problemeditor.problemtype.advanced.description',
    defaultMessage: 'An Advanced Problem Type',
    description: 'Description for advanced problem type',
  },

  // Problem Type Instructions
  singleSelectInstruction: {
    id: 'authoring.problemeditor.problemtype.singleselect.instruction',
    defaultMessage: 'Enter your single select answers below and select which choices are correct. Learners must choose one correct answer.',
    description: 'Instruction for single select problem type',
  },
  multiSelectInstruction: {
    id: 'authoring.problemeditor.problemtype.multiselect.instruction',
    defaultMessage: 'Enter your multi select answers below and select which choices are correct. Learners must choose all correct answers.',
    description: 'Instruction for multi-select problem type',
  },
  dropdownInstruction: {
    id: 'authoring.problemeditor.problemtype.dropdown.instruction',
    defaultMessage: 'Enter your dropdown answers below and select which choice is correct. Learners must select one correct answer.',
    description: 'Instruction for dropdown problem type',
  },
  numericalInputInstruction: {
    id: 'authoring.problemeditor.problemtype.numeric.instruction',
    defaultMessage: 'Enter correct numerical input answers below. Learners must enter one correct answer.',
    description: 'Instruction for numerical input problem type',
  },
  textInputInstruction: {
    id: 'authoring.problemeditor.problemtype.textinput.instruction',
    defaultMessage: 'Enter your text input answers below and select which choices are correct. Learners must enter one correct answer.',
    description: 'Instruction for text input problem type',
  },
});

export default messages;
