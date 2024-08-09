export const checklistWithFeebackHints = {
  state: {
    rawOLX: '<problem>\n    <choiceresponse>\n        <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for checkboxes with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>\n        <label>Add the question text, or prompt, here. This text is required.</label>\n        <description>You can add an optional tip or note related to the prompt like this.</description>\n        <checkboxgroup>\n            <choice correct="true">a correct answer\n                <choicehint selected="true">You can specify optional feedback that appears after the learner selects and submits this answer.</choicehint>\n                <choicehint selected="false">You can specify optional feedback that appears after the learner clears and submits this answer.</choicehint>\n            </choice>\n            <choice correct="false">an incorrect answer\n            </choice>\n            <choice correct="false">an incorrect answer\n                <choicehint selected="true">You can specify optional feedback for none, all, or a subset of the answers.</choicehint>\n                <choicehint selected="false">You can specify optional feedback for selected answers, cleared answers, or both.</choicehint>\n            </choice>\n            <choice correct="true">a correct answer\n            </choice>\n            <compoundhint value="A B D">You can specify optional feedback for a combination of answers which appears after the specified set of answers is submitted.</compoundhint>\n            <compoundhint value="A B C D">You can specify optional feedback for one, several, or all answer combinations.</compoundhint>\n        </checkboxgroup>\n    </choiceresponse>\n\n    <demandhint>\n        <hint>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</hint>\n        <hint>If you add more than one hint, a different hint appears each time learners select the hint button.</hint>\n    </demandhint>\n</problem>\n',
    problemType: 'MULTISELECT',
    question: 'You can use this template as a guide to the simple editor markdown and OLX markup to use for checkboxes with hints and feedback problems. Edit this component to replace this template with your own assessment.\n\n<p>Add the question text, or prompt, here. This text is required.||You can add an optional tip or note related to the prompt like this.</p>\n\n',
    answers: [
      {
        id: 'A',
        title: 'a correct answer',
        correct: true,
        selectedFeedback: ' You can specify optional feedback that appears after the learner selects and submits this answer.',
        unselectedFeedback: 'You can specify optional feedback that appears after the learner clears and submits this answer.',
      },
      {
        id: 'B',
        title: 'an incorrect answer',
        correct: false,
        selectedFeedback: '',
        unselectedFeedback: '',
      },
      {
        id: 'C',
        title: 'an incorrect answer',
        correct: false,
        selectedFeedback: ' You can specify optional feedback for none, all, or a subset of the answers.',
        unselectedFeedback: 'You can specify optional feedback for selected answers, cleared answers, or both.',
      },
      {
        id: 'D',
        title: 'a correct answer',
        correct: true,
        selectedFeedback: '',
        unselectedFeedback: '',
      },
    ],
    groupFeedbackList: [
      {
        id: 3,
        answers: [
          'A',
          'B',
          'D',
        ],
        selectedFeedback: 'You can specify optional feedback for a combination of answers which appears after the specified set of answers is submitted.',
      },
      {
        id: 4,
        answers: [
          'A',
          'B',
          'C',
          'D',
        ],
        selectedFeedback: 'You can specify optional feedback for one, several, or all answer combinations.',
      },
    ],
    settings: {
      hints: [
        {
          id: 14,
          value: 'You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.',
        },
        {
          id: 15,
          value: 'If you add more than one hint, a different hint appears each time learners select the hint button.',
        },
      ],
      scoring: {
        weight: 2.5,
        attempts: {
          unlimited: false,
          number: 5,
        },
      },
      timeBetween: 3,
      showAnswer: {
        on: 'after_attempts',
        afterAttempts: 2,
      },
      showResetButton: true,
    },
  },
  metadata: {
    markdown: `You can use this template as a guide to the simple editor markdown and OLX markup to use for checkboxes with hints and feedback problems. Edit this component to replace this template with your own assessment.

>>Add the question text, or prompt, here. This text is required.||You can add an optional tip or note related to the prompt like this.<<
[x] a correct answer{{selected:  You can specify optional feedback that appears after the learner selects and submits this answer.},{unselected: You can specify optional feedback that appears after the learner clears and submits this answer.}}
[ ] an incorrect answer
[ ] an incorrect answer{{selected:  You can specify optional feedback for none, all, or a subset of the answers.},{unselected: You can specify optional feedback for selected answers, cleared answers, or both.}}
[x] a correct answer
||You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.||
||If you add more than one hint, a different hint appears each time learners select the hint button.||
{{ (( A B D )) You can specify optional feedback for a combination of answers which appears after the specified set of answers is submitted. }}
{{ (( A B C D )) You can specify optional feedback for one, several, or all answer combinations. }}
`,
    max_attempts: 5,
    show_reset_button: true,
    showanswer: 'after_attempts',
    attempts_before_showanswer_button: 2,
    submission_wait_seconds: 3,
    weight: 2.5,
  },
};

