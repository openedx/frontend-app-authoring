import { OLXParser } from './OLXParser';
import {
  checkboxesOLXWithFeedbackAndHintsOLX,
  getCheckboxesOLXWithFeedbackAndHintsOLX,
  dropdownOLXWithFeedbackAndHintsOLX,
  numericInputWithFeedbackAndHintsOLX,
  textInputWithFeedbackAndHintsOLX,
  multipleChoiceWithoutAnswers,
  multipleChoiceWithFeedbackAndHintsOLX,
  textInputWithFeedbackAndHintsOLXWithMultipleAnswers,
  advancedProblemOlX,
  multipleProblemOlX,
  multipleProblemTwoOlX,
  multipleProblemThreeOlX,
  blankProblemOLX,
  blankQuestionOLX,
  styledQuestionOLX,
} from './mockData/olxTestData';
import { ProblemTypeKeys } from '../../../data/constants/problem';

describe('Check OLXParser problem type', () => {
  test('Test checkbox with feedback and hints problem type', () => {
    const olxparser = new OLXParser(checkboxesOLXWithFeedbackAndHintsOLX.rawOLX);
    const problemType = olxparser.getProblemType();
    expect(problemType).toBe(ProblemTypeKeys.MULTISELECT);
  });
  test('Test numeric problem type', () => {
    const olxparser = new OLXParser(numericInputWithFeedbackAndHintsOLX.rawOLX);
    const problemType = olxparser.getProblemType();
    expect(problemType).toBe(ProblemTypeKeys.NUMERIC);
  });
  test('Test dropdown with feedback and hints problem type', () => {
    const olxparser = new OLXParser(dropdownOLXWithFeedbackAndHintsOLX.rawOLX);
    const problemType = olxparser.getProblemType();
    expect(problemType).toBe(ProblemTypeKeys.DROPDOWN);
  });
  test('Test multiple choice with feedback and hints problem type', () => {
    const olxparser = new OLXParser(multipleChoiceWithFeedbackAndHintsOLX.rawOLX);
    const problemType = olxparser.getProblemType();
    expect(problemType).toBe(ProblemTypeKeys.SINGLESELECT);
  });
  test('Test textual problem type', () => {
    const olxparser = new OLXParser(textInputWithFeedbackAndHintsOLX.rawOLX);
    const problemType = olxparser.getProblemType();
    expect(problemType).toBe(ProblemTypeKeys.TEXTINPUT);
  });
  test('Test Advanced Problem Type', () => {
    const olxparser = new OLXParser(advancedProblemOlX.rawOLX);
    const problemType = olxparser.getProblemType();
    expect(problemType).toBe(ProblemTypeKeys.ADVANCED);
  });
  test('Test Advanced Problem Type by multiples', () => {
    const olxparser = new OLXParser(multipleProblemOlX.rawOLX);
    const problemType = olxparser.getProblemType();
    expect(problemType).toBe(ProblemTypeKeys.ADVANCED);
  });
  test('Test Advanced Problem Type by multiples, second example', () => {
    const olxparser = new OLXParser(multipleProblemTwoOlX.rawOLX);
    const problemType = olxparser.getProblemType();
    expect(problemType).toBe(ProblemTypeKeys.ADVANCED);
  });
  test('Test Advanced Problem Type by multiples, third example', () => {
    const olxparser = new OLXParser(multipleProblemThreeOlX.rawOLX);
    const problemType = olxparser.getProblemType();
    expect(problemType).toBe(ProblemTypeKeys.ADVANCED);
  });
  test('Test Blank Problem Type', () => {
    const olxparser = new OLXParser(blankProblemOLX.rawOLX);
    const problemType = olxparser.getProblemType();
    expect(problemType).toBe(null);
  });
});

describe('Check OLXParser hints', () => {
  test('Test checkbox hints', () => {
    const olxparser = new OLXParser(checkboxesOLXWithFeedbackAndHintsOLX.rawOLX);
    const hints = olxparser.getHints();
    expect(hints).toEqual(checkboxesOLXWithFeedbackAndHintsOLX.hints);
  });
  test('Test numeric hints', () => {
    const olxparser = new OLXParser(numericInputWithFeedbackAndHintsOLX.rawOLX);
    const hints = olxparser.getHints();
    expect(hints).toEqual(numericInputWithFeedbackAndHintsOLX.hints);
  });
  test('Test dropdown with feedback and hints problem type', () => {
    const olxparser = new OLXParser(dropdownOLXWithFeedbackAndHintsOLX.rawOLX);
    const hints = olxparser.getHints();
    expect(hints).toEqual(dropdownOLXWithFeedbackAndHintsOLX.hints);
  });
  test('Test multiple choice with feedback and hints problem type', () => {
    const olxparser = new OLXParser(multipleChoiceWithFeedbackAndHintsOLX.rawOLX);
    const hints = olxparser.getHints();
    expect(hints).toEqual(multipleChoiceWithFeedbackAndHintsOLX.hints);
  });
  test('Test textual problem type', () => {
    const olxparser = new OLXParser(textInputWithFeedbackAndHintsOLX.rawOLX);
    const hints = olxparser.getHints();
    expect(hints).toEqual(textInputWithFeedbackAndHintsOLX.hints);
  });
});

