// Parse OLX to JavaScript objects.
/* eslint no-eval: 0 */

import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import _ from 'lodash-es';
import { ProblemTypeKeys } from '../../../data/constants/problem';

export const indexToLetterMap = [...Array(26)].map((val, i) => String.fromCharCode(i + 65));

export const nonQuestionKeys = [
  '@_answer',
  '@_type',
  'additional_answer',
  'checkboxgroup',
  'choicegroup',
  'choiceresponse',
  'correcthint',
  'demandhint',
  'formulaequationinput',
  'multiplechoiceresponse',
  'numericalresponse',
  'optioninput',
  'optionresponse',
  'responseparam',
  'solution',
  'stringequalhint',
  'stringresponse',
  'textline',
];

export const responseKeys = [
  'multiplechoiceresponse',
  'numericalresponse',
  'optionresponse',
  'stringresponse',
  'choiceresponse',
  'multiplechoiceresponse',
  'truefalseresponse',
  'optionresponse',
  'numericalresponse',
  'stringresponse',
  'customresponse',
  'symbolicresponse',
  'coderesponse',
  'externalresponse',
  'formularesponse',
  'schematicresponse',
  'imageresponse',
  'annotationresponse',
  'choicetextresponse',
];

export const stripNonTextTags = ({ input, tag }) => {
  const stripedTags = {};
  Object.entries(input).forEach(([key, value]) => {
    if (key !== tag) {
      stripedTags[key] = value;
    }
  });
  return stripedTags;
};

export class OLXParser {
  constructor(olxString) {
    this.problem = {};
    this.questionData = {};
    const questionOptions = {
      ignoreAttributes: false,
      alwaysCreateTextNode: true,
      numberParseOptions: {
        leadingZeros: false,
        hex: false,
      },
      preserveOrder: true,
      processEntities: false,
    };
    const parserOptions = {
      ignoreAttributes: false,
      alwaysCreateTextNode: true,
      numberParseOptions: {
        leadingZeros: false,
        hex: false,
      },
      processEntities: false,
    };
    const builderOptions = {
      ignoreAttributes: false,
      numberParseOptions: {
        leadingZeros: false,
        hex: false,
      },
      processEntities: false,
    };
    // There are two versions of the parsed XLM because the question requires the order of the
    // parsed data to be preserved. However, all the other widgets need the data grouped by
    // the wrapping tag.
    const questionParser = new XMLParser(questionOptions);
    const parser = new XMLParser(parserOptions);
    this.builder = new XMLBuilder(builderOptions);
    this.parsedOLX = parser.parse(olxString);
    this.parsedQuestionOLX = questionParser.parse(olxString);
    if (_.has(this.parsedOLX, 'problem')) {
      this.problem = this.parsedOLX.problem;
      this.questionData = this.parsedQuestionOLX[0].problem;
    }
  }

