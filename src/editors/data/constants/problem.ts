import { defineMessages } from '@edx/frontend-platform/i18n';
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

export const ProblemTypes = StrictDict({
  [ProblemTypeKeys.SINGLESELECT]: {
    title: ProblemTypesTitleMessages[ProblemTypeKeys.SINGLESELECT].defaultMessage,
    titleMessage: ProblemTypesTitleMessages[ProblemTypeKeys.SINGLESELECT],
    preview: singleSelect,
    previewDescription: ProblemTypesPreviewDescription[ProblemTypeKeys.SINGLESELECT],
    description: ProblemTypesDescription[ProblemTypeKeys.SINGLESELECT],
    helpLink: 'https://docs.openedx.org/en/latest/educators/concepts/exercise_tools/about_multi_select.html',
    prev: ProblemTypeKeys.TEXTINPUT,
    next: ProblemTypeKeys.MULTISELECT,
    template: basicOlxTemplates.singleSelect,
  },
  [ProblemTypeKeys.MULTISELECT]: {
    title: ProblemTypesTitleMessages[ProblemTypeKeys.MULTISELECT].defaultMessage,
    titleMessage: ProblemTypesTitleMessages[ProblemTypeKeys.MULTISELECT],
    preview: multiSelect,
    previewDescription: ProblemTypesPreviewDescription[ProblemTypeKeys.MULTISELECT],
    description: ProblemTypesDescription[ProblemTypeKeys.MULTISELECT],
    helpLink: 'https://docs.openedx.org/en/latest/educators/how-tos/course_development/exercise_tools/add_multi_select.html',
    next: ProblemTypeKeys.DROPDOWN,
    prev: ProblemTypeKeys.SINGLESELECT,
    template: basicOlxTemplates.multiSelect,
  },
  [ProblemTypeKeys.DROPDOWN]: {
    title: ProblemTypesTitleMessages[ProblemTypeKeys.DROPDOWN].defaultMessage,
    titleMessage: ProblemTypesTitleMessages[ProblemTypeKeys.DROPDOWN],
    preview: dropdown,
    previewDescription: ProblemTypesPreviewDescription[ProblemTypeKeys.DROPDOWN],
    description: ProblemTypesDescription[ProblemTypeKeys.DROPDOWN],
    helpLink: 'https://docs.openedx.org/en/latest/educators/how-tos/course_development/exercise_tools/add_dropdown.html',
    next: ProblemTypeKeys.NUMERIC,
    prev: ProblemTypeKeys.MULTISELECT,
    template: basicOlxTemplates.dropdown,
  },
  [ProblemTypeKeys.NUMERIC]: {
    title: ProblemTypesTitleMessages[ProblemTypeKeys.NUMERIC].defaultMessage,
    titleMessage: ProblemTypesTitleMessages[ProblemTypeKeys.NUMERIC],
    preview: numericalInput,
    previewDescription: ProblemTypesPreviewDescription[ProblemTypeKeys.NUMERIC],
    description: ProblemTypesDescription[ProblemTypeKeys.NUMERIC],
    helpLink: 'https://docs.openedx.org/en/latest/educators/how-tos/course_development/exercise_tools/manage_numerical_input_problem.html',
    next: ProblemTypeKeys.TEXTINPUT,
    prev: ProblemTypeKeys.DROPDOWN,
    template: basicOlxTemplates.numeric,
  },
  [ProblemTypeKeys.TEXTINPUT]: {
    title: ProblemTypesTitleMessages[ProblemTypeKeys.TEXTINPUT].defaultMessage,
    titleMessage: ProblemTypesTitleMessages[ProblemTypeKeys.TEXTINPUT],
    preview: textInput,
    previewDescription: ProblemTypesPreviewDescription[ProblemTypeKeys.TEXTINPUT],
    description: ProblemTypesDescription[ProblemTypeKeys.TEXTINPUT],
    helpLink: 'https://docs.openedx.org/en/latest/educators/how-tos/course_development/exercise_tools/add_text_input.html',
    prev: ProblemTypeKeys.NUMERIC,
    next: ProblemTypeKeys.SINGLESELECT,
    template: basicOlxTemplates.textInput,
  },
  [ProblemTypeKeys.ADVANCED]: {
    title: ProblemTypesTitleMessages[ProblemTypeKeys.ADVANCED].defaultMessage,
    titleMessage: ProblemTypesTitleMessages[ProblemTypeKeys.ADVANCED],
    previewDescription: ProblemTypesPreviewDescription[ProblemTypeKeys.ADVANCED],
    preview: ('<div />'),
    description: ProblemTypesDescription[ProblemTypeKeys.ADVANCED],
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
} as const);

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
} as const);