export const dropdownWithFeedbackHints = {
  state: {
    rawOLX: '<problem>\n    <optionresponse>\n        <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for dropdown with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>\n        <label>Add the question text, or prompt, here. This text is required.</label>\n        <description>You can add an optional tip or note related to the prompt like this. </description>\n        <optioninput>\n            <option correct="False">an incorrect answer <optionhint>You can specify optional feedback like this, which appears after this answer is submitted.</optionhint></option>\n            <option correct="True">the correct answer</option>\n            <option correct="False">an incorrect answer <optionhint>You can specify optional feedback for none, a subset, or all of the answers.</optionhint></option>\n        </optioninput>\n    </optionresponse>\n    <demandhint>\n      <hint>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</hint>\n      <hint>If you add more than one hint, a different hint appears each time learners select the hint button.</hint>\n    </demandhint>\n</problem>\n',
    problemType: 'DROPDOWN',
    question: 'You can use this template as a guide to the simple editor markdown and OLX markup to use for dropdown with hints and feedback problems. Edit this component to replace this template with your own assessment.\n<p>Add the question text, or prompt, here. This text is required.||You can add an optional tip or note related to the prompt like this. </p>\n',
    answers: [
      {
        id: 'A',
        title: 'an incorrect answer',
        correct: false,
        selectedFeedback: 'You can specify optional feedback like this, which appears after this answer is submitted.',
      },
      {
        id: 'B',
        title: 'the correct answer',
        correct: true,
        selectedFeedback: '',
      },
      {
        id: 'C',
        title: 'an incorrect answer',
        correct: false,
        selectedFeedback: 'You can specify optional feedback for none, a subset, or all of the answers.',
      },
    ],
    groupFeedbackList: [],
    settings: {
      hints: [
        {
          id: 8,
          value: 'You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.',
        },
        {
          id: 9,
          value: 'If you add more than one hint, a different hint appears each time learners select the hint button.',
        },
      ],
      scoring: {
        weight: 2.5,
        attempts: {
          unlimited: false,
          number: 5,
        },
      },
      timeBetween: 3,
      showAnswer: {
        on: 'after_attempts',
        afterAttempts: 2,
      },
      showResetButton: true,
    },
  },
  metadata: {
    markdown: `You can use this template as a guide to the simple editor markdown and OLX markup to use for dropdown with hints and feedback problems. Edit this component to replace this template with your own assessment.
>>Add the question text, or prompt, here. This text is required.||You can add an optional tip or note related to the prompt like this. <<
[[
 an incorrect answer {{You can specify optional feedback like this, which appears after this answer is submitted.}}
 (the correct answer)
 an incorrect answer {{You can specify optional feedback for none, a subset, or all of the answers.}}
]]
||You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.||
||If you add more than one hint, a different hint appears each time learners select the hint button.||
`,
    max_attempts: 5,
    show_reset_button: true,
    showanswer: 'after_attempts',
    attempts_before_showanswer_button: 2,
    submission_wait_seconds: 3,
    weight: 2.5,
  },
};