  /** parseMultipleChoiceAnswers(problemType, widgetName, option)
   * parseMultipleChoiceAnswers takes a problemType, widgetName, and a valid option. The
   * olx for the given problem type and widget is parsed. Depending on the problem
   * type, the title for an answer will be parsed differently because of single select and multiselect
   * problems are rich text while dropdown answers are plain text. The rich text is parsed into an object
   * and is converted back into a string before being added to the answer object. The parsing returns a
   * data object with an array of answer objects. If the olx has grouped feedback, this will also be
   * included in the data object.
   * @param {string} problemType - string of the olx problem type
   * @param {string} widgetName - string of the wrapping tag name (optioninput, choicegroup, checkboxgroup)
   * @param {string} option - string of the type of answers (choice or option)
   * @return {object} object containing an array of answer objects and possibly an array of grouped feedback
   */
  parseMultipleChoiceAnswers(problemType, widgetName, option) {
    const answers = [];
    let data = {};
    const widget = _.get(this.problem, `${problemType}.${widgetName}`);
    const permissableTags = ['choice', '@_type', 'compoundhint', 'option', '#text'];
    if (_.keys(widget).some((tag) => !permissableTags.includes(tag))) {
      throw new Error('Misc Tags, reverting to Advanced Editor');
    }
    const choice = _.get(widget, option);
    const isComplexAnswer = [ProblemTypeKeys.SINGLESELECT, ProblemTypeKeys.MULTISELECT].includes(problemType);
    if (_.isEmpty(choice)) {
      answers.push(
        {
          id: indexToLetterMap[answers.length],
          title: '',
          correct: true,
        },
      );
    } else if (_.isArray(choice)) {
      choice.forEach((element, index) => {
        let title = element['#text'];
        if (isComplexAnswer) {
          const answerTitle = stripNonTextTags({ input: element, tag: `${option}hint` });
          title = this.builder.build(answerTitle);
        }
        const correct = eval(element['@_correct'].toLowerCase());
        const id = indexToLetterMap[index];
        const feedback = this.getAnswerFeedback(element, `${option}hint`);
        answers.push(
          {
            id,
            correct,
            title,
            ...feedback,
          },
        );
      });
    } else {
      let title = choice['#text'];
      if (isComplexAnswer) {
        const answerTitle = stripNonTextTags({ input: choice, tag: `${option}hint` });
        title = this.builder.build(answerTitle);
      }
      const feedback = this.getAnswerFeedback(choice, `${option}hint`);
      answers.push({
        correct: eval(choice['@_correct'].toLowerCase()),
        id: indexToLetterMap[answers.length],
        title,
        ...feedback,
      });
    }
    data = { answers };
    const groupFeedbackList = this.getGroupedFeedback(widget);
    if (groupFeedbackList.length) {
      data = {
        ...data,
        groupFeedbackList,
      };
    }
    return data;
  }

  /** getAnswerFeedback(choice, hintKey)
   * getAnswerFeedback takes a choice and a valid option. The choice object is checked for
   * selected and unselected feedback. The respective values are added to the feedback object.
   * The feedback object is returned.
   * @param {object} choice - object of an answer choice
   * @param {string} hintKey - string of the wrapping tag name (optionhint or choicehint)
   * @return {object} object containing selected and unselected feedback
   */
  getAnswerFeedback(choice, hintKey) {
    let feedback = {};
    let feedbackKeys = 'selectedFeedback';
    if (_.has(choice, hintKey)) {
      const answerFeedback = choice[hintKey];
      if (_.isArray(answerFeedback)) {
        answerFeedback.forEach((element) => {
          if (_.has(element, '@_selected')) {
            feedbackKeys = eval(element['@_selected'].toLowerCase()) ? 'selectedFeedback' : 'unselectedFeedback';
          }
          feedback = {
            ...feedback,
            [feedbackKeys]: this.builder.build(element),
          };
        });
      } else {
        if (_.has(answerFeedback, '@_selected')) {
          feedbackKeys = eval(answerFeedback['@_selected'].toLowerCase()) ? 'selectedFeedback' : 'unselectedFeedback';
        }
        feedback = {
          [feedbackKeys]: this.builder.build(answerFeedback),
        };
      }
    }
    return feedback;
  }

  /** getGroupedFeedback(choices)
   * getGroupedFeedback takes choices. The choices with the attribute compoundhint are parsed for
   * the text value and the answers associated with the feedback. The groupFeedback array is returned.
   * @param {object} choices - object of problem's subtags
   * @return {array} array containing objects of feedback and associated answer ids
   */
  getGroupedFeedback(choices) {
    const groupFeedback = [];
    if (_.has(choices, 'compoundhint')) {
      const groupFeedbackArray = choices.compoundhint;
      if (_.isArray(groupFeedbackArray)) {
        groupFeedbackArray.forEach((element) => {
          const parsedFeedback = stripNonTextTags({ input: element, tag: '@_value' });
          groupFeedback.push({
            id: groupFeedback.length,
            answers: element['@_value'].split(' '),
            feedback: this.builder.build(parsedFeedback),
          });
        });
      } else {
        const parsedFeedback = stripNonTextTags({ input: groupFeedbackArray, tag: '@_value' });
        groupFeedback.push({
          id: groupFeedback.length,
          answers: groupFeedbackArray['@_value'].split(' '),
          feedback: this.builder.build(parsedFeedback),
        });
      }
    }
    return groupFeedback;
  }

