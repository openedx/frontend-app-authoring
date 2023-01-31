export const checkboxesOLXWithFeedbackAndHintsOLX = {
  rawOLX: `<problem>
<choiceresponse>
  <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for checkboxes with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>
<label>Add the question text, or prompt, here. This text is required.</label>
<description>You can add an optional tip or note related to the prompt like this.</description>
<checkboxgroup>
    <choice correct="true">a correct answer
      <choicehint selected="true">You can specify optional feedback that appears after the learner selects and submits this answer.</choicehint>
      <choicehint selected="false">You can specify optional feedback that appears after the learner clears and submits this answer.</choicehint>
</choice>
    <choice correct="false">an incorrect answer</choice>
    <choice correct="false">an incorrect answer
      <choicehint selected="true">You can specify optional feedback for none, all, or a subset of the answers.</choicehint>
      <choicehint selected="false">You can specify optional feedback for selected answers, cleared answers, or both.</choicehint>
</choice>
    <choice correct="true">a correct answer</choice>
    <compoundhint value="A B D">You can specify optional feedback for a combination of answers which appears after the specified set of answers is submitted.</compoundhint>
    <compoundhint value="A B C D">You can specify optional feedback for one, several, or all answer combinations.</compoundhint>
  </checkboxgroup>
</choiceresponse>
<demandhint>
  <hint>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</hint>
  <hint>If you add more than one hint, a different hint appears each time learners select the hint button.</hint>
</demandhint>
</problem>`,
  hints: [{
    id: 0,
    value: 'You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.',
  },
  {
    id: 1,
    value: 'If you add more than one hint, a different hint appears each time learners select the hint button.',
  },
  ],
  data: {
    answers: [
      {
        id: 'A',
        title: 'a correct answer',
        correct: true,
        selectedFeedback: 'You can specify optional feedback that appears after the learner selects and submits this answer.',
        unselectedFeedback: 'You can specify optional feedback that appears after the learner clears and submits this answer.',
      },
      {
        id: 'B',
        title: 'an incorrect answer',
        correct: false,
      },
      {
        id: 'C',
        title: 'an incorrect answer',
        correct: false,
        selectedFeedback: 'You can specify optional feedback for none, all, or a subset of the answers.',
        unselectedFeedback: 'You can specify optional feedback for selected answers, cleared answers, or both.',
      },
      {
        id: 'D',
        title: 'a correct answer',
        correct: true,
      },
    ],
    groupFeedbackList: [
      {
        id: 0,
        answers: [
          'A',
          'B',
          'D',
        ],
        feedback: 'You can specify optional feedback for a combination of answers which appears after the specified set of answers is submitted.',
      },
      {
        id: 1,
        answers: [
          'A',
          'B',
          'C',
          'D',
        ],
        feedback: 'You can specify optional feedback for one, several, or all answer combinations.',
      },
    ],
  },
  question: '<p>You can use this template as a guide to the simple editor markdown and OLX markup to use for checkboxes with hints and feedback problems. Edit this component to replace this template with your own assessment.</p><strong>Add the question text, or prompt, here. This text is required.</strong><em>You can add an optional tip or note related to the prompt like this.</em>',
  buildOLX: `<problem>
  <choiceresponse>
    <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for checkboxes with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>
    <strong>Add the question text, or prompt, here. This text is required.</strong>
    <em>You can add an optional tip or note related to the prompt like this.</em>
    <checkboxgroup>
      <choice correct="true">
a correct answer        <choicehint selected="true">You can specify optional feedback that appears after the learner selects and submits this answer.</choicehint>
        <choicehint selected="false">You can specify optional feedback that appears after the learner clears and submits this answer.</choicehint>
      </choice>
      <choice correct="false">an incorrect answer</choice>
      <choice correct="false">
an incorrect answer        <choicehint selected="true">You can specify optional feedback for none, all, or a subset of the answers.</choicehint>
        <choicehint selected="false">You can specify optional feedback for selected answers, cleared answers, or both.</choicehint>
      </choice>
      <choice correct="true">a correct answer</choice>
      <compoundhint value="A B D">You can specify optional feedback for a combination of answers which appears after the specified set of answers is submitted.</compoundhint>
      <compoundhint value="A B C D">You can specify optional feedback for one, several, or all answer combinations.</compoundhint>
    </checkboxgroup>
  </choiceresponse>
  <demandhint>
    <hint>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</hint>
    <hint>If you add more than one hint, a different hint appears each time learners select the hint button.</hint>
  </demandhint>
</problem>
`,
};

