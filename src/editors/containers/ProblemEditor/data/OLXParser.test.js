import { OLXParser } from './OLXParser';
import {
  checkboxesOLXWithFeedbackAndHintsOLX,
  dropdownOLXWithFeedbackAndHintsOLX,
  numericInputWithFeedbackAndHintsOLX,
  textInputWithFeedbackAndHintsOLX,
  multipleChoiceWithoutAnswers,
  multipleChoiceSingleAnswer,
  multipleChoiceWithFeedbackAndHintsOLX,
  textInputWithFeedbackAndHintsOLXWithMultipleAnswers,
  advancedProblemOlX,
  multipleTextInputProblemOlX,
  multipleNumericProblemOlX,
  multiSelectPartialCredit,
  NumericAndTextInputProblemOlX,
  blankProblemOLX,
  blankQuestionOLX,
  styledQuestionOLX,
  shuffleProblemOLX,
  scriptProblemOlX,
  singleSelectPartialCredit,
  labelDescriptionQuestionOLX,
  htmlEntityTestOLX,
  numberParseTestOLX,
  numericalProblemPartialCredit,
  solutionExplanationTest,
  solutionExplanationWithoutDivTest,
  tablesInRichTextTest,
  parseOutExplanationTests,
  unexpectOlxAfterProblemTypeTags,
} from './mockData/olxTestData';
import { ProblemTypeKeys } from '../../../data/constants/problem';

const blankOlxParser = new OLXParser(blankProblemOLX.rawOLX);
const checkboxOlxParser = new OLXParser(checkboxesOLXWithFeedbackAndHintsOLX.rawOLX);
const numericOlxParser = new OLXParser(numericInputWithFeedbackAndHintsOLX.rawOLX);
const dropdownOlxParser = new OLXParser(dropdownOLXWithFeedbackAndHintsOLX.rawOLX);
const multipleChoiceOlxParser = new OLXParser(multipleChoiceWithFeedbackAndHintsOLX.rawOLX);
const multipleChoiceWithoutAnswersOlxParser = new OLXParser(multipleChoiceWithoutAnswers.rawOLX);
const multipleChoiceSingleAnswerOlxParser = new OLXParser(multipleChoiceSingleAnswer.rawOLX);
const textInputOlxParser = new OLXParser(textInputWithFeedbackAndHintsOLX.rawOLX);
const textInputMultipleAnswersOlxParser = new OLXParser(textInputWithFeedbackAndHintsOLXWithMultipleAnswers.rawOLX);
const advancedOlxParser = new OLXParser(advancedProblemOlX.rawOLX);
const multipleTextInputOlxParser = new OLXParser(multipleTextInputProblemOlX.rawOLX);
const multipleNumericOlxParser = new OLXParser(multipleNumericProblemOlX.rawOLX);
const numericAndTextInputOlxParser = new OLXParser(NumericAndTextInputProblemOlX.rawOLX);
const labelDescriptionQuestionOlxParser = new OLXParser(labelDescriptionQuestionOLX.rawOLX);
const shuffleOlxParser = new OLXParser(shuffleProblemOLX.rawOLX);
const multiSelectPartialCreditOlxParser = new OLXParser(multiSelectPartialCredit.rawOLX);
const singleSelectPartialCreditParser = new OLXParser(singleSelectPartialCredit.rawOLX);
const numericalProblemPartialCreditParser = new OLXParser(numericalProblemPartialCredit.rawOLX);