  /** parseStringResponse()
   * The OLX saved to the class constuctor is parsed for text input answers. There are two
   * types of tags with the answer attribute, stringresponse (the problem wrapper) and
   * additional_answer. Looping through each tag, the associated title and feedback are added
   * to the answers object and appended to the answers array. The array returned in an object
   * with the key "answers". The object also conatins additional attributes that belong to the
   * string response tag.
   * @return {object} object containing an array of answer objects and object of additionalStringAttributes
   */
  parseStringResponse() {
    const { stringresponse } = this.problem;
    const answers = [];
    let answerFeedback = '';
    let additionalStringAttributes = {};
    let data = {};
    const feedback = this.getFeedback(stringresponse);
    answers.push({
      id: indexToLetterMap[answers.length],
      title: stringresponse['@_answer'],
      correct: true,
      selectedFeedback: feedback,
    });

    // Parsing additional_answer for string response.
    const additionalAnswer = _.get(stringresponse, 'additional_answer', []);
    if (_.isArray(additionalAnswer)) {
      additionalAnswer.forEach((newAnswer) => {
        answerFeedback = this.getFeedback(newAnswer);
        answers.push({
          id: indexToLetterMap[answers.length],
          title: newAnswer['@_answer'],
          correct: true,
          selectedFeedback: answerFeedback,
        });
      });
    } else {
      answerFeedback = this.getFeedback(additionalAnswer);
      answers.push({
        id: indexToLetterMap[answers.length],
        title: additionalAnswer['@_answer'],
        correct: true,
        selectedFeedback: answerFeedback,
      });
    }

    // Parsing stringequalhint for string response.
    const stringEqualHint = _.get(stringresponse, 'stringequalhint', []);
    if (_.isArray(stringEqualHint)) {
      stringEqualHint.forEach((newAnswer) => {
        const parsedFeedback = stripNonTextTags({ input: newAnswer, tag: '@_answer' });
        answerFeedback = this.builder.build(parsedFeedback);
        answers.push({
          id: indexToLetterMap[answers.length],
          title: newAnswer['@_answer'],
          correct: false,
          selectedFeedback: answerFeedback,
        });
      });
    } else {
      const parsedFeedback = stripNonTextTags({ input: stringEqualHint, tag: '@_answer' });
      answerFeedback = this.builder.build(parsedFeedback);
      answers.push({
        id: indexToLetterMap[answers.length],
        title: stringEqualHint['@_answer'],
        correct: false,
        selectedFeedback: answerFeedback,
      });
    }

    // TODO: Support multiple types.
    additionalStringAttributes = {
      type: _.get(stringresponse, '@_type'),
      textline: {
        size: _.get(stringresponse, 'textline.@_size'),
      },
    };

    data = {
      answers,
      additionalStringAttributes,
    };

    return data;
  }