describe('Check OLXParser for answer parsing', () => {
  test('Test check single select with empty answers', () => {
    const olxparser = new OLXParser(multipleChoiceWithoutAnswers.rawOLX);
    const answer = olxparser.parseMultipleChoiceAnswers('multiplechoiceresponse', 'choicegroup', 'choice');
    expect(answer).toEqual(multipleChoiceWithoutAnswers.data);
  });
  test('Test checkbox answer', () => {
    const olxparser = new OLXParser(checkboxesOLXWithFeedbackAndHintsOLX.rawOLX);
    const answer = olxparser.parseMultipleChoiceAnswers('choiceresponse', 'checkboxgroup', 'choice');
    expect(answer).toEqual(checkboxesOLXWithFeedbackAndHintsOLX.data);
  });
  test('Test dropdown answer', () => {
    const olxparser = new OLXParser(dropdownOLXWithFeedbackAndHintsOLX.rawOLX);
    const answer = olxparser.parseMultipleChoiceAnswers('optionresponse', 'optioninput', 'option');
    expect(answer).toEqual(dropdownOLXWithFeedbackAndHintsOLX.data);
  });
  test('Test multiple choice single select', () => {
    const olxparser = new OLXParser(multipleChoiceWithFeedbackAndHintsOLX.rawOLX);
    const answer = olxparser.parseMultipleChoiceAnswers('multiplechoiceresponse', 'choicegroup', 'choice');
    expect(answer).toEqual(multipleChoiceWithFeedbackAndHintsOLX.data);
  });
  test('Test string response answers', () => {
    const olxparser = new OLXParser(textInputWithFeedbackAndHintsOLX.rawOLX);
    const answer = olxparser.parseStringResponse();
    expect(answer).toEqual(textInputWithFeedbackAndHintsOLX.data);
  });
  test('Test string response answers with multiple answers', () => {
    const olxparser = new OLXParser(textInputWithFeedbackAndHintsOLXWithMultipleAnswers.rawOLX);
    const answer = olxparser.parseStringResponse();
    expect(answer).toEqual(textInputWithFeedbackAndHintsOLXWithMultipleAnswers.data);
  });
  test('Test numerical response answers', () => {
    const olxparser = new OLXParser(numericInputWithFeedbackAndHintsOLX.rawOLX);
    const answer = olxparser.parseNumericResponse();
    expect(answer).toEqual(numericInputWithFeedbackAndHintsOLX.data);
  });
});

describe('Check OLXParser for question parsing', () => {
  test('Test checkbox question', () => {
    const olxparser = new OLXParser(checkboxesOLXWithFeedbackAndHintsOLX.rawOLX);
    const question = olxparser.parseQuestions('choiceresponse');
    expect(question).toEqual(checkboxesOLXWithFeedbackAndHintsOLX.question);
  });
  test('Test dropdown question', () => {
    const olxparser = new OLXParser(dropdownOLXWithFeedbackAndHintsOLX.rawOLX);
    const question = olxparser.parseQuestions('optionresponse');
    expect(question).toEqual(dropdownOLXWithFeedbackAndHintsOLX.question);
  });
  test('Test multiple choice single select question', () => {
    const olxparser = new OLXParser(multipleChoiceWithFeedbackAndHintsOLX.rawOLX);
    const question = olxparser.parseQuestions('multiplechoiceresponse');
    expect(question).toEqual(multipleChoiceWithFeedbackAndHintsOLX.question);
  });
  test('Test string response question', () => {
    const olxparser = new OLXParser(textInputWithFeedbackAndHintsOLX.rawOLX);
    const question = olxparser.parseQuestions('stringresponse');
    expect(question).toEqual(textInputWithFeedbackAndHintsOLX.question);
  });
  test('Test numerical response question', () => {
    const olxparser = new OLXParser(numericInputWithFeedbackAndHintsOLX.rawOLX);
    const question = olxparser.parseQuestions('numericalresponse');
    expect(question).toEqual(numericInputWithFeedbackAndHintsOLX.question);
  });
  test('Test OLX with no question content should have empty string for question', () => {
    const olxparser = new OLXParser(blankQuestionOLX.rawOLX);
    const problemType = olxparser.getProblemType();
    const question = olxparser.parseQuestions(problemType);
    expect(question).toBe(blankQuestionOLX.question);
  });
  test('Test OLX question content with styling should parse/build with correct styling', () => {
    const olxparser = new OLXParser(styledQuestionOLX.rawOLX);
    const problemType = olxparser.getProblemType();
    const question = olxparser.parseQuestions(problemType);
    expect(question).toBe(styledQuestionOLX.question);
  });
});

describe('OLXParser for problem with solution tag', () => {
  describe('for checkbox questions', () => {
    test('should parse simple text', () => {
      const olxparser = new OLXParser(checkboxesOLXWithFeedbackAndHintsOLX.rawOLX);
      const explanation = olxparser.getSolutionExplanation();
      expect(explanation).toEqual(checkboxesOLXWithFeedbackAndHintsOLX.solutionExplanation);
    });
    test('should parse text in p tags', () => {
      const { rawOLX } = getCheckboxesOLXWithFeedbackAndHintsOLX({ solution: 'html' });
      const olxparser = new OLXParser(rawOLX);
      const explanation = olxparser.getSolutionExplanation();
      const expected = getCheckboxesOLXWithFeedbackAndHintsOLX({ solution: 'html' }).solutionExplanation;
      expect(explanation.replace(/\s/g, '')).toBe(expected.replace(/\s/g, ''));
    });
  });
});
