import { defineMessages } from '@edx/frontend-platform/i18n';
import { ProblemTypeKeys, AdvanceProblemKeys } from './problemTypes';

export const ProblemTypesTitleMessages = defineMessages({
  [ProblemTypeKeys.SINGLESELECT]: {
    id: 'authoring.problemeditor.problemtype.title.singleselect',
    defaultMessage: 'Single select',
  },
  [ProblemTypeKeys.MULTISELECT]: {
    id: 'authoring.problemeditor.problemtype.title.multiSelect',
    defaultMessage: 'Multi-select',
  },
  [ProblemTypeKeys.DROPDOWN]: {
    id: 'authoring.problemeditor.problemtype.title.dropdown',
    defaultMessage: 'Dropdown',
  },
  [ProblemTypeKeys.NUMERIC]: {
    id: 'authoring.problemeditor.problemtype.title.numeric',
    defaultMessage: 'Numerical input',
  },
  [ProblemTypeKeys.TEXTINPUT]: {
    id: 'authoring.problemeditor.problemtype.title.textInput',
    defaultMessage: 'Text input',
  },
  [ProblemTypeKeys.ADVANCED]: {
    id: 'authoring.problemeditor.problemtype.title.advanced',
    defaultMessage: 'Advanced Problem',
  },
});

export const ProblemTypesPreviewDescription = defineMessages({
  [ProblemTypeKeys.SINGLESELECT]: {
    id: 'authoring.problemeditor.problemtype.previewDescription.singleselect',
    defaultMessage: 'Learners must select the correct answer from a list of possible options.',
  },
  [ProblemTypeKeys.MULTISELECT]: {
    id: 'authoring.problemeditor.problemtype.previewDescription.multiselect',
    defaultMessage: 'Learners must select all correct answers from a list of possible options.',
  },
  [ProblemTypeKeys.DROPDOWN]: {
    id: 'authoring.problemeditor.problemtype.previewDescription.dropdown',
    defaultMessage: 'Learners must select the correct answer from a list of possible options',
  },
  [ProblemTypeKeys.NUMERIC]: {
    id: 'authoring.problemeditor.problemtype.previewDescription.numeric',
    defaultMessage: 'Specify one or more correct numeric answers, submitted in a response field.',
  },
  [ProblemTypeKeys.TEXTINPUT]: {
    id: 'authoring.problemeditor.problemtype.previewDescription.textinput',
    defaultMessage: 'Specify one or more correct text answers, including numbers and special characters, submitted in a response field.',
  },
  [ProblemTypeKeys.ADVANCED]: {
    id: 'authoring.problemeditor.problemtype.previewDescription.advanced',
    defaultMessage: 'Specify an advanced problem.',
  },
});

export const ProblemTypesDescription = defineMessages({
  [ProblemTypeKeys.SINGLESELECT]: {
    id: 'authoring.problemeditor.problemtype.description.singleselect',
    defaultMessage: 'Enter your single select answers below and select which choices are correct. Learners must choose one correct answer.',
  },
  [ProblemTypeKeys.MULTISELECT]: {
    id: 'authoring.problemeditor.problemtype.description.multiselect',
    defaultMessage: 'Enter your multi select answers below and select which choices are correct. Learners must choose all correct answers.',
  },
  [ProblemTypeKeys.DROPDOWN]: {
    id: 'authoring.problemeditor.problemtype.description.dropdown',
    defaultMessage: 'Enter your dropdown answers below and select which choice is correct. Learners must select one correct answer.',
  },
  [ProblemTypeKeys.NUMERIC]: {
    id: 'authoring.problemeditor.problemtype.description.numeric',
    defaultMessage: 'Enter correct numerical input answers below. Learners must enter one correct answer.',
  },
  [ProblemTypeKeys.TEXTINPUT]: {
    id: 'authoring.problemeditor.problemtype.description.textinput',
    defaultMessage: 'Enter your text input answers below and select which choices are correct. Learners must enter one correct answer.',
  },
  [ProblemTypeKeys.ADVANCED]: {
    id: 'authoring.problemeditor.problemtype.description.advanced',
    defaultMessage: 'An Advanced Problem Type.',
  },
});

export const AdvanceProblemsTitleMessages = defineMessages({
  [AdvanceProblemKeys.BLANK]: {
    id: 'authoring.problemeditor.settings.advanceProblems.blank',
    defaultMessage: 'Blank problem',
  },
  [AdvanceProblemKeys.CIRCUITSCHEMATIC]: {
    id: 'authoring.problemeditor.settings.advanceProblems.circuitSchematic',
    defaultMessage: 'Circuit schematic builder',
  },
  [AdvanceProblemKeys.JSINPUT]: {
    id: 'authoring.problemeditor.settings.advanceProblems.jsInput',
    defaultMessage: 'Custom JavaScript display and grading',
  },
  [AdvanceProblemKeys.CUSTOMGRADER]: {
    id: 'authoring.problemeditor.settings.advanceProblems.customGrader',
    defaultMessage: 'Custom Python-evaluated input',
  },
  [AdvanceProblemKeys.IMAGE]: {
    id: 'authoring.problemeditor.settings.advanceProblems.image',
    defaultMessage: 'Image mapped input',
  },
  [AdvanceProblemKeys.FORMULA]: {
    id: 'authoring.problemeditor.settings.advanceProblems.formula',
    defaultMessage: 'Math expression input',
  },
  [AdvanceProblemKeys.PROBLEMWITHHINT]: {
    id: 'authoring.problemeditor.settings.advanceProblems.problemWithHint',
    defaultMessage: 'Problem with adaptive hint',
  },
});

export const AdvanceProblemsStatus = defineMessages({
  empty: {
    id: 'authoring.problemeditor.settings.advanceProblems.status.empty',
    defaultMessage: '',
  },
  notSupported: {
    id: 'authoring.problemeditor.settings.advanceProblems.status.notSupported',
    defaultMessage: 'Not supported',
  },
  provisional: {
    id: 'authoring.problemeditor.settings.advanceProblems.status.provisional',
    defaultMessage: 'Provisional',
  },
});