  /** parseNumericResponse()
   * The OLX saved to the class constuctor is parsed for numeric answers. There are two
   * types of tags for numeric answers, responseparam and additional_answer. Looping through
   * each tag, the associated title and feedback and if the answer is an answer range are
   * added to the answers object and appended to the answers array. The array returned in
   * an object with the key "answers".
   * @return {object} object containing an array of answer objects
   */
  parseNumericResponse() {
    const { numericalresponse } = this.problem;
    let answerFeedback = '';
    const answers = [];
    let responseParam = {};
    const feedback = this.getFeedback(numericalresponse);
    if (_.has(numericalresponse, 'responseparam')) {
      const type = _.get(numericalresponse, 'responseparam.@_type');
      const defaultValue = _.get(numericalresponse, 'responseparam.@_default');
      responseParam = {
        [type]: defaultValue,
      };
    }
    const isAnswerRange = /[([]\d*,\d*[)\]]/gm.test(numericalresponse['@_answer']);
    answers.push({
      id: indexToLetterMap[answers.length],
      title: numericalresponse['@_answer'],
      correct: true,
      selectedFeedback: feedback,
      isAnswerRange,
      ...responseParam,
    });

    // Parsing additional_answer for numerical response.
    const additionalAnswer = _.get(numericalresponse, 'additional_answer', []);
    if (_.isArray(additionalAnswer)) {
      additionalAnswer.forEach((newAnswer) => {
        answerFeedback = this.getFeedback(newAnswer);
        answers.push({
          id: indexToLetterMap[answers.length],
          title: newAnswer['@_answer'],
          correct: true,
          selectedFeedback: answerFeedback,
        });
      });
    } else {
      answerFeedback = this.getFeedback(additionalAnswer);
      answers.push({
        id: indexToLetterMap[answers.length],
        title: additionalAnswer['@_answer'],
        correct: true,
        selectedFeedback: answerFeedback,
        isAnswerRange: false,
      });
    }
    return { answers };
  }

  /** parseQuestions(problemType)
   * parseQuestions takes a problemType. The problem type is used to determine where the
   * text for the question lies (sibling or child to warpping problem type tags).
   * Using the XMLBuilder, the question is built with its proper children (including label
   * and description). The string version of the OLX is return, replacing the description
   * tags with italicized tags for styling purposes.
   * @param {string} problemType - string of the olx problem type
   * @return {string} string of OLX
   */
  parseQuestions(problemType) {
    const options = {
      ignoreAttributes: false,
      numberParseOptions: {
        leadingZeros: false,
        hex: false,
      },
      preserveOrder: true,
      processEntities: false,
    };
    const builder = new XMLBuilder(options);
    const problemArray = _.get(this.questionData[0], problemType) || this.questionData;

    const questionArray = [];
    problemArray.forEach(tag => {
      const tagName = Object.keys(tag)[0];
      if (!nonQuestionKeys.includes(tagName)) {
        if (tagName === 'script') {
          throw new Error('Script Tag, reverting to Advanced Editor');
        }
        questionArray.push(tag);
      } else if (responseKeys.includes(tagName)) {
        /* <label> and <description> tags often are both valid olx as siblings or children of response type tags.
         They, however, do belong in the question, so we append them to the question.
        */
        tag[tagName].forEach(subTag => {
          const subTagName = Object.keys(subTag)[0];
          if (subTagName === 'label' || subTagName === 'description') {
            questionArray.push(subTag);
          }
        });
      }
    });
    const questionString = builder.build(questionArray);
    return questionString.replace(/<description>/gm, '<em>').replace(/<\/description>/gm, '</em>');
  }

  /** getHints()
   * The OLX saved to the class constuctor is parsed for demand hint tags with hint subtags. An empty array is returned
   * if there are no hints in the OLX. Otherwise the hint tag is parsed and appended to the hintsObject arrary. After
   * going through all the hints the hintsObject array is returned.
   * @return {array} array of hint objects
   */
  getHints() {
    const hintsObject = [];
    if (_.has(this.problem, 'demandhint.hint')) {
      const hint = _.get(this.problem, 'demandhint.hint');
      if (_.isArray(hint)) {
        hint.forEach(element => {
          const hintValue = this.builder.build(element);
          hintsObject.push({
            id: hintsObject.length,
            value: hintValue,
          });
        });
      } else {
        const hintValue = this.builder.build(hint);
        hintsObject.push({
          id: hintsObject.length,
          value: hintValue,
        });
      }
    }
    return hintsObject;
  }