export const AdvanceProblems = StrictDict({
  [AdvanceProblemKeys.BLANK]: {
    title: AdvanceProblemsTitleMessages[AdvanceProblemKeys.BLANK].defaultMessage,
    titleMessage: AdvanceProblemsTitleMessages[AdvanceProblemKeys.BLANK],
    status: AdvanceProblemsStatus.empty,
    template: '<problem></problem>',
  },
  [AdvanceProblemKeys.CIRCUITSCHEMATIC]: {
    title: AdvanceProblemsTitleMessages[AdvanceProblemKeys.CIRCUITSCHEMATIC].defaultMessage,
    titleMessage: AdvanceProblemsTitleMessages[AdvanceProblemKeys.CIRCUITSCHEMATIC],
    status: AdvanceProblemsStatus.notSupported,
    template: advancedOlxTemplates.circuitSchematic,
  },
  [AdvanceProblemKeys.JSINPUT]: {
    title: AdvanceProblemsTitleMessages[AdvanceProblemKeys.JSINPUT].defaultMessage,
    titleMessage: AdvanceProblemsTitleMessages[AdvanceProblemKeys.JSINPUT],
    status: AdvanceProblemsStatus.empty,
    template: advancedOlxTemplates.jsInputResponse,
  },
  [AdvanceProblemKeys.CUSTOMGRADER]: {
    title: AdvanceProblemsTitleMessages[AdvanceProblemKeys.CUSTOMGRADER].defaultMessage,
    titleMessage: AdvanceProblemsTitleMessages[AdvanceProblemKeys.CUSTOMGRADER],
    status: AdvanceProblemsStatus.provisional,
    template: advancedOlxTemplates.customGrader,
  },
  [AdvanceProblemKeys.IMAGE]: {
    title: AdvanceProblemsTitleMessages[AdvanceProblemKeys.IMAGE].defaultMessage,
    titleMessage: AdvanceProblemsTitleMessages[AdvanceProblemKeys.IMAGE],
    status: AdvanceProblemsStatus.notSupported,
    template: advancedOlxTemplates.imageResponse,
  },
  [AdvanceProblemKeys.FORMULA]: {
    title: AdvanceProblemsTitleMessages[AdvanceProblemKeys.FORMULA].defaultMessage,
    titleMessage: AdvanceProblemsTitleMessages[AdvanceProblemKeys.FORMULA],
    status: AdvanceProblemsStatus.empty,
    template: advancedOlxTemplates.formulaResponse,
  },
  [AdvanceProblemKeys.PROBLEMWITHHINT]: {
    title: AdvanceProblemsTitleMessages[AdvanceProblemKeys.PROBLEMWITHHINT].defaultMessage,
    titleMessage: AdvanceProblemsTitleMessages[AdvanceProblemKeys.PROBLEMWITHHINT],
    status: AdvanceProblemsStatus.notSupported,
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

export const ShowAnswerTypes = defineMessages({
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

// Useful for the block creation workflow.
export const problemTitles = new Set([...Object.values(ProblemTypes).map((problem) => problem.title),
  ...Object.values(AdvanceProblems).map((problem) => problem.title)]);
