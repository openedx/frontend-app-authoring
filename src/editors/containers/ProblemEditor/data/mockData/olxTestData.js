export const getCheckboxesOLXWithFeedbackAndHintsOLX = () => ({
  rawOLX: `<problem>
  <choiceresponse>
    <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for checkboxes with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>
  <label>Add the question text, or prompt, here. This text is required.</label>
  <description>You can add an optional tip or note related to the prompt like this.</description>
  <checkboxgroup>
      <choice correct="true"><p>a correct answer</p>
        <choicehint selected="true"><p>You can specify optional feedback that appears after the learner selects and submits this answer.</p></choicehint>
        <choicehint selected="false"><p>You can specify optional feedback that appears after the learner clears and submits this answer.</p></choicehint>
  </choice>
      <choice correct="false"><p>an incorrect answer</p></choice>
      <choice correct="false"><p>an incorrect answer</p>
        <choicehint selected="true"><p>You can specify optional feedback for none, all, or a subset of the answers.</p></choicehint>
        <choicehint selected="false"><p>You can specify optional feedback for selected answers, cleared answers, or both.</p></choicehint>
  </choice>
      <choice correct="true"><p>a correct answer</p></choice>
      <compoundhint value="A B D"><p>You can specify optional feedback for a combination of answers which appears after the specified set of answers is submitted.</p></compoundhint>
      <compoundhint value="A B C D"><p>You can specify optional feedback for one, several, or all answer combinations.</p></compoundhint>
    </checkboxgroup>
    <solution>
        <div class="detailed-solution">
            <p>Explanation</p>
            <p>
                You can form a voltage divider that evenly divides the input
                voltage with two identically valued resistors, with the sampled
                voltage taken in between the two.
            </p>
            <p><img src="/static/images/voltage_divider.png" alt=""></img></p>
         </div>
      </solution>
  </choiceresponse>
  <demandhint>
    <hint><p>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</p></hint>
    <hint><p>If you add more than one hint, a different hint appears each time learners select the hint button.</p></hint>
  </demandhint>
  </problem>`,
  hints: [
    {
      id: 0,
      value: '<p>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</p>',
    },
    {
      id: 1,
      value: '<p>If you add more than one hint, a different hint appears each time learners select the hint button.</p>',
    },
  ],
  solutionExplanation: `
  <p>
      You can form a voltage divider that evenly divides the input
      voltage with two identically valued resistors, with the sampled
      voltage taken in between the two.
  </p>
  <p><img src="/static/images/voltage_divider.png" alt=""></img></p>`,
  data: {
    answers: [
      {
        id: 'A',
        title: '<p>a correct answer</p>',
        correct: true,
        selectedFeedback: '<p>You can specify optional feedback that appears after the learner selects and submits this answer.</p>',
        unselectedFeedback: '<p>You can specify optional feedback that appears after the learner clears and submits this answer.</p>',
      },
      {
        id: 'B',
        title: '<p>an incorrect answer</p>',
        correct: false,
      },
      {
        id: 'C',
        title: '<p>an incorrect answer</p>',
        correct: false,
        selectedFeedback: '<p>You can specify optional feedback for none, all, or a subset of the answers.</p>',
        unselectedFeedback: '<p>You can specify optional feedback for selected answers, cleared answers, or both.</p>',
      },
      {
        id: 'D',
        title: '<p>a correct answer</p>',
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
        feedback: '<p>You can specify optional feedback for a combination of answers which appears after the specified set of answers is submitted.</p>',
      },
      {
        id: 1,
        answers: [
          'A',
          'B',
          'C',
          'D',
        ],
        feedback: '<p>You can specify optional feedback for one, several, or all answer combinations.</p>',
      },
    ],
  },
  question: '<p>You can use this template as a guide to the simple editor markdown and OLX markup to use for checkboxes with hints and feedback problems. Edit this component to replace this template with your own assessment.</p><label>Add the question text, or prompt, here. This text is required.</label><em>You can add an optional tip or note related to the prompt like this.</em>',
  buildOLX: `<problem>
  <choiceresponse>
    <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for checkboxes with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>
    <label>Add the question text, or prompt, here. This text is required.</label>
    <em>You can add an optional tip or note related to the prompt like this.</em>
    <checkboxgroup>
      <choice correct="true">
<p>a correct answer </p>       <choicehint selected="true"><p>You can specify optional feedback that appears after the learner selects and submits this answer.</p></choicehint>
        <choicehint selected="false"><p>You can specify optional feedback that appears after the learner clears and submits this answer.</p></choicehint>
      </choice>
      <choice correct="false"><p>an incorrect answer</p></choice>
      <choice correct="false">
<p>an incorrect answer</p>        <choicehint selected="true"><p>You can specify optional feedback for none, all, or a subset of the answers.</p></choicehint>
        <choicehint selected="false"><p>You can specify optional feedback for selected answers, cleared answers, or both.</p></choicehint>
      </choice>
      <choice correct="true"><p>a correct answer</p></choice>
      <compoundhint value="A B D"><p>You can specify optional feedback for a combination of answers which appears after the specified set of answers is submitted.</p></compoundhint>
      <compoundhint value="A B C D"><p>You can specify optional feedback for one, several, or all answer combinations.</p></compoundhint>
    </checkboxgroup>
      <solution>
      <div class="detailed-solution">
      <p>Explanation</p>
      <p>
          You can form a voltage divider that evenly divides the input
          voltage with two identically valued resistors, with the sampled
          voltage taken in between the two.
      </p>
      <p><img src="/static/images/voltage_divider.png" alt=""></img></p>
    </div>
      </solution>
  </choiceresponse>
  <demandhint>
    <hint><p>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</p></hint>
    <hint><p>If you add more than one hint, a different hint appears each time learners select the hint button.</p></hint>
  </demandhint>
</problem>
`,
});

