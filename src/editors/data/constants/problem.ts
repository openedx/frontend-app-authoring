import { StrictDict } from '../../utils';
import singleSelect from '../images/singleSelect.png';
import multiSelect from '../images/multiSelect.png';
import dropdown from '../images/dropdown.png';
import numericalInput from '../images/numericalInput.png';
import textInput from '../images/textInput.png';
import advancedOlxTemplates from './advancedOlxTemplates';
import basicOlxTemplates from './basicOlxTemplates';

export const ProblemTypeKeys = StrictDict({
  SINGLESELECT: 'multiplechoiceresponse',
  MULTISELECT: 'choiceresponse',
  DROPDOWN: 'optionresponse',
  NUMERIC: 'numericalresponse',
  TEXTINPUT: 'stringresponse',
  ADVANCED: 'advanced',
} as const);
export type ProblemType = typeof ProblemTypeKeys[keyof typeof ProblemTypeKeys];

export const ProblemTypes = StrictDict({
  [ProblemTypeKeys.SINGLESELECT]: {
    title: 'Single select',
    preview: singleSelect,
    previewDescription: 'Learners must select the correct answer from a list of possible options.',
    description: 'Enter your single select answers below and select which choices are correct. Learners must choose one correct answer.',
    helpLink: 'https://edx.readthedocs.io/projects/edx-partner-course-staff/en/latest/exercises_tools/multiple_choice.html',
    prev: ProblemTypeKeys.TEXTINPUT,
    next: ProblemTypeKeys.MULTISELECT,
    template: basicOlxTemplates.singleSelect,

  },
  [ProblemTypeKeys.MULTISELECT]: {
    title: 'Multi-select',
    preview: multiSelect,
    previewDescription: 'Learners must select all correct answers from a list of possible options.',
    description: 'Enter your multi select answers below and select which choices are correct. Learners must choose all correct answers.',
    helpLink: 'https://edx.readthedocs.io/projects/edx-partner-course-staff/en/latest/exercises_tools/checkbox.html',
    next: ProblemTypeKeys.DROPDOWN,
    prev: ProblemTypeKeys.SINGLESELECT,
    template: basicOlxTemplates.multiSelect,
  },
  [ProblemTypeKeys.DROPDOWN]: {
    title: 'Dropdown',
    preview: dropdown,
    previewDescription: 'Learners must select the correct answer from a list of possible options',
    description: 'Enter your dropdown answers below and select which choice is correct. Learners must select one correct answer.',
    helpLink: 'https://edx.readthedocs.io/projects/edx-partner-course-staff/en/latest/exercises_tools/dropdown.html',
    next: ProblemTypeKeys.NUMERIC,
    prev: ProblemTypeKeys.MULTISELECT,
    template: basicOlxTemplates.dropdown,
  },
  [ProblemTypeKeys.NUMERIC]: {
    title: 'Numerical input',
    preview: numericalInput,
    previewDescription: 'Specify one or more correct numeric answers, submitted in a response field.',
    description: 'Enter correct numerical input answers below. Learners must enter one correct answer.',
    helpLink: 'https://edx.readthedocs.io/projects/edx-partner-course-staff/en/latest/exercises_tools/numerical_input.html',
    next: ProblemTypeKeys.TEXTINPUT,
    prev: ProblemTypeKeys.DROPDOWN,
    template: basicOlxTemplates.numeric,
  },
  [ProblemTypeKeys.TEXTINPUT]: {
    title: 'Text input',
    preview: textInput,
    previewDescription: 'Specify one or more correct text answers, including numbers and special characters, submitted in a response field.',
    description: 'Enter your text input answers below and select which choices are correct. Learners must enter one correct answer.',
    helpLink: 'https://edx.readthedocs.io/projects/edx-partner-course-staff/en/latest/exercises_tools/text_input.html',
    prev: ProblemTypeKeys.NUMERIC,
    next: ProblemTypeKeys.SINGLESELECT,
    template: basicOlxTemplates.textInput,
  },
  [ProblemTypeKeys.ADVANCED]: {
    title: 'Advanced Problem',
    preview: ('<div />'),
    description: 'An Advanced Problem Type',
    helpLink: 'something.com',
  },
});

export const AdvanceProblemKeys = StrictDict({
  BLANK: 'blankadvanced',
  CIRCUITSCHEMATIC: 'circuitschematic',
  JSINPUT: 'jsinputresponse',
  CUSTOMGRADER: 'customgrader',
  IMAGE: 'imageresponse',
  FORMULA: 'formularesponse',
  PROBLEMWITHHINT: 'problemwithhint',
} as const);
export type AdvancedProblemType = typeof AdvanceProblemKeys[keyof typeof AdvanceProblemKeys];

export function isAdvancedProblemType(pt: ProblemType | AdvancedProblemType): pt is AdvancedProblemType {
  return Object.values(AdvanceProblemKeys).includes(pt as any);
}

export const AdvanceProblems = StrictDict({
  [AdvanceProblemKeys.BLANK]: {
    title: 'Blank problem',
    status: '',
    template: '<problem></problem>',
  },
  [AdvanceProblemKeys.CIRCUITSCHEMATIC]: {
    title: 'Circuit schematic builder',
    status: 'Not supported',
    template: advancedOlxTemplates.circuitSchematic,
  },
  [AdvanceProblemKeys.JSINPUT]: {
    title: 'Custom JavaScript display and grading',
    status: '',
    template: advancedOlxTemplates.jsInputResponse,
  },
  [AdvanceProblemKeys.CUSTOMGRADER]: {
    title: 'Custom Python-evaluated input',
    status: 'Provisional',
    template: advancedOlxTemplates.customGrader,
  },
  [AdvanceProblemKeys.IMAGE]: {
    title: 'Image mapped input',
    status: 'Not supported',
    template: advancedOlxTemplates.imageResponse,
  },
  [AdvanceProblemKeys.FORMULA]: {
    title: 'Math expression input',
    status: '',
    template: advancedOlxTemplates.formulaResponse,
  },
  [AdvanceProblemKeys.PROBLEMWITHHINT]: {
    title: 'Problem with adaptive hint',
    status: 'Not supported',
    template: advancedOlxTemplates.problemWithHint,
  },
} as const);

