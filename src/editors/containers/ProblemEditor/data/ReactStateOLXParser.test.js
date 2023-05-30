import { OLXParser } from './OLXParser';
import {
  checkboxesOLXWithFeedbackAndHintsOLX,
  dropdownOLXWithFeedbackAndHintsOLX,
  numericInputWithFeedbackAndHintsOLX,
  numericInputWithAnswerRangeOLX,
  textInputWithFeedbackAndHintsOLX,
  multipleChoiceWithFeedbackAndHintsOLX,
  textInputWithFeedbackAndHintsOLXWithMultipleAnswers,
  numberParseTestOLX,
} from './mockData/olxTestData';
import {
  checkboxesWithFeedbackAndHints,
  dropdownWithFeedbackAndHints,
  textInputWithFeedbackAndHints,
  multipleChoiceWithFeedbackAndHints,
  numericInputWithFeedbackAndHints,
  numericInputWithAnswerRange,
  textInputWithFeedbackAndHintsWithMultipleAnswers,
  numberParseTest,
} from './mockData/editorTestData';
import ReactStateOLXParser from './ReactStateOLXParser';

describe('Check React State OLXParser problem', () => {
  test('for checkbox with feedback and hints problem type', () => {
    const olxparser = new OLXParser(checkboxesOLXWithFeedbackAndHintsOLX.rawOLX);
    const problem = olxparser.getParsedOLXData();
    const stateParser = new ReactStateOLXParser({
      problem,
      editorObject: checkboxesWithFeedbackAndHints,
    });
    const buildOLX = stateParser.buildOLX();
    expect(buildOLX.replace(/\s/g, '')).toBe(checkboxesOLXWithFeedbackAndHintsOLX.buildOLX.replace(/\s/g, ''));
  });
  test('Test dropdown with feedback and hints problem type', () => {
    const olxparser = new OLXParser(dropdownOLXWithFeedbackAndHintsOLX.rawOLX);
    const problem = olxparser.getParsedOLXData();
    const stateParser = new ReactStateOLXParser({
      problem,
      editorObject: dropdownWithFeedbackAndHints,
    });
    const buildOLX = stateParser.buildOLX();
    expect(buildOLX.replace(/\s/g, '')).toEqual(dropdownOLXWithFeedbackAndHintsOLX.buildOLX.replace(/\s/g, ''));
  });
  test('Test string response with feedback and hints problem type', () => {
    const olxparser = new OLXParser(textInputWithFeedbackAndHintsOLX.rawOLX);
    const problem = olxparser.getParsedOLXData();
    const stateParser = new ReactStateOLXParser({
      problem,
      editorObject: textInputWithFeedbackAndHints,
    });
    const buildOLX = stateParser.buildOLX();
    expect(buildOLX.replace(/\s/g, '')).toEqual(textInputWithFeedbackAndHintsOLX.buildOLX.replace(/\s/g, ''));
  });
  test('Test multiple choice with feedback and hints problem type', () => {
    const olxparser = new OLXParser(multipleChoiceWithFeedbackAndHintsOLX.rawOLX);
    const problem = olxparser.getParsedOLXData();
    const stateParser = new ReactStateOLXParser({
      problem,
      editorObject: multipleChoiceWithFeedbackAndHints,
    });
    const buildOLX = stateParser.buildOLX();
    expect(buildOLX.replace(/\s/g, '')).toEqual(multipleChoiceWithFeedbackAndHintsOLX.buildOLX.replace(/\s/g, ''));
  });
  test('Test numerical response with feedback and hints problem type', () => {
    const olxparser = new OLXParser(numericInputWithFeedbackAndHintsOLX.rawOLX);
    const problem = olxparser.getParsedOLXData();
    const stateParser = new ReactStateOLXParser({
      problem,
      editorObject: numericInputWithFeedbackAndHints,
    });
    const buildOLX = stateParser.buildOLX();
    expect(buildOLX.replace(/\s/g, '')).toEqual(numericInputWithFeedbackAndHintsOLX.buildOLX.replace(/\s/g, ''));
  });

  test('Test numerical response with isAnswerRange true', () => {
    const olxparser = new OLXParser(numericInputWithAnswerRangeOLX.rawOLX);
    const problem = olxparser.getParsedOLXData();
    const stateParser = new ReactStateOLXParser({
      problem,
      editorObject: numericInputWithAnswerRange,
    });
    const buildOLX = stateParser.buildOLX();
    expect(buildOLX.replace(/\s/g, '')).toEqual(numericInputWithAnswerRangeOLX.buildOLX.replace(/\s/g, ''));
  });
  test('Test string response with feedback and hints, multiple answers', () => {
    const olxparser = new OLXParser(textInputWithFeedbackAndHintsOLXWithMultipleAnswers.rawOLX);
    const problem = olxparser.getParsedOLXData();
    const stateParser = new ReactStateOLXParser({
      problem,
      editorObject: textInputWithFeedbackAndHintsWithMultipleAnswers,
    });
    const buildOLX = stateParser.buildOLX();
    expect(buildOLX.replace(/\s/g, '')).toEqual(textInputWithFeedbackAndHintsOLXWithMultipleAnswers.buildOLX.replace(/\s/g, ''));
  });
  describe('encode/decode', () => {
    test('does not change hex values to dec and does not remove leading 0s', () => {
      const olxparser = new OLXParser(numberParseTestOLX.rawOLX);
      const problem = olxparser.getParsedOLXData();
      const stateParser = new ReactStateOLXParser({
        problem,
        editorObject: numberParseTest,
      });
      const buildOLX = stateParser.buildOLX();
      expect(buildOLX.replace(/\s/g, '')).toEqual(numberParseTestOLX.buildOLX.replace(/\s/g, ''));
    });
  });
});