  /** parseQuestions(problemType)
   * parseQuestions takes a problemType. The problem type is used to determine where the
   * text for the solution lies (sibling or child to warpping problem type tags).
   * Using the XMLBuilder, the solution is built removing the redundant "explanation" that is
   * appended for Studio styling purposes. The string version of the OLX is return.
   * @param {string} problemType - string of the olx problem type
   * @return {string} string of OLX
   */
  getSolutionExplanation(problemType) {
    if (!_.has(this.problem, `${problemType}.solution`) && !_.has(this.problem, 'solution')) { return null; }
    let solution = _.get(this.problem, `${problemType}.solution`, null) || _.get(this.problem, 'solution', null);
    const wrapper = Object.keys(solution)[0];
    if (Object.keys(solution).length === 1 && wrapper === 'div') {
      const parsedSolution = {};
      Object.entries(solution.div).forEach(([key, value]) => {
        if (key.indexOf('@_' === -1)) {
          // The redundant "explanation" title should be removed.
          // If the key is a paragraph or h2, and the text of either the first or only item is "Explanation."
          if (
            (key === 'p' || key === 'h2')
            && (_.get(value, '#text', null) === 'Explanation'
            || (_.isArray(value) && _.get(value[0], '#text', null) === 'Explanation'))
          ) {
            if (_.isArray(value)) {
              value.shift();
              parsedSolution[key] = value;
            }
          } else {
            parsedSolution[key] = value;
          }
        }
      });
      solution = parsedSolution;
    }
    const solutionString = this.builder.build(solution);
    return solutionString;
  }

  /** getFeedback(xmlElement)
   * getFeedback takes xmlElement. The xmlElement is searched for the attribute correcthint.
   * An empty string is returned if the parameter is not present. Otherwise a string of the feedback
   * is returned.
   * @param {object} xmlElement - object of answer attributes
   * @return {string} string of feedback
   */
  getFeedback(xmlElement) {
    if (!_.has(xmlElement, 'correcthint')) { return ''; }
    const feedback = _.get(xmlElement, 'correcthint');
    const feedbackString = this.builder.build(feedback);
    return feedbackString;
  }

  /** getProblemType()
   * The OLX saved to the class constuctor is parsed for a valid problem type (referencing problemKeys).
   * For blank problems, it returns null. For OLX problems tags not defined in problemKeys or OLX with
   * multiple problem tags, it returns advanced. For defined, single problem tag, it returns the
   * associated problem type.
   * @return {string} problem type
   */
  getProblemType() {
    const problemKeys = Object.keys(this.problem);
    const problemTypeKeys = problemKeys.filter(key => Object.values(ProblemTypeKeys).indexOf(key) !== -1);
    if (problemTypeKeys.length === 0) {
      // a blank problem is a problem which contains only `<problem></problem>` as it's olx.
      // blank problems are not given types, so that a type may be selected.
      if (problemKeys.length === 1 && problemKeys[0] === '#text' && this.problem[problemKeys[0]] === '') {
        return null;
      }
      // if we have no matching problem type, the problem is advanced.
      return ProblemTypeKeys.ADVANCED;
    }
    // make sure compound problems are treated as advanced
    if ((problemTypeKeys.length > 1)
      || (_.isArray(this.problem[problemTypeKeys[0]])
        && this.problem[problemTypeKeys[0]].length > 1)) {
      return ProblemTypeKeys.ADVANCED;
    }
    const problemType = problemTypeKeys[0];
    return problemType;
  }