export const ShowAnswerTypesKeys = StrictDict({
  ALWAYS: 'always',
  ANSWERED: 'answered',
  ATTEMPTED: 'attempted',
  CLOSED: 'closed',
  FINISHED: 'finished',
  CORRECT_OR_PAST_DUE: 'correct_or_past_due',
  PAST_DUE: 'past_due',
  NEVER: 'never',
  AFTER_SOME_NUMBER_OF_ATTEMPTS: 'after_attempts',
  AFTER_ALL_ATTEMPTS: 'after_all_attempts',
  AFTER_ALL_ATTEMPTS_OR_CORRECT: 'after_all_attempts_or_correct',
  ATTEMPTED_NO_PAST_DUE: 'attempted_no_past_due',
} as const);

export const ShowAnswerTypes = StrictDict({
  [ShowAnswerTypesKeys.ALWAYS]: {
    id: 'authoring.problemeditor.settings.showanswertype.always',
    defaultMessage: 'Always',
  },
  [ShowAnswerTypesKeys.ANSWERED]: {
    id: 'authoring.problemeditor.settings.showanswertype.answered',
    defaultMessage: 'Answered',
  },
  [ShowAnswerTypesKeys.ATTEMPTED]: {
    id: 'authoring.problemeditor.settings.showanswertype.attempted',
    defaultMessage: 'Attempted or Past Due',
  },
  [ShowAnswerTypesKeys.CLOSED]: {
    id: 'authoring.problemeditor.settings.showanswertype.closed',
    defaultMessage: 'Closed',
  },
  [ShowAnswerTypesKeys.FINISHED]: {
    id: 'authoring.problemeditor.settings.showanswertype.finished',
    defaultMessage: 'Finished',
  },
  [ShowAnswerTypesKeys.CORRECT_OR_PAST_DUE]: {
    id: 'authoring.problemeditor.settings.showanswertype.correct_or_past_due',
    defaultMessage: 'Correct or Past Due',
  },
  [ShowAnswerTypesKeys.PAST_DUE]: {
    id: 'authoring.problemeditor.settings.showanswertype.past_due',
    defaultMessage: 'Past Due',
  },
  [ShowAnswerTypesKeys.NEVER]: {
    id: 'authoring.problemeditor.settings.showanswertype.never',
    defaultMessage: 'Never',
  },
  [ShowAnswerTypesKeys.AFTER_SOME_NUMBER_OF_ATTEMPTS]: {
    id: 'authoring.problemeditor.settings.showanswertype.after_attempts',
    defaultMessage: 'After Some Number of Attempts',
  },
  [ShowAnswerTypesKeys.AFTER_ALL_ATTEMPTS]: {
    id: 'authoring.problemeditor.settings.showanswertype.after_all_attempts',
    defaultMessage: 'After All Attempts',
  },
  [ShowAnswerTypesKeys.AFTER_ALL_ATTEMPTS_OR_CORRECT]: {
    id: 'authoring.problemeditor.settings.showanswertype.after_all_attempts_or_correct',
    defaultMessage: 'After All Attempts or Correct',
  },
  [ShowAnswerTypesKeys.ATTEMPTED_NO_PAST_DUE]: {
    id: 'authoring.problemeditor.settings.showanswertype.attempted_no_past_due',
    defaultMessage: 'Attempted',
  },
} as const);

export const RandomizationTypesKeys = StrictDict({
  NEVER: 'never',
  ALWAYS: 'always',
  ONRESET: 'onreset',
  PERSTUDENT: 'per_student',
} as const);

export const RandomizationTypes = StrictDict({
  [RandomizationTypesKeys.ALWAYS]: {
    id: 'authoring.problemeditor.settings.RandomizationTypes.always',
    defaultMessage: 'Always',
  },
  [RandomizationTypesKeys.NEVER]: {
    id: 'authoring.problemeditor.settings.RandomizationTypes.never',
    defaultMessage: 'Never',
  },
  [RandomizationTypesKeys.ONRESET]: {
    id: 'authoring.problemeditor.settings.RandomizationTypes.onreset',
    defaultMessage: 'On Reset',
  },
  [RandomizationTypesKeys.PERSTUDENT]: {
    id: 'authoring.problemeditor.settings.RandomizationTypes.perstudent',
    defaultMessage: 'Per Student',
  },
} as const);

export const RichTextProblems = [ProblemTypeKeys.SINGLESELECT, ProblemTypeKeys.MULTISELECT] as const;

export const settingsOlxAttributes = [
  '@_display_name',
  '@_weight',
  '@_max_attempts',
  '@_showanswer',
  '@_show_reset_button',
  '@_submission_wait_seconds',
  '@_attempts_before_showanswer_button',
] as const;

export const ignoredOlxAttributes = [
  // '@_markdown',  // Not sure if this is safe to ignore; some tests seem to indicate it's not.
  '@_url_name',
  '@_x-is-pointer-node',
] as const;
