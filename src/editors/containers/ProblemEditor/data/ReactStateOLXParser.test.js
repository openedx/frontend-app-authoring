import { OLXParser } from './OLXParser';
import {
  checkboxesOLXWithFeedbackAndHintsOLX,
  dropdownOLXWithFeedbackAndHintsOLX,
  numericInputWithFeedbackAndHintsOLX,
  numericInputWithFeedbackAndHintsOLXException,
  textInputWithFeedbackAndHintsOLX,
  multipleChoiceWithFeedbackAndHintsOLX,
  textInputWithFeedbackAndHintsOLXWithMultipleAnswers,
} from './mockData/olxTestData';
import ReactStateOLXParser from './ReactStateOLXParser';

describe('Check React Sate OLXParser problem', () => {
  test('Test checkbox with feedback and hints problem type', () => {
    const olxparser = new OLXParser(checkboxesOLXWithFeedbackAndHintsOLX.rawOLX);
    const problem = olxparser.getParsedOLXData();
    const stateParser = new ReactStateOLXParser({ problem });
    const buildOLX = stateParser.buildOLX();
    expect(buildOLX).toEqual(checkboxesOLXWithFeedbackAndHintsOLX.buildOLX);
  });
  test('Test dropdown with feedback and hints problem type', () => {
    const olxparser = new OLXParser(dropdownOLXWithFeedbackAndHintsOLX.rawOLX);
    const problem = olxparser.getParsedOLXData();
    const stateParser = new ReactStateOLXParser({ problem });
    const buildOLX = stateParser.buildOLX();
    expect(buildOLX).toEqual(dropdownOLXWithFeedbackAndHintsOLX.buildOLX);
  });
  test('Test string response with feedback and hints problem type', () => {
    const olxparser = new OLXParser(textInputWithFeedbackAndHintsOLX.rawOLX);
    const problem = olxparser.getParsedOLXData();
    const stateParser = new ReactStateOLXParser({ problem });
    const buildOLX = stateParser.buildOLX();
    expect(buildOLX).toEqual(textInputWithFeedbackAndHintsOLX.buildOLX);
  });
  test('Test multiple choice with feedback and hints problem type', () => {
    const olxparser = new OLXParser(multipleChoiceWithFeedbackAndHintsOLX.rawOLX);
    const problem = olxparser.getParsedOLXData();
    const stateParser = new ReactStateOLXParser({ problem });
    const buildOLX = stateParser.buildOLX();
    expect(buildOLX).toEqual(multipleChoiceWithFeedbackAndHintsOLX.buildOLX);
  });
  test('Test numerical response with feedback and hints problem type', () => {
    const olxparser = new OLXParser(numericInputWithFeedbackAndHintsOLX.rawOLX);
    const problem = olxparser.getParsedOLXData();
    const stateParser = new ReactStateOLXParser({ problem });
    const buildOLX = stateParser.buildOLX();
    expect(buildOLX).toEqual(numericInputWithFeedbackAndHintsOLX.buildOLX);
  });
  test('Test numerical response with feedback and hints problem type with exception', () => {
    const olxparser = new OLXParser(numericInputWithFeedbackAndHintsOLXException.rawOLX);
    const problem = olxparser.getParsedOLXData();
    const stateParser = new ReactStateOLXParser({ problem });
    const buildOLX = stateParser.buildOLX();
    expect(buildOLX).toEqual(numericInputWithFeedbackAndHintsOLXException.buildOLX);
  });
  test('Test string response with feedback and hints, multiple answers', () => {
    const olxparser = new OLXParser(textInputWithFeedbackAndHintsOLXWithMultipleAnswers.rawOLX);
    const problem = olxparser.getParsedOLXData();
    const stateParser = new ReactStateOLXParser({ problem });
    const buildOLX = stateParser.buildOLX();
    expect(buildOLX).toEqual(textInputWithFeedbackAndHintsOLXWithMultipleAnswers.buildOLX);
  });
});