export const numericWithHints = {
  state: {
    rawOLX: '<problem>\n    <numericalresponse answer="100">\n        <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for numerical input with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>\n        <label>Add the question text, or prompt, here. This text is required.</label>\n        <description>You can add an optional tip or note related to the prompt like this.</description>\n        <responseparam type="tolerance" default="5"/>\n        <formulaequationinput/>\n        <correcthint>You can specify optional feedback like this, which appears after this answer is submitted.</correcthint>\n    </numericalresponse>\n    <demandhint>\n        <hint>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</hint>\n        <hint>If you add more than one hint, a different hint appears each time learners select the hint button.</hint>\n    </demandhint>\n</problem>\n',
    problemType: 'TEXTINPUT',
    question: 'You can use this template as a guide to the simple editor markdown and OLX markup to use for numerical input with hints and feedback problems. Edit this component to replace this template with your own assessment.\n\n<p>Add the question text, or prompt, here. This text is required.||You can add an optional tip or note related to the prompt like this. </p>\n\n',
    answers: [
      {
        id: 'A',
        title: '100 +-5',
        selectedFeedback: 'You can specify optional feedback like this, which appears after this answer is submitted.',
        correct: true,
      },
      {
        id: 'B',
        title: '90 +-5',
        selectedFeedback: 'You can specify optional feedback like this, which appears after this answer is submitted.',
        correct: true,
      },
      {
        id: 'C',
        title: '60 +-5',
        selectedFeedback: 'You can specify optional feedback like this, which appears after this answer is submitted.',
        correct: false,
      },
    ],
    groupFeedbackList: [],
    settings: {
      hints: [
        {
          id: 6,
          value: 'You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.',
        },
        {
          id: 7,
          value: 'If you add more than one hint, a different hint appears each time learners select the hint button.',
        },
      ],
      scoring: {
        weight: 2.5,
        attempts: {
          unlimited: false,
          number: 0,
        },
      },
      timeBetween: 0,
      showAnswer: {
        on: 'after_attempts',
        afterAttempts: 1,
      },
      showResetButton: false,
    },
  },
  metadata: {
    markdown: `You can use this template as a guide to the simple editor markdown and OLX markup to use for numerical input with hints and feedback problems. Edit this component to replace this template with your own assessment.

>>Add the question text, or prompt, here. This text is required.||You can add an optional tip or note related to the prompt like this. <<
=100 +-5 {{You can specify optional feedback like this, which appears after this answer is submitted.}}
or=90 +-5 {{You can specify optional feedback like this, which appears after this answer is submitted.}}
not=60 +-5 {{You can specify optional feedback like this, which appears after this answer is submitted.}}
||You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.||
||If you add more than one hint, a different hint appears each time learners select the hint button.||
`,
    weight: 2.5,
    max_attempts: 0,
    rerandomize: 'invalid_input',
    showanswer: 'invalid_input',
    attempts_before_showanswer_button: 2,
  },
};

export const textInputWithHints = {
  state: {
    rawOLX: '<problem>\n    <stringresponse answer="the correct answer" type="ci">\n        <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for text input with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>\n        <label>Add the question text, or prompt, here. This text is required.</label>\n        <description>You can add an optional tip or note related to the prompt like this.</description>\n        <correcthint>You can specify optional feedback like this, which appears after this answer is submitted.</correcthint>\n        <additional_answer answer="optional acceptable variant of the correct answer"/>\n        <stringequalhint answer="optional incorrect answer such as a frequent misconception">You can specify optional feedback for none, a subset, or all of the answers.</stringequalhint>\n        <textline size="20"/>\n    </stringresponse>\n    <demandhint>\n        <hint>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</hint>\n        <hint>If you add more than one hint, a different hint appears each time learners select the hint button.</hint>\n    </demandhint>\n</problem>\n',
    problemType: 'TEXTINPUT',
    question: 'You can use this template as a guide to the simple editor markdown and OLX markup to use for text input with hints and feedback problems. Edit this component to replace this template with your own assessment.\n\n<p>Add the question text, or prompt, here. This text is required.||You can add an optional tip or note related to the prompt like this. </p>\n\n',
    answers: [
      {
        id: 'A',
        title: 'the correct answer',
        selectedFeedback: 'You can specify optional feedback like this, which appears after this answer is submitted.',
        correct: true,
      },
      {
        id: 'B',
        title: 'optional acceptable variant of the correct answer',
        selectedFeedback: '',
        correct: true,
      },
      {
        id: 'C',
        title: 'optional incorrect answer such as a frequent misconception',
        selectedFeedback: 'You can specify optional feedback for none, a subset, or all of the answers.',
        correct: false,
      },
    ],
    groupFeedbackList: [],
    settings: {
      hints: [
        {
          id: 9,
          value: 'You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.',
        },
        {
          id: 10,
          value: 'If you add more than one hint, a different hint appears each time learners select the hint button.',
        },
      ],
      scoring: {
        weight: 2.5,
        attempts: {
          unlimited: false,
          number: 0,
        },
      },
      timeBetween: 0,
      showAnswer: {
        on: '',
        afterAttempts: 1,
      },
      showResetButton: false,
    },
  },
  metadata: {
    markdown: `You can use this template as a guide to the simple editor markdown and OLX markup to use for text input with hints and feedback problems. Edit this component to replace this template with your own assessment.

>>Add the question text, or prompt, here. This text is required.||You can add an optional tip or note related to the prompt like this. <<
=the correct answer {{You can specify optional feedback like this, which appears after this answer is submitted.}}
or=optional acceptable variant of the correct answer
not=optional incorrect answer such as a frequent misconception {{You can specify optional feedback for none, a subset, or all of the answers.}}
||You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.||
||If you add more than one hint, a different hint appears each time learners select the hint button.||
`,
    weight: 2.5,
  },
};