export const dropdownOLXWithFeedbackAndHintsOLX = {
  rawOLX: `<problem>
<optionresponse>
  <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for dropdown with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>
<label>Add the question text, or prompt, here. This text is required.</label>
<description>You can add an optional tip or note related to the prompt like this. </description>
<optioninput>
    <option correct="false">an incorrect answer <optionhint>You can specify optional feedback like this, which appears after this answer is submitted.</optionhint>
</option>
    <option correct="true">the correct answer</option>
    <option correct="false">an incorrect answer <optionhint>You can specify optional feedback for none, a subset, or all of the answers.</optionhint>
</option>
  </optioninput>
</optionresponse>
<demandhint>
  <hint>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</hint>
  <hint>If you add more than one hint, a different hint appears each time learners select the hint button.</hint>
</demandhint>
</problem>`,
  hints: [{
    id: 0,
    value: 'You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.',
  },
  {
    id: 1,
    value: 'If you add more than one hint, a different hint appears each time learners select the hint button.',
  },
  ],
  data: {
    answers: [
      {
        id: 'A',
        title: 'an incorrect answer',
        correct: false,
        feedback: 'You can specify optional feedback like this, which appears after this answer is submitted.',
      },
      {
        id: 'B',
        title: 'the correct answer',
        correct: true,
      },
      {
        id: 'C',
        title: 'an incorrect answer',
        correct: false,
        feedback: 'You can specify optional feedback for none, a subset, or all of the answers.',
      },
    ],
  },
  question: '<p>You can use this template as a guide to the simple editor markdown and OLX markup to use for dropdown with hints and feedback problems. Edit this component to replace this template with your own assessment.</p><strong>Add the question text, or prompt, here. This text is required.</strong><em>You can add an optional tip or note related to the prompt like this.</em>',
  buildOLX: `<problem>
  <optionresponse>
    <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for dropdown with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>
    <strong>Add the question text, or prompt, here. This text is required.</strong>
    <em>You can add an optional tip or note related to the prompt like this.</em>
    <optioninput>
      <option correct="false">
an incorrect answer        <optionhint>You can specify optional feedback like this, which appears after this answer is submitted.</optionhint>
      </option>
      <option correct="true">the correct answer</option>
      <option correct="false">
an incorrect answer        <optionhint>You can specify optional feedback for none, a subset, or all of the answers.</optionhint>
      </option>
    </optioninput>
  </optionresponse>
  <demandhint>
    <hint>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</hint>
    <hint>If you add more than one hint, a different hint appears each time learners select the hint button.</hint>
  </demandhint>
</problem>
`,
};

export const mutlipleChoiceWithFeedbackAndHintsOLX = {
  rawOLX: `<problem>
<multiplechoiceresponse>
  <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for multiple choice with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>
<label>Add the question text, or prompt, here. This text is required.</label>
<description>You can add an optional tip or note related to the prompt like this. </description>
<choicegroup type="MultipleChoice">
    <choice correct="false">an incorrect answer <choicehint>You can specify optional feedback like this, which appears after this answer is submitted.</choicehint>
</choice>
    <choice correct="true">the correct answer</choice>
    <choice correct="false">an incorrect answer <choicehint>You can specify optional feedback for none, a subset, or all of the answers.</choicehint>
</choice>
  </choicegroup>
</multiplechoiceresponse>
<demandhint>
  <hint>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</hint>
  <hint>If you add more than one hint, a different hint appears each time learners select the hint button.</hint>
</demandhint>
</problem>`,
  hints: [{
    id: 0,
    value: 'You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.',
  },
  {
    id: 1,
    value: 'If you add more than one hint, a different hint appears each time learners select the hint button.',
  },
  ],
  data: {
    answers: [
      {
        id: 'A',
        title: 'an incorrect answer',
        correct: false,
        feedback: 'You can specify optional feedback like this, which appears after this answer is submitted.',
      },
      {
        id: 'B',
        title: 'the correct answer',
        correct: true,
      },
      {
        id: 'C',
        title: 'an incorrect answer',
        correct: false,
        feedback: 'You can specify optional feedback for none, a subset, or all of the answers.',
      },
    ],
  },
  question: '<p>You can use this template as a guide to the simple editor markdown and OLX markup to use for multiple choice with hints and feedback problems. Edit this component to replace this template with your own assessment.</p><strong>Add the question text, or prompt, here. This text is required.</strong><em>You can add an optional tip or note related to the prompt like this.</em>',
  buildOLX: `<problem>
  <multiplechoiceresponse>
    <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for multiple choice with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>
    <strong>Add the question text, or prompt, here. This text is required.</strong>
    <em>You can add an optional tip or note related to the prompt like this.</em>
    <choicegroup>
      <choice correct="false">
an incorrect answer        <choicehint>You can specify optional feedback like this, which appears after this answer is submitted.</choicehint>
      </choice>
      <choice correct="true">the correct answer</choice>
      <choice correct="false">
an incorrect answer        <choicehint>You can specify optional feedback for none, a subset, or all of the answers.</choicehint>
      </choice>
    </choicegroup>
  </multiplechoiceresponse>
  <demandhint>
    <hint>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</hint>
    <hint>If you add more than one hint, a different hint appears each time learners select the hint button.</hint>
  </demandhint>
</problem>
`,
};

