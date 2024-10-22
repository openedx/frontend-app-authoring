/* eslint-disable */
// lint is disabled for this file due to strict spacing

export const checkboxesOLXWithFeedbackAndHintsOLX = {
  rawOLX: `<problem url_name="this_should_be_ignored">
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
      <compoundhint value="A B D">You can specify optional feedback for a combination of answers which appears after the specified set of answers is submitted.</compoundhint>
      <compoundhint value="A B C D">You can specify optional feedback for one, several, or all answer combinations.</compoundhint>
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
        title: `<p>a correct answer</p>\n        \n        \n      `,
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
        title: `<p>an incorrect answer</p>\n        \n        \n      `,
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
        <compoundhint value="A B D">You can specify optional feedback for a combination of answers which appears after the specified set of answers is submitted.</compoundhint>
        <compoundhint value="A B C D">You can specify optional feedback for one, several, or all answer combinations.</compoundhint>
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
};

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

export const multipleChoiceSingleAnswer = {
  rawOLX: `<problem>
  <multiplechoiceresponse>
    <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for checkboxes with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>
    <label>Add the question text, or prompt, here. This text is required.</label>
    <description>You can add an optional tip or note related to the prompt like this.</description>
    <choicegroup>
      <choice correct="true"><p>a correct answer</p><div><img src="#" />image with <strong>caption</strong>.</div>
        <choicehint selected="true"><p>You can specify optional feedback that appears after the learner selects and submits this answer.</p></choicehint>
        <choicehint selected="false"><p>You can specify optional feedback that appears after the learner clears and submits this answer.</p></choicehint>
      </choice>
    </choicegroup>
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
  </multiplechoiceresponse>
  </problem>`,
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
        title: `<p>a correct answer</p><div><img src="#"></img>image with <strong>caption</strong>.</div>\n        \n        \n      `,
        correct: true,
        selectedFeedback: '<p>You can specify optional feedback that appears after the learner selects and submits this answer.</p>',
        unselectedFeedback: '<p>You can specify optional feedback that appears after the learner clears and submits this answer.</p>',
      },
    ],
  },
  question: '<p>You can use this template as a guide to the simple editor markdown and OLX markup to use for checkboxes with hints and feedback problems. Edit this component to replace this template with your own assessment.</p><label>Add the question text, or prompt, here. This text is required.</label><em>You can add an optional tip or note related to the prompt like this.</em>',
  buildOLX: `<problem>
  <multiplechoiceresponse>
    <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for checkboxes with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>
    <label>Add the question text, or prompt, here. This text is required.</label>
    <em>You can add an optional tip or note related to the prompt like this.</em>
    <checkboxgroup>
      <choice correct="true">
<p>a correct answer </p>       <choicehint selected="true"><p>You can specify optional feedback that appears after the learner selects and submits this answer.</p></choicehint>
        <choicehint selected="false"><p>You can specify optional feedback that appears after the learner clears and submits this answer.</p></choicehint>
      </choice>
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
  </multiplechoiceresponse>
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
<em>Just a generic em tag</em>
<choicegroup type="MultipleChoice">
    <choice correct="false"><p>an incorrect answer</p><choicehint><p>You can specify optional feedback like this, which appears after this answer is submitted.</p></choicehint></choice>
    <choice correct="true"><p>the correct answer</p></choice>
    <choice correct="false"><p>an incorrect answer</p><choicehint><p>You can specify optional feedback for none, a subset, or all of the answers.</p></choicehint></choice>
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
  question: '<p>You can use this template as a guide to the simple editor markdown and OLX markup to use for multiple choice with hints and feedback problems. Edit this component to replace this template with your own assessment.</p><label>Add the question text, or prompt, here. This text is required.</label><em class="olx_description">You can add an optional tip or note related to the prompt like this.</em><em>Just a generic em tag</em>',
  buildOLX: `<problem>
  <multiplechoiceresponse>
    <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for multiple choice with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>
    <label>Add the question text, or prompt, here. This text is required.</label>
    <description>You can add an optional tip or note related to the prompt like this.</description>
    <em>Just a generic em tag</em>
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

export const numericInputWithAnswerRangeOLX = {
  rawOLX: `<problem>
<numericalresponse answer="[3/2,-1.3)">
  <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for numerical input with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>
<label>Add the question text, or prompt, here. This text is required.</label>
<description>You can add an optional tip or note related to the prompt like this. </description>
  <formulaequationinput/>\
</numericalresponse>
</problem>`,
  data: {
    answers: [
      {
        id: 'A',
        title: '[32,-1.3)',
        correct: true,
        selectedFeedback: '<p>You can specify optional feedback like this, which appears after this answer is submitted.</p>',
        isAnswerRange: true,
      },
    ],
  },
  question: '<p>You can use this template as a guide to the simple editor markdown and OLX markup to use for numerical input with hints and feedback problems. Edit this component to replace this template with your own assessment.</p><label>Add the question text, or prompt, here. This text is required.</label><em>You can add an optional tip or note related to the prompt like this.</em>',
  buildOLX: `<problem>
  <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for numerical input with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>
  <label>Add the question text, or prompt, here. This text is required.</label>
  <em>You can add an optional tip or note related to the prompt like this.</em>
  <numericalresponse answer="(-1.3,3/2]">
    <formulaequationinput></formulaequationinput>
  </numericalresponse>
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
  question: `<p>You can use this template as a guide to the simple editor markdown and OLX markup to use for text input with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>
<label>Add the question text, or prompt, here. This text is required.</label>
<em class="olx_description">You can add an optional tip or note related to the prompt like this. </em>`,
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
export const scriptProblemOlX = {
  rawOLX: `<problem>
    <script>
      some code
    </script>
  <numericalresponse answer="100">
  <p>You can use this template as a guide to the simple editor markdown and OLX markup to use for numerical input with hints and feedback problems. Edit this component to replace this template with your own assessment.</p>
<label>Add the question text, or prompt, here. This text is required.</label>
<description>You can add an optional tip or note related to the prompt like this. </description>
<responseparam type="tolerance" default="5"/>
  <formulaequationinput/>
  <correcthint><p>You can specify optional feedback like this, which appears after this answer is submitted.</p></correcthint>
  <additional_answer answer="200"><correcthint><p>You can specify optional feedback like this, which appears after this answer is submitted.</p></correcthint></additional_answer>
</numericalresponse>
</problem>`,
};
export const multipleTextInputProblemOlX = {
  rawOLX: `<problem>
  <stringresponse answer="correct answer">
    <textline size="20"/>
  </stringresponse>
  <stringresponse answer="other correct answer">
    <textline size="20"/>
  </stringresponse>
</problem>`,
};
export const multipleNumericProblemOlX = {
  rawOLX: `<problem>
  <numericalresponse answer="100">
    <formulaequationinput></formulaequationinput>
  </numericalresponse>
  <numericalresponse answer="200">
    <formulaequationinput></formulaequationinput>
  </numericalresponse>
</problem>`,
};
export const NumericAndTextInputProblemOlX = {
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
  question: `<p>
    <strong>
      <span style="background-color: #e03e2d;">
        test
      </span>
    </strong>
  </p>`,
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

export const labelDescriptionQuestionOLX = {
  rawOLX:
`<problem display_name="Eggs b) - Choosing a System" markdown="null" max_attempts="3" weight="0.5">
  <p style="text-align: center;"><img height="274" width="" src="/static/boiling_eggs_water_system.png" alt="boiling eggs: water system"/></p>
  <multiplechoiceresponse>
  <label>Taking the system as just the <b>water</b>, as indicated by the red dashed line, what would be the correct expression for the first law of thermodynamics applied to this system?</label>
  <description>Watch out, boiling water is hot</description>
  <choicegroup type="MultipleChoice">
    <choice correct="true">( Delta E_text{water} = Q )</choice>
    <choice correct="false">( Delta E_text{water} = - W )</choice>
    <choice correct="false">( Delta E_text{water} = 0 )</choice>
  </choicegroup>
  </multiplechoiceresponse>
  <solution>
    <div class="detailed-solution">
      <h2>Explanation</h2>
    </div>
  </solution>
</problem>`,

  question: `<p style="text-align: center;"><img height="274" width="" src="/static/boiling_eggs_water_system.png" alt="boiling eggs: water system"></img></p>
  
  <label>Taking the system as just the <b>water</b>, as indicated by the red dashed line, what would be the correct expression for the first law of thermodynamics applied to this system?</label>
  <em class="olx_description">Watch out, boiling water is hot</em>`,
};

export const htmlEntityTestOLX = {
  rawOLX:
  `<problem>
  <multiplechoiceresponse>
  <p>What is the content of the register x2 after executing the following three lines of instructions?</p>
  <p><span style="font-family: 'courier new', courier;"><strong>Address&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;assembly instructions <br />0x0&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;addi x1, x0, 1<br />0x4&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;slli x2, x1, 4<br />0x8&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;sub x1, x2, x1</strong></span></p>
  <choicegroup type="MultipleChoice">
      <choice correct="false">answerA</choice>
      <choice correct="true">answerB</choice>
    </choicegroup>
  <solution>
  <div class="detailed-solution">
   <p>Explanation</p>
    <p><span style="font-family: 'courier new', courier;"><strong>Address&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;assembly instructions&#160;&#160;&#160;&#160;comment<br />0x0&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;addi x1, x0, 1&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;x1 = 0x1<br />0x4&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;slli x2, x1, 4&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;x2 = x1 &lt;&lt; 4 = 0x10<br />0x8&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;sub x1, x2, x1&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;x1 = x2 - x1 = 0x10 - 0x01 = 0xf</strong></span></p>
    </div>
    </solution>
  </multiplechoiceresponse>
  </problem>`,
  data: {
    answers: [
      {
        id: 'A',
        title: 'answerA',
        correct: false,
      },
      {
        id: 'B',
        title: 'answerB',
        correct: true,
      },
    ],
  },
  question: `<p>What is the content of the register x2 after executing the following three lines of instructions?</p>
  <p><span style="font-family: 'courier new', courier;"><strong>Address&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;assembly instructions <br></br>0x0&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;addi x1, x0, 1<br></br>0x4&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;slli x2, x1, 4<br></br>0x8&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;sub x1, x2, x1</strong></span></p>`,
  solutionExplanation: `<p><span style="font-family: 'courier new', courier;"><strong>Address&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;assembly instructions&#160;&#160;&#160;&#160;comment<br></br>0x0&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;addi x1, x0, 1&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;x1 = 0x1<br></br>0x4&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;slli x2, x1, 4&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;x2 = x1 &lt;&lt; 4 = 0x10<br></br>0x8&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;sub x1, x2, x1&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;x1 = x2 - x1 = 0x10 - 0x01 = 0xf</strong></span></p>`,
};

export const numberParseTestOLX = {
  rawOLX: `<problem>
  <multiplechoiceresponse>
  <p>What is the content of the register x2 after executing the following three lines of instructions?</p>
  <choicegroup type="MultipleChoice">
      <choice correct="false"><span style="font-family: 'courier new', courier;"><strong>0x10</strong></span></choice>
      <choice correct="true"><span style="font-family: 'courier new', courier;"><strong>0x0f</strong></span></choice>
      <choice correct="false"><span style="font-family: 'courier new', courier;"><strong>0x07</strong></span></choice>
      <choice correct="false"><span style="font-family: 'courier new', courier;"><strong>0009</strong></span></choice>
    </choicegroup>
  </multiplechoiceresponse>
  </problem>`,
  data: {
    answers: [
      {
        id: 'A',
        title: `<span style="font-family: 'courier new', courier;"><strong>0x10</strong></span>`,
        correct: false,
      },
      {
        id: 'B',
        title: `<span style="font-family: 'courier new', courier;"><strong>0x0f</strong></span>`,
        correct: true,
      },
      {
        id: 'C',
        title: `<span style="font-family: 'courier new', courier;"><strong>0x07</strong></span>`,
        correct: false,
      },
      {
        id: 'D',
        title: `<span style="font-family: 'courier new', courier;"><strong>0009</strong></span>`,
        correct: false,
      },
    ],
  },
  question: '<p>What is the content of the register x2 after executing the following three lines of instructions?</p>',
  buildOLX: `<problem>
  <multiplechoiceresponse>
  <p>What is the content of the register x2 after executing the following three lines of instructions?</p>
  <choicegroup>
      <choice correct="false"><span style="font-family: &apos;courier new&apos;, courier;"><strong>0x10</strong></span></choice>
      <choice correct="true"><span style="font-family: &apos;courier new&apos;, courier;"><strong>0x0f</strong></span></choice>
      <choice correct="false"><span style="font-family: &apos;courier new&apos;, courier;"><strong>0x07</strong></span></choice>
      <choice correct="false"><span style="font-family: &apos;courier new&apos;, courier;"><strong>0009</strong></span></choice>
    </choicegroup>
  </multiplechoiceresponse>
  </problem>`,
};

export const solutionExplanationTest = {
  rawOLX: `<problem>
      How <code class="lang-matlab">99</code> long is the array <code class="lang-matlab">q</code> after the following loop runs?
      <pre><code class="lang-matlab">for i = 1:99
      q(2*i - 1) = i;
      end</code></pre>
      <numericalresponse answer="197">
        <label/>
        <description>Enter your answer below. Type "e" if this code would produce an error</description>
        <formulaequationinput/>
        <responseparam default="2%" type="tolerance"/>
        <solution>
          <div class="detailed-solution">
            <p>Explanation</p>
            This loop will iterate <code class="lang-matlab">99</code> times, but the length of <code class="lang-matlab">q</code> will not be <code class="lang-matlab">99</code> due to indexing with the value <code class="lang-matlab">2*i -1</code>. On the last iteration, <code class="lang-matlab">i = 99</code>, so <code class="lang-matlab">2*i - 1 = 2*78 - 1 = 197</code>. This will be the last position filled in <code class="lang-matlab">q</code>, so the answer is <code class="lang-matlab">197</code>.
          </div>
        </solution>
      </numericalresponse>
    </problem>`,
  solutionExplanation: `\n            
            This loop will iterate <code class="lang-matlab">99</code> times, but the length of <code class="lang-matlab">q</code> will not be <code class="lang-matlab">99</code> due to indexing with the value <code class="lang-matlab">2*i -1</code>. On the last iteration, <code class="lang-matlab">i = 99</code>, so <code class="lang-matlab">2*i - 1 = 2*78 - 1 = 197</code>. This will be the last position filled in <code class="lang-matlab">q</code>, so the answer is <code class="lang-matlab">197</code>.\n          `,
};

export const solutionExplanationWithoutDivTest = {
  rawOLX: `<problem display_name="For loop" markdown="null" max_attempts="3" showanswer="answered" weight="0.0">
      <multiplechoiceresponse>
        <p>Considering a list z=[8,12,2,9,7] and the following for loop:</p>
        <b>
          <p>for i in z: </p>
          <p>     y=i+1 </p>
          <p>     print(y)</p>
        </b>
        <label>What would be the result of running this code?</label>
        <description>Select the correct answer </description>
        <choicegroup type="MultipleChoice">
          <choice correct="false">8 </choice>
          <choice correct="false">[9,13,3,10,8] </choice>
          <choice correct="true">9<br>
          13</br>
        3
          <br>10</br>
      8 </choice>
        </choicegroup>
        <solution>
          <p/>
          <img src="https://courses.edx.org/asset-v1:MITx+CTL.SC0x+1T2023+type@asset+block@Screenshot_2022-12-19_205625.png"/>
          <p>How would you adjust your code to get the other results? We encourage you to try different for loops and share them in the discussion forum.</p>
        </solution>
      </multiplechoiceresponse>
    </problem>`,
  solutionExplanation: `
          <p></p>
          <img src="https://courses.edx.org/asset-v1:MITx+CTL.SC0x+1T2023+type@asset+block@Screenshot_2022-12-19_205625.png"></img>
          <p>How would you adjust your code to get the other results? We encourage you to try different for loops and share them in the discussion forum.</p>
        `,
};

export const tablesInRichTextTest = {
  rawOLX: `<problem>
    <choiceresponse>
      <p>
        The table shows the number of protein-coding genes, chromosomes, and bases in a range of eukaryotic species.
      </p>
      <table class="chart" summary="A list of eukaryotic organisms and their genome contents." label="Four columns. The first column lists the species, the second column lists the number of protein-coding genes, the third column lists the number of chromosomes, and the fourth column lists the genome size in bases." width="100%">
        <caption>Eukaryotic Genomes Comparison</caption>
        <tbody>
          <tr>
            <th scope="col" style="text-align: center; border: 1px solid black;">
              <b>Species</b>
            </th>
            <th scope="col" style="text-align: center; border: 1px solid black;">
              <b>Protein-coding genes</b>
            </th>
            <th scope="col" style="text-align: center; border: 1px solid black;">
              <b>Chromosomes</b>
            </th>
            <th scope="col" style="text-align: center; border: 1px solid black;">
              <b>Bases</b>
            </th>
          </tr>
          <tr>
            <td style="text-align: center; border: 1px solid black;">Yeast (<i>S. cerevisiae</i>)</td>
            <td style="text-align: center; border: 1px solid black;">~5,800</td>
            <td style="text-align: center; border: 1px solid black;">16</td>
            <td style="text-align: center; border: 1px solid black;">~12 Mb</td>
          </tr>
          <tr>
            <td style="text-align: center; border: 1px solid black;">Arabidopsis (<i>A. thaliana</i>)</td>
            <td style="text-align: center; border: 1px solid black;">~27,000</td>
            <td style="text-align: center; border: 1px solid black;">5</td>
            <td style="text-align: center; border: 1px solid black;">~115 Mb</td>
          </tr>
          <tr>
            <td style="text-align: center; border: 1px solid black;">Rice (<i>O. sativa</i>)</td>
            <td style="text-align: center; border: 1px solid black;">~41,000</td>
            <td style="text-align: center; border: 1px solid black;">12</td>
            <td style="text-align: center; border: 1px solid black;">~390 Mb</td>
          </tr>
          <tr>
            <td style="text-align: center; border: 1px solid black;">Worm (<i>C. elegans</i>)</td>
            <td style="text-align: center; border: 1px solid black;">~19,000</td>
            <td style="text-align: center; border: 1px solid black;">6</td>
            <td style="text-align: center; border: 1px solid black;">~100 Mb</td>
          </tr>
          <tr>
            <td style="text-align: center; border: 1px solid black;">Fly (<i>D. melanogaster</i>)</td>
            <td style="text-align: center; border: 1px solid black;">~14,000</td>
            <td style="text-align: center; border: 1px solid black;">4</td>
            <td style="text-align: center; border: 1px solid black;">~165 Mb</td>
          </tr>
          <tr>
            <td style="text-align: center; border: 1px solid black;">Mouse (<i>M. musculus</i>)</td>
            <td style="text-align: center; border: 1px solid black;">~23,000</td>
            <td style="text-align: center; border: 1px solid black;">20</td>
            <td style="text-align: center; border: 1px solid black;">~3 Gb</td>
          </tr>
          <tr>
            <td style="text-align: center; border: 1px solid black;">Human (<i>H. sapiens</i>)</td>
            <td style="text-align: center; border: 1px solid black;">~21,000</td>
            <td style="text-align: center; border: 1px solid black;">23</td>
            <td style="text-align: center; border: 1px solid black;">~3 Gb</td>
          </tr>
        </tbody>
      </table>
      <p>
        In which of the following observations does the C-value paradox apply? Select all that apply.
      </p>
      <checkboxgroup>
        <choice correct="false">
          <div>
            Rice has a larger genome and more genes than <i>Arabidopsis</i>.
          </div>
        </choice>
        <choice correct="true">
          <div>
            Humans have a larger genome but fewer genes than <i>Arabidopsis</i>.
          </div>
        </choice>
        <choice correct="true">
          <div>
            Worms have a smaller genome but more genes than flies.
          </div>
        </choice>
      </checkboxgroup>
      <solution>
        <div class="detailed-solution">
          <p>
            Explanation
          </p>
          <p>
            Explanation
          </p>
          <p dir="ltr" id="docs-internal-guid-8b7482ab-7fff-27bd-79c5-a433e43a95ea">
            The C-value paradox states that there is no relation between size of genome and number of genes. In the comparison between rice and <i>Arabidopsis</i>, the size of the rice genome is both larger and contains a greater number of genes than <i>Arabidopsis</i>, so the C-value paradox does not apply here. In the remaining options, the larger genomes have fewer genes.
          </p>
        </div>
      </solution>
    </choiceresponse>
  </problem>`,
  question: `<p>
        The table shows the number of protein-coding genes, chromosomes, and bases in a range of eukaryotic species.
      </p>
      <table class="chart" summary="A list of eukaryotic organisms and their genome contents." label="Four columns. The first column lists the species, the second column lists the number of protein-coding genes, the third column lists the number of chromosomes, and the fourth column lists the genome size in bases." width="100%">
        <caption>Eukaryotic Genomes Comparison</caption>
        <tbody>
          <tr>
            <th scope="col" style="text-align: center; border: 1px solid black;">
              <b>Species</b>
            </th>
            <th scope="col" style="text-align: center; border: 1px solid black;">
              <b>Protein-coding genes</b>
            </th>
            <th scope="col" style="text-align: center; border: 1px solid black;">
              <b>Chromosomes</b>
            </th>
            <th scope="col" style="text-align: center; border: 1px solid black;">
              <b>Bases</b>
            </th>
          </tr>
          <tr>
            <td style="text-align: center; border: 1px solid black;">Yeast (<i>S. cerevisiae</i>)</td>
            <td style="text-align: center; border: 1px solid black;">~5,800</td>
            <td style="text-align: center; border: 1px solid black;">16</td>
            <td style="text-align: center; border: 1px solid black;">~12 Mb</td>
          </tr>
          <tr>
            <td style="text-align: center; border: 1px solid black;">Arabidopsis (<i>A. thaliana</i>)</td>
            <td style="text-align: center; border: 1px solid black;">~27,000</td>
            <td style="text-align: center; border: 1px solid black;">5</td>
            <td style="text-align: center; border: 1px solid black;">~115 Mb</td>
          </tr>
          <tr>
            <td style="text-align: center; border: 1px solid black;">Rice (<i>O. sativa</i>)</td>
            <td style="text-align: center; border: 1px solid black;">~41,000</td>
            <td style="text-align: center; border: 1px solid black;">12</td>
            <td style="text-align: center; border: 1px solid black;">~390 Mb</td>
          </tr>
          <tr>
            <td style="text-align: center; border: 1px solid black;">Worm (<i>C. elegans</i>)</td>
            <td style="text-align: center; border: 1px solid black;">~19,000</td>
            <td style="text-align: center; border: 1px solid black;">6</td>
            <td style="text-align: center; border: 1px solid black;">~100 Mb</td>
          </tr>
          <tr>
            <td style="text-align: center; border: 1px solid black;">Fly (<i>D. melanogaster</i>)</td>
            <td style="text-align: center; border: 1px solid black;">~14,000</td>
            <td style="text-align: center; border: 1px solid black;">4</td>
            <td style="text-align: center; border: 1px solid black;">~165 Mb</td>
          </tr>
          <tr>
            <td style="text-align: center; border: 1px solid black;">Mouse (<i>M. musculus</i>)</td>
            <td style="text-align: center; border: 1px solid black;">~23,000</td>
            <td style="text-align: center; border: 1px solid black;">20</td>
            <td style="text-align: center; border: 1px solid black;">~3 Gb</td>
          </tr>
          <tr>
            <td style="text-align: center; border: 1px solid black;">Human (<i>H. sapiens</i>)</td>
            <td style="text-align: center; border: 1px solid black;">~21,000</td>
            <td style="text-align: center; border: 1px solid black;">23</td>
            <td style="text-align: center; border: 1px solid black;">~3 Gb</td>
          </tr>
        </tbody>
      </table>
      <p>
        In which of the following observations does the C-value paradox apply? Select all that apply.
      </p>`,
};

export const parseOutExplanationTests = {
  rawOLX: `<problem>
    <multiplechoiceresponse>
      <choicegroup>
      </choicegroup>
      <solution>
        <p>Explanation</p>
        <p>
          Explanation
        </p>
        <p>solution meat</p>
      </solution>
    </multiplechoiceresponse>
    <demandhint></demandhint>
  </problem>`,
  solutionExplanation: `
        
        
        <p>solution meat</p>
      `
};

export const multiSelectPartialCredit = {
  rawOLX: `<problem>
    <choiceresponse partial_credit="EDC">
      <label>Which of the following is a fruit?</label>
      <description>Select all that apply.</description>
      <checkboxgroup>
        <choice correct="true">apple</choice>
        <choice correct="true">pumpkin</choice>
        <choice correct="false">potato</choice>
        <choice correct="true">tomato</choice>
      </checkboxgroup>
    </choiceresponse>
  </problem>`
}

export const singleSelectPartialCredit = {
  rawOLX: `<problem>
    <multiplechoiceresponse partial_credit="points">
      <label>What Apple device competed with the portable CD player?</label>
      <choicegroup type="MultipleChoice">
        <choice correct="false">The iPad</choice>
        <choice correct="false">Napster</choice>
        <choice correct="true">The iPod</choice>
        <choice correct="partial" point_value="0.25">The vegetable peeler</choice>
      </choicegroup>
    </multiplechoiceresponse>
  </problem>`
}

export const numericalProblemPartialCredit = {
  rawOLX: `<problem>
    <numericalresponse answer="9.3*10^7" partial_credit="close">
      <label>How many miles away from Earth is the sun?</label>
      <description>Use scientific notation to answer.</description>
      <formulaequationinput/>
      <responseparam type="tolerance" default="1%" partial_range="3"/>
    </numericalresponse>
  </problem>`
}

export const unexpectOlxAfterProblemTypeTags = {
  rawOLX: `<problem>
    <multiplechoiceresponse>
      <label>What Apple device competed with the portable CD player?</label>
      <choicegroup type="MultipleChoice">
        <choice correct="false">The iPad</choice>
        <choice correct="false">Napster</choice>
        <choice correct="true">The iPod</choice>
      </choicegroup>
    </multiplechoiceresponse>
    <a href="#">Check out Apple's history for more information.</a>
    <demandhint>
      <hint><p>You can add an optional hint like this. Problems that have a hint include a hint button, and this text appears the first time learners select the button.</p></hint>
      <hint><p>If you add more than one hint, a different hint appears each time learners select the hint button.</p></hint>
    </demandhint>
  </problem>`
}
