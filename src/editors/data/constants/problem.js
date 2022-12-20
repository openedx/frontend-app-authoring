import { StrictDict } from '../../utils';

export const ProblemTypeKeys = StrictDict({
  TEXTINPUT: 'stringresponse',
  NUMERIC: 'numericalresponse',
  DROPDOWN: 'optionresponse',
  MULTISELECT: 'choiceresponse',
  SINGLESELECT: 'multiplechoiceresponse',
});

export const ProblemTypes = StrictDict({
  [ProblemTypeKeys.SINGLESELECT]: {
    title: 'Single Select Problem',
    preview: ('<div />'),
    description: 'Specify one correct answer from a list of possible options',
    helpLink: 'something.com',
  },
  [ProblemTypeKeys.MULTISELECT]: {
    title: 'Multi Select Problem',
    preview: ('<div />'),
    description: 'Specify one or more correct answers from a list of possible options.',
    helpLink: 'something.com',
  },
  [ProblemTypeKeys.DROPDOWN]: {
    title: 'Dropdown Problem',
    preview: ('<div />'),
    description: 'Specify one correct answer from a list of possible options, selected in a dropdown menu.',
    helpLink: 'something.com',
  },
  [ProblemTypeKeys.NUMERIC]: {
    title: 'Numeric Response Problem',
    preview: ('<div />'),
    description: 'Specify one or more correct numeric answers, submitted in a response field.',
    helpLink: 'something.com',
  },
  [ProblemTypeKeys.TEXTINPUT]: {
    title: 'Text Input Problem',
    preview: ('<div />'),
    description: 'Specify one or more correct text answers, including numbers and special characters, submitted in a response field.',
    helpLink: 'something.com',
  },
});

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
});

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
});