  /** getGeneralFeedback({ answers, problemType })
   * getGeneralFeedback takes answers and problemType. The problem type determines if the problem should be checked
   * for general feedback. The incorrect answers are checked to seee if all of their feedback is the same and
   * returns the first incorrect answer's feedback if true. When conditions are unmet, it returns and empty string.
   * @param {array} answers - array of answer objects
   * @param {string} problemType - string of string of the olx problem type
   * @return {string} text for incorrect feedback
   */
  getGeneralFeedback({ answers, problemType }) {
    /* Feedback is Generalized for a Problem IFF:
    1. The problem is of Types: Single Select or Dropdown.
    2. All the problem's incorrect, if Selected answers are equivalent strings, and there is no other feedback.
    */
    if (problemType === ProblemTypeKeys.SINGLESELECT || problemType === ProblemTypeKeys.DROPDOWN) {
      const firstIncorrectAnswerText = answers.find(answer => answer.correct === false)?.selectedFeedback;
      const isAllIncorrectSelectedFeedbackTheSame = answers.every(answer => (answer.correct
        ? true
        : answer?.selectedFeedback === firstIncorrectAnswerText
      ));
      if (isAllIncorrectSelectedFeedbackTheSame) {
        return firstIncorrectAnswerText;
      }
    }
    return '';
  }

  getParsedOLXData() {
    if (_.isEmpty(this.problem)) {
      return {};
    }

    if (Object.keys(this.problem).some((key) => key.indexOf('@_') !== -1)) {
      throw new Error('Misc Attributes asscoiated with problem, opening in advanced editor');
    }

    let answersObject = {};
    let additionalAttributes = {};
    let groupFeedbackList = [];
    const problemType = this.getProblemType();
    const hints = this.getHints();
    const question = this.parseQuestions(problemType);
    const solutionExplanation = this.getSolutionExplanation(problemType);

    switch (problemType) {
      case ProblemTypeKeys.DROPDOWN:
        answersObject = this.parseMultipleChoiceAnswers(ProblemTypeKeys.DROPDOWN, 'optioninput', 'option');
        break;
      case ProblemTypeKeys.TEXTINPUT:
        answersObject = this.parseStringResponse();
        break;
      case ProblemTypeKeys.NUMERIC:
        answersObject = this.parseNumericResponse();
        break;
      case ProblemTypeKeys.MULTISELECT:
        answersObject = this.parseMultipleChoiceAnswers(ProblemTypeKeys.MULTISELECT, 'checkboxgroup', 'choice');
        break;
      case ProblemTypeKeys.SINGLESELECT:
        answersObject = this.parseMultipleChoiceAnswers(ProblemTypeKeys.SINGLESELECT, 'choicegroup', 'choice');
        break;
      case ProblemTypeKeys.ADVANCED:
        return {
          problemType,
          settings: {},
        };
      default:
        // if problem is unset, return null
        return {};
    }
    const generalFeedback = this.getGeneralFeedback({ answers: answersObject.answers, problemType });
    if (_.has(answersObject, 'additionalStringAttributes')) {
      additionalAttributes = { ...answersObject.additionalStringAttributes };
    }

    if (_.has(answersObject, 'groupFeedbackList')) {
      groupFeedbackList = answersObject.groupFeedbackList;
    }
    const { answers } = answersObject;
    const settings = { hints };
    if (ProblemTypeKeys.NUMERIC === problemType && _.has(answers[0], 'tolerance')) {
      const toleranceValue = answers[0].tolerance;
      if (!toleranceValue || toleranceValue.length === 0) {
        settings.tolerance = { value: null, type: 'None' };
      } else if (toleranceValue.includes('%')) {
        settings.tolerance = { value: parseInt(toleranceValue.slice(0, -1)), type: 'Percent' };
      } else {
        settings.tolerance = { value: parseInt(toleranceValue), type: 'Number' };
      }
    } else {
      settings.tolerance = { value: null, type: 'None' };
    }
    if (solutionExplanation) { settings.solutionExplanation = solutionExplanation; }

    return {
      question,
      settings,
      answers,
      problemType,
      additionalAttributes,
      generalFeedback,
      groupFeedbackList,
    };
  }
}