export const numericInputWithFeedbackAndHintsOLX = {
  rawOLX: `<problem>
<numericalresponse answer="100">
  <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for numerical input with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>
<label>Add the question text, or prompt, here. This text is required.</label>
<description>You can add an optional tip or note related to the prompt like this. </description>
<responseparam type="tolerance" default="5"/>
  <formulaequationinput/>
  <correcthint>You can specify optional feedback like this, which appears after this answer is submitted.</correcthint>
  <additional_answer answer="200"><correcthint>You can specify optional feedback like this, which appears after this answer is submitted.</correcthint></additional_answer>
</numericalresponse>
<demandhint>
  <hint>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</hint>
  <hint>If you add more than one hint, a different hint appears each time learners select the hint button.</hint>
</demandhint>
</problem>`,
  hints: [{
    id: 0,
    value: 'You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.',
  },
  {
    id: 1,
    value: 'If you add more than one hint, a different hint appears each time learners select the hint button.',
  },
  ],
  data: {
    answers: [
      {
        id: 'A',
        title: '100',
        correct: true,
        feedback: 'You can specify optional feedback like this, which appears after this answer is submitted.',
        tolerance: '5',
      },
      {
        id: 'B',
        title: '200',
        correct: true,
        feedback: 'You can specify optional feedback like this, which appears after this answer is submitted.',
      },
    ],
  },
  question: '<p>You can use this template as a guide to the simple editor markdown and OLX markup to use for numerical input with hints and feedback problems. Edit this component to replace this template with your own assessment.</p><strong>Add the question text, or prompt, here. This text is required.</strong><em>You can add an optional tip or note related to the prompt like this.</em>',
  buildOLX: `<problem>
  <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for numerical input with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>
  <strong>Add the question text, or prompt, here. This text is required.</strong>
  <em>You can add an optional tip or note related to the prompt like this.</em>
  <numericalresponse answer="100">
    <responseparam type="tolerance" default="5"></responseparam>
    <correcthint>You can specify optional feedback like this, which appears after this answer is submitted.</correcthint>
    <additional_answer answer="200">
      <correcthint>You can specify optional feedback like this, which appears after this answer is submitted.</correcthint>
    </additional_answer>
    <formulaequationinput></formulaequationinput>
  </numericalresponse>
  <demandhint>
    <hint>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</hint>
    <hint>If you add more than one hint, a different hint appears each time learners select the hint button.</hint>
  </demandhint>
</problem>
`,
};