export const checkboxesOLXWithFeedbackAndHintsOLX = getCheckboxesOLXWithFeedbackAndHintsOLX({});

export const multipleChoiceWithoutAnswers = {
  rawOLX: `<problem>
  <multiplechoiceresponse>
    <choicegroup>
  </choicegroup>
  </multiplechoiceresponse>
  <demandhint></demandhint>
  <solution></solution>
  </problem>`,
  data: {
    answers: [
      {
        id: 'A',
        title: '',
        correct: true,
      },
    ],
  },
};

export const dropdownOLXWithFeedbackAndHintsOLX = {
  rawOLX: `<problem>
<optionresponse>
  <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for dropdown with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>
<label>Add the question text, or prompt, here. This text is required.</label>
<description>You can add an optional tip or note related to the prompt like this. </description>
<optioninput>
    <option correct="false">an incorrect answer <optionhint><p>You can specify optional feedback like this, which appears after this answer is submitted.</p></optionhint>
</option>
    <option correct="true">the correct answer</option>
    <option correct="false">an incorrect answer <optionhint><p>You can specify optional feedback for none, a subset, or all of the answers.</p></optionhint>
</option>
  </optioninput>
</optionresponse>
<demandhint>
  <hint><p>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</p></hint>
  <hint><p>If you add more than one hint, a different hint appears each time learners select the hint button.</p></hint>
</demandhint>
</problem>`,
  hints: [{
    id: 0,
    value: '<p>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</p>',
  },
  {
    id: 1,
    value: '<p>If you add more than one hint, a different hint appears each time learners select the hint button.</p>',
  },
  ],
  data: {
    answers: [
      {
        id: 'A',
        title: 'an incorrect answer',
        correct: false,
        selectedFeedback: '<p>You can specify optional feedback like this, which appears after this answer is submitted.</p>',
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
        selectedFeedback: '<p>You can specify optional feedback for none, a subset, or all of the answers.</p>',
      },
    ],
  },
  question: '<p>You can use this template as a guide to the simple editor markdown and OLX markup to use for dropdown with hints and feedback problems. Edit this component to replace this template with your own assessment.</p><label>Add the question text, or prompt, here. This text is required.</label><em>You can add an optional tip or note related to the prompt like this.</em>',
  buildOLX: `<problem>
  <optionresponse>
    <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for dropdown with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>
    <label>Add the question text, or prompt, here. This text is required.</label>
    <em>You can add an optional tip or note related to the prompt like this.</em>
    <optioninput>
      <option correct="false">
an incorrect answer        <optionhint><p>You can specify optional feedback like this, which appears after this answer is submitted.</p></optionhint>
      </option>
      <option correct="true">the correct answer</option>
      <option correct="false">
an incorrect answer        <optionhint><p>You can specify optional feedback for none, a subset, or all of the answers.</p></optionhint>
      </option>
    </optioninput>
  </optionresponse>
  <demandhint>
    <hint><p>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</p></hint>
    <hint><p>If you add more than one hint, a different hint appears each time learners select the hint button.</p></hint>
  </demandhint>
</problem>
`,
};

