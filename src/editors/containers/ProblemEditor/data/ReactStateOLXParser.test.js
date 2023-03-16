import { OLXParser } from './OLXParser';
import {
  checkboxesOLXWithFeedbackAndHintsOLX,
  dropdownOLXWithFeedbackAndHintsOLX,
  numericInputWithFeedbackAndHintsOLX,
  textInputWithFeedbackAndHintsOLX,
  multipleChoiceWithFeedbackAndHintsOLX,
  textInputWithFeedbackAndHintsOLXWithMultipleAnswers,
} from './mockData/olxTestData';
import {
  checkboxesWithFeedbackAndHints,
  dropdownWithFeedbackAndHints,
  textInputWithFeedbackAndHints,
  multipleChoiceWithFeedbackAndHints,
  numericInputWithFeedbackAndHints,
  textInputWithFeedbackAndHintsWithMultipleAnswers,
} from './mockData/editorTestData';
import ReactStateOLXParser from './ReactStateOLXParser';

describe('Check React Sate OLXParser problem', () => {
  test('Test checkbox with feedback and hints problem type', () => {
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
});