export const textInputWithFeedbackAndHintsOLX = {
  rawOLX: `<problem>
<stringresponse answer="the correct answer" type="ci">
  <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for text input with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>
<label>Add the question text, or prompt, here. This text is required.</label>
<description>You can add an optional tip or note related to the prompt like this. </description>
<correcthint>You can specify optional feedback like this, which appears after this answer is submitted.</correcthint>
  <additional_answer answer="optional acceptable variant of the correct answer"/>
  <stringequalhint answer="optional incorrect answer such as a frequent misconception">You can specify optional feedback for none, a subset, or all of the answers.</stringequalhint>
  <textline size="20"/>
</stringresponse>
<demandhint>
  <hint>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</hint>
  <hint>If you add more than one hint, a different hint appears each time learners select the hint button.</hint>
</demandhint>
</problem>`,
  hints: [{
    id: 0,
    value: 'You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.',
  },
  {
    id: 1,
    value: 'If you add more than one hint, a different hint appears each time learners select the hint button.',
  },
  ],
  data: {
    answers: [
      {
        id: 'A',
        title: 'the correct answer',
        correct: true,
        feedback: 'You can specify optional feedback like this, which appears after this answer is submitted.',
      },
      {
        id: 'B',
        title: 'optional acceptable variant of the correct answer',
        correct: true,
        feedback: '',
      },
      {
        id: 'C',
        title: 'optional incorrect answer such as a frequent misconception',
        correct: false,
        feedback: 'You can specify optional feedback for none, a subset, or all of the answers.',
      },
    ],
    additionalStringAttributes: {
      type: 'ci',
      textline: {
        size: '20',
      },
    },
  },
  question: '<p>You can use this template as a guide to the simple editor markdown and OLX markup to use for text input with hints and feedback problems. Edit this component to replace this template with your own assessment.</p><strong>Add the question text, or prompt, here. This text is required.</strong><em>You can add an optional tip or note related to the prompt like this.</em>',
  buildOLX: `<problem>
  <stringresponse answer="the correct answer" type="ci">
    <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for text input with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>
    <strong>Add the question text, or prompt, here. This text is required.</strong>
    <em>You can add an optional tip or note related to the prompt like this.</em>
    <correcthint>You can specify optional feedback like this, which appears after this answer is submitted.</correcthint>
    <additional_answer answer="optional acceptable variant of the correct answer"></additional_answer>
    <stringequalhint answer="optional incorrect answer such as a frequent misconception">You can specify optional feedback for none, a subset, or all of the answers.</stringequalhint>
    <textline size="20"></textline>
  </stringresponse>
  <demandhint>
    <hint>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</hint>
    <hint>If you add more than one hint, a different hint appears each time learners select the hint button.</hint>
  </demandhint>
</problem>
`,
};

export const textInputWithFeedbackAndHintsOLXWithMultipleAnswers = {
  rawOLX: `<problem>
<stringresponse answer="the correct answer" type="ci">
  <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for text input with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>
<label>Add the question text, or prompt, here. This text is required.</label>
<description>You can add an optional tip or note related to the prompt like this. </description>
<correcthint>You can specify optional feedback like this, which appears after this answer is submitted.</correcthint>
  <additional_answer answer="300"><correcthint>You can specify optional feedback like this, which appears after this answer is submitted.</correcthint> </additional_answer>
  <additional_answer answer="400"><correcthint>You can specify optional feedback like this, which appears after this answer is submitted.</correcthint> </additional_answer>
  <stringequalhint answer="optional incorrect answer such as a frequent misconception">You can specify optional feedback for none, a subset, or all of the answers.</stringequalhint>
  <textline size="20"/>
</stringresponse>
<demandhint>
  <hint>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</hint>
  <hint>If you add more than one hint, a different hint appears each time learners select the hint button.</hint>
</demandhint>
</problem>`,
  hints: [{
    id: 0,
    value: 'You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.',
  },
  {
    id: 1,
    value: 'If you add more than one hint, a different hint appears each time learners select the hint button.',
  },
  ],
  data: {
    answers: [
      {
        id: 'A',
        title: 'the correct answer',
        correct: true,
        feedback: 'You can specify optional feedback like this, which appears after this answer is submitted.',
      },
      {
        id: 'B',
        title: '300',
        correct: true,
        feedback: 'You can specify optional feedback like this, which appears after this answer is submitted.',
      },
      {
        correct: true,
        feedback: 'You can specify optional feedback like this, which appears after this answer is submitted.',
        id: 'C',
        title: '400',
      },
      {
        id: 'D',
        title: 'optional incorrect answer such as a frequent misconception',
        correct: false,
        feedback: 'You can specify optional feedback for none, a subset, or all of the answers.',
      },
    ],
    additionalStringAttributes: {
      type: 'ci',
      textline: {
        size: '20',
      },
    },
  },
  question: '<p>You can use this template as a guide to the simple editor markdown and OLX markup to use for text input with hints and feedback problems. Edit this component to replace this template with your own assessment.</p><strong>Add the question text, or prompt, here. This text is required.</strong><em>You can add an optional tip or note related to the prompt like this.</em>',
  buildOLX: `<problem>
  <stringresponse answer="the correct answer" type="ci">
    <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for text input with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>
    <strong>Add the question text, or prompt, here. This text is required.</strong>
    <em>You can add an optional tip or note related to the prompt like this.</em>
    <correcthint>You can specify optional feedback like this, which appears after this answer is submitted.</correcthint>
    <additional_answer answer="300">
      <correcthint>You can specify optional feedback like this, which appears after this answer is submitted.</correcthint>
    </additional_answer>
    <additional_answer answer="400">
      <correcthint>You can specify optional feedback like this, which appears after this answer is submitted.</correcthint>
    </additional_answer>
    <stringequalhint answer="optional incorrect answer such as a frequent misconception">You can specify optional feedback for none, a subset, or all of the answers.</stringequalhint>
    <textline size="20"></textline>
  </stringresponse>
  <demandhint>
    <hint>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</hint>
    <hint>If you add more than one hint, a different hint appears each time learners select the hint button.</hint>
  </demandhint>
</problem>
`,
};