export const singleSelectWithHints = {
  state: {
    rawOLX: '<problem>\n<p>You can use this template as a guide to the simple editor markdown and OLX markup to use for checkboxes with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>\n\n<label>Add the question text, or prompt, here. This text is required.</label>\n<description>You can add an optional tip or note related to the prompt like this.</description>\n<multiplechoiceresponse>\n  <choicegroup type="MultipleChoice">\n    <choice correct="true">a correct answer <choicehint>selected: You can specify optional feedback that appears after the learner selects and submits this answer. }, { unselected: You can specify optional feedback that appears after the learner clears and submits this answer.</choicehint></choice>\n    <choice correct="false">an incorrect answer</choice>\n    <choice correct="false">an incorrect answer <choicehint>selected: You can specify optional feedback for none, all, or a subset of the answers. }, { unselected: You can specify optional feedback for selected answers, cleared answers, or both.</choicehint></choice>\n    <choice correct="false">an incorrect answer again</choice>\n  </choicegroup>\n</multiplechoiceresponse>\n<choiceresponse>\n  <checkboxgroup>\n    <compoundhint value="A B D">You can specify optional feedback for a combination of answers which appears after the specified set of answers is submitted.</compoundhint>\n    <compoundhint value="A B C D">You can specify optional feedback for one, several, or all answer combinations.</compoundhint>\n  </checkboxgroup>\n</choiceresponse>\n\n\n<demandhint>\n  <hint>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</hint>\n  <hint>If you add more than one hint, a different hint appears each time learners select the hint button.</hint>\n</demandhint>\n</problem>',
    problemType: 'SINGLESELECT',
    question: 'You can use this template as a guide to the simple editor markdown and OLX markup to use for checkboxes with hints and feedback problems. Edit this component to replace this template with your own assessment.\n\n<p>Add the question text, or prompt, here. This text is required.||You can add an optional tip or note related to the prompt like this.</p>\n\n',
    answers: [
      {
        id: 'A',
        title: 'a correct answer',
        correct: true,
        selectedFeedback: 'Some new feedback',
      },
      {
        id: 'B',
        title: 'an incorrect answer',
        correct: false,
        selectedFeedback: '',
      },
      {
        id: 'C',
        title: 'an incorrect answer',
        correct: false,
        selectedFeedback: 'Wrong feedback',
      },
      {
        id: 'D',
        title: 'an incorrect answer again',
        correct: false,
        selectedFeedback: '',
      },
    ],
    groupFeedbackList: [],
    settings: {
      hints: [
        {
          id: 13,
          value: 'You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.',
        },
        {
          id: 14,
          value: 'If you add more than one hint, a different hint appears each time learners select the hint button.',
        },
      ],
      scoring: {
        attempts: {
          unlimited: true,
          number: null,
        },
      },
      timeBetween: 0,
      showAnswer: {
        on: '',
        afterAttempts: 1,
      },
      showResetButton: false,
    },
  },
  metadata: {
    markdown: `You can use this template as a guide to the simple editor markdown and OLX markup to use for checkboxes with hints and feedback problems. Edit this component to replace this template with your own assessment.

>>Add the question text, or prompt, here. This text is required.||You can add an optional tip or note related to the prompt like this.<<
(x) a correct answer {{Some new feedback}}
( ) an incorrect answer
( ) an incorrect answer {{Wrong feedback}}
( ) an incorrect answer again
||You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.||
||If you add more than one hint, a different hint appears each time learners select the hint button.||
`,
  },
};

export const negativeAttempts = {
  state: {
    rawOLX: '<problem>\n    <numericalresponse answer="100">\n        <responseparam type="tolerance" default="5"/>\n        <formulaequationinput/>\n    </numericalresponse>\n</problem>\n',
    problemType: 'TEXTINPUT',
    question: '',
    answers: [
      {
        id: 'A',
        title: '100 +-5',
        correct: true,
      },
    ],
    groupFeedbackList: [],
    settings: {
      scoring: {
        weight: 2.5,
        attempts: {
          unlimited: false,
          number: 0,
        },
      },
    },
  },
  metadata: {
    markdown: `
=100 +-5 {{You can specify optional feedback like this, which appears after this answer is submitted.}}
`,
    weight: 2.5,
    max_attempts: -1,
    rerandomize: 'invalid_input',
    showanswer: 'invalid_input',
    attempts_before_showanswer_button: 2,
  },
};