export const multipleChoiceWithFeedbackAndHintsOLX = {
  rawOLX: `<problem>
<multiplechoiceresponse>
  <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for multiple choice with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>
<label>Add the question text, or prompt, here. This text is required.</label>
<description>You can add an optional tip or note related to the prompt like this. </description>
<choicegroup type="MultipleChoice">
    <choice correct="false"><p>an incorrect answer</p><choicehint><p>You can specify optional feedback like this, which appears after this answer is submitted.</p></choicehint>
</choice>
    <choice correct="true"><p>the correct answer</p></choice>
    <choice correct="false"><p>an incorrect answer</p><choicehint><p>You can specify optional feedback for none, a subset, or all of the answers.</></choicehint>
</choice>
  </choicegroup>
  <solution>
    <p>You can add a solution</p>
  </solution>
</multiplechoiceresponse>
<demandhint>
  <hint><p>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</p></hint>
  <hint><p>If you add more than one hint, a different hint appears each time learners select the hint button.</p></hint>
</demandhint>
</problem>`,
  hints: [{
    id: 0,
    value: '<p>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</p>',
  },
  {
    id: 1,
    value: '<p>If you add more than one hint, a different hint appears each time learners select the hint button.</p>',
  },
  ],
  solutionExplanation: '<p>You can add a solution</p>',
  data: {
    answers: [
      {
        id: 'A',
        title: '<p>an incorrect answer</p>',
        correct: false,
        selectedFeedback: '<p>You can specify optional feedback like this, which appears after this answer is submitted.</p>',
      },
      {
        id: 'B',
        title: '<p>the correct answer</p>',
        correct: true,
      },
      {
        id: 'C',
        title: '<p>an incorrect answer</p>',
        correct: false,
        selectedFeedback: '<p>You can specify optional feedback for none, a subset, or all of the answers.</p>',
      },
    ],
  },
  question: '<p>You can use this template as a guide to the simple editor markdown and OLX markup to use for multiple choice with hints and feedback problems. Edit this component to replace this template with your own assessment.</p><label>Add the question text, or prompt, here. This text is required.</label><em>You can add an optional tip or note related to the prompt like this.</em>',
  buildOLX: `<problem>
  <multiplechoiceresponse>
    <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for multiple choice with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>
    <label>Add the question text, or prompt, here. This text is required.</label>
    <em>You can add an optional tip or note related to the prompt like this.</em>
    <choicegroup>
      <choice correct="false">
<p>an incorrect answer</p>        <choicehint><p>You can specify optional feedback like this, which appears after this answer is submitted.</p></choicehint>
      </choice>
      <choice correct="true"><p>the correct answer</p></choice>
      <choice correct="false">
<p>an incorrect answer </p>       <choicehint><p>You can specify optional feedback for none, a subset, or all of the answers.</p></choicehint>
      </choice>
    </choicegroup>
    <solution>
    <div class="detailed-solution">
  <p>Explanation</p>
  <p>You can add a solution</p>
</div>
</solution>
  </multiplechoiceresponse>
  <demandhint>
    <hint><p>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</p></hint>
    <hint><p>If you add more than one hint, a different hint appears each time learners select the hint button.</p></hint>
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
  <correcthint><p>You can specify optional feedback like this, which appears after this answer is submitted.</p></correcthint>
  <additional_answer answer="200"><correcthint><p>You can specify optional feedback like this, which appears after this answer is submitted.</p></correcthint></additional_answer>
</numericalresponse>
<demandhint>
  <hint><p>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</p></hint>
  <hint><p>If you add more than one hint, a different hint appears each time learners select the hint button.</p></hint>
</demandhint>
</problem>`,
  hints: [{
    id: 0,
    value: '<p>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</p>',
  },
  {
    id: 1,
    value: '<p>If you add more than one hint, a different hint appears each time learners select the hint button.</p>',
  },
  ],
  data: {
    answers: [
      {
        id: 'A',
        title: '100',
        correct: true,
        selectedFeedback: '<p>You can specify optional feedback like this, which appears after this answer is submitted.</p>',
        isAnswerRange: false,
        tolerance: '5',
      },
      {
        id: 'B',
        title: '200',
        correct: true,
        isAnswerRange: false,
        selectedFeedback: '<p>You can specify optional feedback like this, which appears after this answer is submitted.</p>',
      },
    ],
  },
  question: '<p>You can use this template as a guide to the simple editor markdown and OLX markup to use for numerical input with hints and feedback problems. Edit this component to replace this template with your own assessment.</p><label>Add the question text, or prompt, here. This text is required.</label><em>You can add an optional tip or note related to the prompt like this.</em>',
  buildOLX: `<problem>
  <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for numerical input with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>
  <label>Add the question text, or prompt, here. This text is required.</label>
  <em>You can add an optional tip or note related to the prompt like this.</em>
  <numericalresponse answer="100">
    <responseparam type="tolerance" default="5"></responseparam>
    <correcthint><p>You can specify optional feedback like this, which appears after this answer is submitted.</p></correcthint>
    <additional_answer answer="200">
      <correcthint><p>You can specify optional feedback like this, which appears after this answer is submitted.</p></correcthint>
    </additional_answer>
    <formulaequationinput></formulaequationinput>
  </numericalresponse>
  <demandhint>
    <hint><p>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</p></hint>
    <hint><p>If you add more than one hint, a different hint appears each time learners select the hint button.</p></hint>
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
<correcthint><p>You can specify optional feedback like this, which appears after this answer is submitted.</p></correcthint>
  <additional_answer answer="optional acceptable variant of the correct answer"/>
  <stringequalhint answer="optional incorrect answer such as a frequent misconception"><p>You can specify optional feedback for none, a subset, or all of the answers.</p></stringequalhint>
  <textline size="20"/>
</stringresponse>
<demandhint>
  <hint><p>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</p></hint>
  <hint><p>If you add more than one hint, a different hint appears each time learners select the hint button.</p></hint>
</demandhint>
</problem>`,
  hints: [{
    id: 0,
    value: '<p>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</p>',
  },
  {
    id: 1,
    value: '<p>If you add more than one hint, a different hint appears each time learners select the hint button.</p>',
  },
  ],
  data: {
    answers: [
      {
        id: 'A',
        title: 'the correct answer',
        correct: true,
        selectedFeedback: '<p>You can specify optional feedback like this, which appears after this answer is submitted.</p>',
      },
      {
        id: 'B',
        title: 'optional acceptable variant of the correct answer',
        correct: true,
        selectedFeedback: '',
      },
      {
        id: 'C',
        title: 'optional incorrect answer such as a frequent misconception',
        correct: false,
        selectedFeedback: '<p>You can specify optional feedback for none, a subset, or all of the answers.</p>',
      },
    ],
    additionalStringAttributes: {
      type: 'ci',
      textline: {
        size: '20',
      },
    },
  },
  question: '<p>You can use this template as a guide to the simple editor markdown and OLX markup to use for text input with hints and feedback problems. Edit this component to replace this template with your own assessment.</p><label>Add the question text, or prompt, here. This text is required.</label><em>You can add an optional tip or note related to the prompt like this.</em>',
  buildOLX: `<problem>
  <stringresponse answer="the correct answer" type="ci">
    <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for text input with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>
    <label>Add the question text, or prompt, here. This text is required.</label>
    <em>You can add an optional tip or note related to the prompt like this.</em>
    <correcthint><p>You can specify optional feedback like this, which appears after this answer is submitted.</p></correcthint>
    <additional_answer answer="optional acceptable variant of the correct answer"></additional_answer>
    <stringequalhint answer="optional incorrect answer such as a frequent misconception"><p>You can specify optional feedback for none, a subset, or all of the answers.</p></stringequalhint>
    <textline size="20"></textline>
  </stringresponse>
  <demandhint>
    <hint><p>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</p></hint>
    <hint><p>If you add more than one hint, a different hint appears each time learners select the hint button.</p></hint>
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
  <hint><p>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</p></hint>
  <hint><p>If you add more than one hint, a different hint appears each time learners select the hint button.</p></hint>
</demandhint>
</problem>`,
  hints: [{
    id: 0,
    value: '<p>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</p>',
  },
  {
    id: 1,
    value: '<p>If you add more than one hint, a different hint appears each time learners select the hint button.</p>',
  },
  ],
  data: {
    answers: [
      {
        id: 'A',
        title: 'the correct answer',
        correct: true,
        selectedFeedback: 'You can specify optional feedback like this, which appears after this answer is submitted.',
      },
      {
        id: 'B',
        title: '300',
        correct: true,
        selectedFeedback: 'You can specify optional feedback like this, which appears after this answer is submitted.',
      },
      {
        correct: true,
        selectedFeedback: 'You can specify optional feedback like this, which appears after this answer is submitted.',
        id: 'C',
        title: '400',
      },
      {
        id: 'D',
        title: 'optional incorrect answer such as a frequent misconception',
        correct: false,
        selectedFeedback: 'You can specify optional feedback for none, a subset, or all of the answers.',
      },
    ],
    additionalStringAttributes: {
      type: 'ci',
      textline: {
        size: '20',
      },
    },
  },
  question: '<p>You can use this template as a guide to the simple editor markdown and OLX markup to use for text input with hints and feedback problems. Edit this component to replace this template with your own assessment.</p><label>Add the question text, or prompt, here. This text is required.</label><em>You can add an optional tip or note related to the prompt like this.</em>',
  buildOLX: `<problem>
  <stringresponse answer="the correct answer" type="ci">
    <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for text input with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>
    <label>Add the question text, or prompt, here. This text is required.</label>
    <em>You can add an optional tip or note related to the prompt like this.</em>
    <correcthint><p>You can specify optional feedback like this, which appears after this answer is submitted.</p></correcthint>
    <additional_answer answer="300">
      <correcthint><p>You can specify optional feedback like this, which appears after this answer is submitted.</p></correcthint>
    </additional_answer>
    <additional_answer answer="400">
      <correcthint><p>You can specify optional feedback like this, which appears after this answer is submitted.</p></correcthint>
    </additional_answer>
    <stringequalhint answer="optional incorrect answer such as a frequent misconception"><p>You can specify optional feedback for none, a subset, or all of the answers.</p></stringequalhint>
    <textline size="20"></textline>
  </stringresponse>
  <demandhint>
    <hint><p>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</p></hint>
    <hint><p>If you add more than one hint, a different hint appears each time learners select the hint button.</p></hint>
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
export const multipleProblemTwoOlX = {
  rawOLX: `<problem>
  <numericalresponse answer="100">
    <formulaequationinput></formulaequationinput>
  </numericalresponse>
  <numericalresponse answer="200">
    <formulaequationinput></formulaequationinput>
  </numericalresponse>
</problem>`,
};
export const multipleProblemThreeOlX = {
  rawOLX: `<problem>
  <stringresponse answer="correct answer">
    <textline size="20"/>
  </stringresponse>
  <numericalresponse answer="200">
    <formulaequationinput></formulaequationinput>
  </numericalresponse>
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
export const styledQuestionOLX = {
  rawOLX: `<problem>
  <p>
    <strong>
      <span style="background-color: #e03e2d;">
        test
      </span>
    </strong>
  </p>
  <stringresponse type="ci">
    <additional_answer />
    <textline size="20"/>
  </stringresponse>
</problem>`,
  question: '<p><strong><span style="background-color: #e03e2d;">test</span></strong></p>',
};

export const shuffleProblemOLX = {
  rawOLX: `<problem>
  <multiplechoiceresponse>
    <label>What Apple device competed with the portable CD player?</label>
    <choicegroup type="MultipleChoice" shuffle="true">
      <choice correct="false">The iPad</choice>
      <choice correct="false">Napster</choice>
      <choice correct="true">The iPod</choice>
      <choice correct="false">The vegetable peeler</choice>
    </choicegroup>
  </multiplechoiceresponse>
</problem>`,
};