export const numericInputWithFeedbackAndHintsOLXException = {
  rawOLX: `<problem>
  <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for numerical input with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>

  <label>Add the question text, or prompt, here. This text is required.</label>
  <description>You can add an optional tip or note related to the prompt like this. </description>
  <numericalresponse answer="300">
    <formulaequationinput />
  </numericalresponse>
  <numericalresponse answer="100">
    <responseparam type="tolerance" default="5" />
    <formulaequationinput />
    <correcthint>You can specify optional feedback like this, which appears after this answer is submitted.</correcthint>
  </numericalresponse>
  <numericalresponse answer="200">
    <responseparam type="tolerance" default="4" />
    <additional_answer answer="500"><correcthint>This is one feedback!</correcthint></additional_answer>
    <formulaequationinput />
  </numericalresponse>

  <demandhint>
    <hint>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</hint>
    <hint>If you add more than one hint, a different hint appears each time learners select the hint button.</hint>
  </demandhint>
  </problem>`,
  data: {
    answers: [
      {
        id: 'A',
        title: '300',
        correct: true,
        feedback: '',
      },
      {
        id: 'B',
        title: '100',
        correct: true,
        feedback: 'You can specify optional feedback like this, which appears after this answer is submitted.',
        tolerance: '5',
      },
      {
        id: 'C',
        title: '200',
        correct: true,
        feedback: '',
        tolerance: '4',
      },
      {
        id: 'D',
        title: '500',
        correct: true,
        feedback: 'This is one feedback!',
      },
    ],
  },
  question: '<p>You can use this template as a guide to the simple editor markdown and OLX markup to use for numerical input with hints and feedback problems. Edit this component to replace this template with your own assessment.</p><strong>Add the question text, or prompt, here. This text is required.</strong><em>You can add an optional tip or note related to the prompt like this.</em>',
  buildOLX: `<problem>
  <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for numerical input with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>
  <strong>Add the question text, or prompt, here. This text is required.</strong>
  <em>You can add an optional tip or note related to the prompt like this.</em>
  <numericalresponse answer="300">
    <additional_answer answer="100">
      <correcthint>You can specify optional feedback like this, which appears after this answer is submitted.</correcthint>
    </additional_answer>
    <additional_answer answer="200"></additional_answer>
    <additional_answer answer="500">
      <correcthint>This is one feedback!</correcthint>
    </additional_answer>
    <formulaequationinput></formulaequationinput>
  </numericalresponse>
  <demandhint>
    <hint>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</hint>
    <hint>If you add more than one hint, a different hint appears each time learners select the hint button.</hint>
  </demandhint>
</problem>
`,
};
export const advancedProblemOlX = {
  rawOLX: `<problem>
  <formularesponse type="ci" samples="R_1,R_2,R_3@1,2,3:3,4,5#10" answer="R_1*R_2/R_3">
      <p>You can use this template as a guide to the OLX markup to use for math expression problems. Edit this component to replace the example with your own assessment.</p>
      <label>Add the question text, or prompt, here. This text is required. Example: Write an expression for the product of R_1, R_2, and the inverse of R_3.</label>
      <description>You can add an optional tip or note related to the prompt like this. Example: To test this example, the correct answer is R_1*R_2/R_3</description>
      <responseparam type="tolerance" default="0.00001"/>
      <formulaequationinput size="40"/>
  </formularesponse>
</problem>`,
};
export const multipleProblemOlX = {
  rawOLX: `<problem>
  <stringresponse answer="correct answer">
    <textline size="20"/>
  </stringresponse>
  <stringresponse answer="other correct answer">
    <textline size="20"/>
  </stringresponse>
</problem>`,
};
export const blankProblemOLX = {
  rawOLX: '<problem></problem>',
};
export const blankQuestionOLX = {
  rawOLX: `<problem>
  <stringresponse type="ci">
    <additional_answer />
    <textline size="20"/>
  </stringresponse>
</problem>`,
  question: '',
};