describe('OLXParser', () => {
  describe('throws error and redirects to advanced editor', () => {
    describe('when settings attributes are on problem tags', () => {
      it('should throw error and contain message regarding opening advanced editor', () => {
        try {
          labelDescriptionQuestionOlxParser.getParsedOLXData();
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
          expect(e.message).toBe('Unrecognized attribute "markdown" associated with problem, opening in advanced editor');
        }
      });
    });
    describe('when settings attributes are on problem tags', () => {
      it('should throw error and contain message regarding opening advanced editor', () => {
        try {
          shuffleOlxParser.getParsedOLXData();
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
          expect(e.message).toBe('Misc Tags, reverting to Advanced Editor');
        }
      });
    });
    describe('when question parser finds script tags', () => {
      it('should throw error and contain message regarding opening advanced editor', () => {
        const olxparser = new OLXParser(scriptProblemOlX.rawOLX);
        expect(() => olxparser.parseQuestions('numericalresponse')).toThrow(new Error('Script Tag, reverting to Advanced Editor'));
      });
    });
    describe('when multi select problem finds partial_credit attribute', () => {
      it('should throw error and contain message regarding opening advanced editor', () => {
        try {
          multiSelectPartialCreditOlxParser.getParsedOLXData();
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
          expect(e.message).toBe('Partial credit not supported by GUI, reverting to Advanced Editor');
        }
      });
    });
    describe('when numerical problem finds partial_credit attribute', () => {
      it('should throw error and contain message regarding opening advanced editor', () => {
        try {
          numericalProblemPartialCreditParser.getParsedOLXData();
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
          expect(e.message).toBe('Partial credit not supported by GUI, reverting to Advanced Editor');
        }
      });
    });
    describe('when single select problem finds partial_credit attribute', () => {
      it('should throw error and contain message regarding opening advanced editor', () => {
        try {
          singleSelectPartialCreditParser.getParsedOLXData();
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
          expect(e.message).toBe('Partial credit not supported by GUI, reverting to Advanced Editor');
        }
      });
    });
    describe('when signle select problem has unexpected olx after multiplechoiceresponse tag', () => {
      it('should throw error and contain message regarding opening advanced editor', () => {
        const unexpectOlxAfterProblemTypeTagsParser = new OLXParser(unexpectOlxAfterProblemTypeTags.rawOLX);
        try {
          unexpectOlxAfterProblemTypeTagsParser.getParsedOLXData();
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
          expect(e.message).toBe('OLX found after the multiplechoiceresponse tags, opening in advanced editor');
        }
      });
    });
  });
  describe('getProblemType()', () => {
    describe('given a blank problem', () => {
      const problemType = blankOlxParser.getProblemType();
      it('should equal ProblemTypeKeys.MULTISELECT', () => {
        expect(problemType).toEqual(null);
      });
    });
    describe('given checkbox olx with feedback and hints', () => {
      const problemType = checkboxOlxParser.getProblemType();
      it('should equal ProblemTypeKeys.MULTISELECT', () => {
        expect(problemType).toEqual(ProblemTypeKeys.MULTISELECT);
      });
    });
    describe('given numeric olx with feedback and hints', () => {
      const problemType = numericOlxParser.getProblemType();
      it('should equal ProblemTypeKeys.NUMERIC', () => {
        expect(problemType).toEqual(ProblemTypeKeys.NUMERIC);
      });
    });
    describe('given dropdown olx with feedback and hints', () => {
      const problemType = dropdownOlxParser.getProblemType();
      it('should equal ProblemTypeKeys.DROPDOWN', () => {
        expect(problemType).toEqual(ProblemTypeKeys.DROPDOWN);
      });
    });
    describe('given multiple choice olx with feedback and hints', () => {
      const problemType = multipleChoiceOlxParser.getProblemType();
      it('should equal ProblemTypeKeys.SINGLESELECT', () => {
        expect(problemType).toEqual(ProblemTypeKeys.SINGLESELECT);
      });
    });
    describe('given text input olx with feedback and hints', () => {
      const problemType = textInputOlxParser.getProblemType();
      it('should equal ProblemTypeKeys.TEXTINPUT', () => {
        expect(problemType).toEqual(ProblemTypeKeys.TEXTINPUT);
      });
    });
    describe('given an advanced problem', () => {
      const problemType = advancedOlxParser.getProblemType();
      it('should equal ProblemTypeKeys.ADVANCED', () => {
        expect(problemType).toEqual(ProblemTypeKeys.ADVANCED);
      });
    });
    describe('given a problem with multiple text inputs', () => {
      const problemType = multipleTextInputOlxParser.getProblemType();
      it('should equal ProblemTypeKeys.ADVANCED', () => {
        expect(problemType).toEqual(ProblemTypeKeys.ADVANCED);
      });
    });
    describe('given a problem with multiple numeric inputs', () => {
      const problemType = multipleNumericOlxParser.getProblemType();
      it('should equal ProblemTypeKeys.ADVANCED', () => {
        expect(problemType).toEqual(ProblemTypeKeys.ADVANCED);
      });
    });
    describe('given a problem with both a text and numeric input', () => {
      const problemType = numericAndTextInputOlxParser.getProblemType();
      it('should equal ProblemTypeKeys.ADVANCED', () => {
        expect(problemType).toEqual(ProblemTypeKeys.ADVANCED);
      });
    });
  });
  describe('getHints()', () => {
    describe('given a problem with no hints', () => {
      const hints = labelDescriptionQuestionOlxParser.getHints();
      it('should return an empty array', () => {
        expect(hints).toEqual([]);
      });
    });
    describe('given checkbox olx with feedback and hints', () => {
      const hints = checkboxOlxParser.getHints();
      it('should equal an array of hints', () => {
        expect(hints).toEqual(checkboxesOLXWithFeedbackAndHintsOLX.hints);
      });
    });
    describe('given numeric olx with feedback and hints', () => {
      const hints = numericOlxParser.getHints();
      it('should equal an array of hints', () => {
        expect(hints).toEqual(numericInputWithFeedbackAndHintsOLX.hints);
      });
    });
    describe('given dropdown olx with feedback and hints', () => {
      const hints = dropdownOlxParser.getHints();
      it('should equal an array of hints', () => {
        expect(hints).toEqual(dropdownOLXWithFeedbackAndHintsOLX.hints);
      });
    });
    describe('given multiple choice olx with feedback and hints', () => {
      const hints = multipleChoiceOlxParser.getHints();
      it('should equal an array of hints', () => {
        expect(hints).toEqual(multipleChoiceWithFeedbackAndHintsOLX.hints);
      });
    });
    describe('given text input olx with feedback and hints', () => {
      const hints = textInputOlxParser.getHints();
      it('should equal an array of hints', () => {
        expect(hints).toEqual(textInputWithFeedbackAndHintsOLX.hints);
      });
    });
  });
  describe('parseMultipleChoiceAnswers()', () => {
    describe('given a problem with no answers', () => {
      const { answers } = multipleChoiceWithoutAnswersOlxParser.parseMultipleChoiceAnswers(
        'multiplechoiceresponse',
        'choicegroup',
        'choice',
      );
      it('should return a default answer', () => {
        expect(answers).toEqual(multipleChoiceWithoutAnswers.data.answers);
        expect(answers).toHaveLength(1);
      });
    });
    describe('given a problem with one answer', () => {
      const { answers } = multipleChoiceSingleAnswerOlxParser.parseMultipleChoiceAnswers(
        'multiplechoiceresponse',
        'choicegroup',
        'choice',
      );
      it('should return a single answer', () => {
        expect(answers).toEqual(multipleChoiceSingleAnswer.data.answers);
        expect(answers).toHaveLength(1);
      });
    });
    describe('given multiple choice olx with hex numbers and leading zeros', () => {
      const olxparser = new OLXParser(numberParseTestOLX.rawOLX);
      const { answers } = olxparser.parseMultipleChoiceAnswers('multiplechoiceresponse', 'choicegroup', 'choice');
      it('should not parse hex numbers and leading zeros', () => {
        expect(answers).toEqual(numberParseTestOLX.data.answers);
      });
      it('should equal an array of objects with length four', () => {
        expect(answers).toHaveLength(4);
      });
    });
    describe('given checkbox olx with feedback and hints', () => {
      const { answers } = checkboxOlxParser.parseMultipleChoiceAnswers('choiceresponse', 'checkboxgroup', 'choice');
      it('should equal an array of objects with length four', () => {
        expect(answers).toEqual(checkboxesOLXWithFeedbackAndHintsOLX.data.answers);
        expect(answers).toHaveLength(4);
      });
    });
    describe('given dropdown olx with feedback and hints', () => {
      const { answers } = dropdownOlxParser.parseMultipleChoiceAnswers('optionresponse', 'optioninput', 'option');
      it('should equal an array of objects with length three', () => {
        expect(answers).toEqual(dropdownOLXWithFeedbackAndHintsOLX.data.answers);
        expect(answers).toHaveLength(3);
      });
    });
    describe('given multiple choice olx with feedback and hints', () => {
      const { answers } = multipleChoiceOlxParser.parseMultipleChoiceAnswers('multiplechoiceresponse', 'choicegroup', 'choice');
      it('should equal an array of objects with length three', () => {
        expect(answers).toEqual(multipleChoiceWithFeedbackAndHintsOLX.data.answers);
        expect(answers).toHaveLength(3);
      });
    });
  });
  describe('parseStringResponse()', () => {
    // describe('given a problem with no answers', () => {
    //   // TODO
    // });
    describe('given text input olx with feedback and hints', () => {
      const { answers } = textInputOlxParser.parseStringResponse();
      it('should equal an array of objects with length three', () => {
        expect(answers).toEqual(textInputWithFeedbackAndHintsOLX.data.answers);
        expect(answers).toHaveLength(3);
      });
    });
    describe('given text input olx with feedback and hints with multiple answers', () => {
      const { answers } = textInputMultipleAnswersOlxParser.parseStringResponse();
      it('should equal an array of objects with length four', () => {
        expect(answers).toEqual(textInputWithFeedbackAndHintsOLXWithMultipleAnswers.data.answers);
        expect(answers).toHaveLength(4);
      });
    });
  });
  describe('parseNumericResponse()', () => {
    // describe('given a problem with no answers', () => {
    //   // TODDO
    // });
    describe('given numeric olx with feedback and hints', () => {
      const { answers } = numericOlxParser.parseNumericResponse();
      it('should equal an array of objects with length two', () => {
        expect(answers).toEqual(numericInputWithFeedbackAndHintsOLX.data.answers);
        expect(answers).toHaveLength(2);
      });
    });
  });
  describe('parseQuestions()', () => {
    describe('given olx with no question content', () => {
      const olxparser = new OLXParser(blankQuestionOLX.rawOLX);
      const problemType = olxparser.getProblemType();
      const question = olxparser.parseQuestions(problemType);
      it('should return an empty string for question', () => {
        expect(question.trim()).toBe(blankQuestionOLX.question);
      });
    });
    describe('given a simple problem olx', () => {
      const question = textInputOlxParser.parseQuestions('stringresponse');
      it('should return a string of HTML', () => {
        expect(question.trim()).toEqual(textInputWithFeedbackAndHintsOLX.question);
      });
    });
    describe('given olx with html entities', () => {
      const olxparser = new OLXParser(htmlEntityTestOLX.rawOLX);
      const problemType = olxparser.getProblemType();
      const question = olxparser.parseQuestions(problemType);
      it('should not encode html entities', () => {
        expect(question.trim()).toEqual(htmlEntityTestOLX.question);
      });
    });
    describe('given olx with styled content', () => {
      const olxparser = new OLXParser(styledQuestionOLX.rawOLX);
      const problemType = olxparser.getProblemType();
      const question = olxparser.parseQuestions(problemType);
      it('should pase/build correct styling', () => {
        expect(question.trim()).toBe(styledQuestionOLX.question);
      });
    });
    describe('given olx with label and description tags inside response tag', () => {
      const olxparser = new OLXParser(labelDescriptionQuestionOLX.rawOLX);
      const problemType = olxparser.getProblemType();
      const question = olxparser.parseQuestions(problemType);
      it('should append the label/description to the question, converting description to <em> with "olx_description" class', () => {
        expect(question.trim()).toBe(labelDescriptionQuestionOLX.question);
      });
    });
    describe('given olx with table tags', () => {
      const olxparser = new OLXParser(tablesInRichTextTest.rawOLX);
      const problemType = olxparser.getProblemType();
      const question = olxparser.parseQuestions(problemType);
      it('should append the table to the question', () => {
        expect(question.trim()).toBe(tablesInRichTextTest.question);
      });
    });
  });
  describe('getSolutionExplanation()', () => {
    describe('for checkbox questions', () => {
      test('should parse text in p tags', () => {
        const olxparser = new OLXParser(checkboxesOLXWithFeedbackAndHintsOLX.rawOLX);
        const problemType = olxparser.getProblemType();
        const explanation = olxparser.getSolutionExplanation(problemType);
        const expected = checkboxesOLXWithFeedbackAndHintsOLX.solutionExplanation;
        expect(explanation.replace(/\s/g, '')).toBe(expected.replace(/\s/g, ''));
      });
    });
    it('should parse text with proper spacing', () => {
      const olxparser = new OLXParser(solutionExplanationTest.rawOLX);
      const problemType = olxparser.getProblemType();
      const explanation = olxparser.getSolutionExplanation(problemType);
      expect(explanation).toBe(solutionExplanationTest.solutionExplanation);
    });
    it('should parse solution fields without div', () => {
      const olxparser = new OLXParser(solutionExplanationWithoutDivTest.rawOLX);
      const problemType = olxparser.getProblemType();
      const explanation = olxparser.getSolutionExplanation(problemType);
      expect(explanation).toBe(solutionExplanationWithoutDivTest.solutionExplanation);
    });
    it('should parse out <p>Explanation</p>', () => {
      const olxparser = new OLXParser(parseOutExplanationTests.rawOLX);
      const problemType = olxparser.getProblemType();
      const explanation = olxparser.getSolutionExplanation(problemType);
      expect(explanation).toBe(parseOutExplanationTests.solutionExplanation);
    });
  });
});
