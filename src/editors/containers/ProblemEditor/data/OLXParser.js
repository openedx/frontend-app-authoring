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

export class OLXParser {
  constructor(olxString) {
    this.problem = {};
    this.questionData = {};
    const questionOptions = {
      ignoreAttributes: false,
      alwaysCreateTextNode: true,
      preserveOrder: true,
    };
    const options = {
      ignoreAttributes: false,
      alwaysCreateTextNode: true,
    };
    // There are two versions of the parsed XLM because the question requires the order of the
    // parsed data to be preserved. However, all the other widgets need the data grouped by
    // the wrapping tag.
    const questionParser = new XMLParser(questionOptions);
    const parser = new XMLParser(options);
    this.parsedOLX = parser.parse(olxString);
    this.parsedQuestionOLX = questionParser.parse(olxString);
    if (_.has(this.parsedOLX, 'problem')) {
      this.problem = this.parsedOLX.problem;
      this.questionData = this.parsedQuestionOLX[0].problem;
    }
  }

  parseMultipleChoiceAnswers(problemType, widgetName, option) {
    const answers = [];
    let data = {};
    const widget = _.get(this.problem, `${problemType}.${widgetName}`);
    const choice = _.get(widget, option);
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
        const title = element['#text'];
        const correct = eval(element['@_correct'].toLowerCase());
        const id = indexToLetterMap[index];
        const feedback = this.getAnswerFeedback(element, `${option}hint`);
        answers.push(
          {
            id,
            title,
            correct,
            ...feedback,
          },
        );
      });
    } else {
      const feedback = this.getAnswerFeedback(choice, `${option}hint`);
      answers.push({
        title: choice['#text'],
        correct: eval(choice['@_correct'].toLowerCase()),
        id: indexToLetterMap[answers.length],
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

  getAnswerFeedback(choice, hintKey) {
    let feedback = {};
    let feedbackKeys = 'feedback';
    if (_.has(choice, hintKey)) {
      const answerFeedback = choice[hintKey];
      if (_.isArray(answerFeedback)) {
        answerFeedback.forEach((element) => {
          if (_.has(element, '@_selected')) {
            feedbackKeys = eval(element['@_selected'].toLowerCase()) ? 'selectedFeedback' : 'unselectedFeedback';
          }
          feedback = {
            ...feedback,
            [feedbackKeys]: element['#text'],
          };
        });
      } else {
        if (_.has(answerFeedback, '@_selected')) {
          feedbackKeys = eval(answerFeedback['@_selected'].toLowerCase()) ? 'selectedFeedback' : 'unselectedFeedback';
        }
        feedback = {
          [feedbackKeys]: answerFeedback['#text'],
        };
      }
    }
    return feedback;
  }

  getGroupedFeedback(choices) {
    const groupFeedback = [];
    if (_.has(choices, 'compoundhint')) {
      const groupFeedbackArray = choices.compoundhint;
      if (_.isArray(groupFeedbackArray)) {
        groupFeedbackArray.forEach((element) => {
          groupFeedback.push({
            id: groupFeedback.length,
            answers: element['@_value'].split(' '),
            feedback: element['#text'],
          });
        });
      } else {
        groupFeedback.push({
          id: groupFeedback.length,
          answers: groupFeedbackArray['@_value'].split(' '),
          feedback: groupFeedbackArray['#text'],
        });
      }
    }
    return groupFeedback;
  }

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
        answers.push({
          id: indexToLetterMap[answers.length],
          title: newAnswer['@_answer'],
          correct: false,
          selectedFeedback: newAnswer['#text'],
        });
      });
    } else {
      answers.push({
        id: indexToLetterMap[answers.length],
        title: stringEqualHint['@_answer'],
        correct: false,
        selectedFeedback: stringEqualHint['#text'],
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

  parseNumericResponse() {
    const { numericalresponse } = this.problem;
    let answerFeedback = '';
    const answers = [];
    let responseParam = {};
    // TODO: UI needs to be added to support adding tolerence in numeric response.
    const feedback = this.getFeedback(numericalresponse);
    if (_.has(numericalresponse, 'responseparam')) {
      const type = _.get(numericalresponse, 'responseparam.@_type');
      const defaultValue = _.get(numericalresponse, 'responseparam.@_default');
      responseParam = {
        [type]: defaultValue,
      };
    }
    answers.push({
      id: indexToLetterMap[answers.length],
      title: numericalresponse['@_answer'],
      correct: true,
      selectedFeedback: feedback,
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
      });
    }
    return { answers };
  }

  parseQuestions(problemType) {
    const options = {
      ignoreAttributes: false,
      preserveOrder: true,
    };
    const builder = new XMLBuilder(options);
    const problemArray = _.get(this.questionData[0], problemType) || this.questionData;
    /* TODO: How do we uniquely identify the description?
      In order to parse description, there should be two states
      and settings should be introduced to edit the label and description.
      In turn editing the settings update the state and then it can be added to
      the parsed OLX.
    */
    const questionArray = [];
    problemArray.forEach(tag => {
      const tagName = Object.keys(tag)[0];
      if (!nonQuestionKeys.includes(tagName)) {
        questionArray.push(tag);
      }
    });
    const questionString = builder.build(questionArray);
    return questionString.replace(/<description>/gm, '<em>').replace(/<\/description>/gm, '</em>');
  }

  getHints() {
    const hintsObject = [];
    if (_.has(this.problem, 'demandhint.hint')) {
      const hint = _.get(this.problem, 'demandhint.hint');
      if (_.isArray(hint)) {
        hint.forEach(element => {
          hintsObject.push({
            id: hintsObject.length,
            value: element['#text'],
          });
        });
      } else {
        hintsObject.push({
          id: hintsObject.length,
          value: hint['#text'],
        });
      }
    }
    return hintsObject;
  }

  #extractTextAndChildren(node) {
    const children = [];
    let text = null;

    if (_.isArray(node)) {
      children.push(...node);
    } else if (_.isPlainObject(node)) {
      text = _.get(node, '#text');
      const nodeWithoutText = _.omit(node, '#text');
      children.push(...Object.values(nodeWithoutText));
    }

    return { text, children };
  }

  getSolutionExplanation() {
    if (!_.has(this.problem, 'solution')) { return null; }

    const stack = [this.problem.solution];
    const texts = [];
    let currentNode;

    while (stack.length) {
      currentNode = stack.pop();
      const { text, children } = this.#extractTextAndChildren(currentNode);
      if (text) { texts.push(text); }
      stack.push(...children);
    }

    return texts.reverse().join('\n ');
  }

  getFeedback(xmlElement) {
    return _.has(xmlElement, 'correcthint') ? _.get(xmlElement, 'correcthint.#text') : '';
  }

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
    let answersObject = {};
    let additionalAttributes = {};
    let groupFeedbackList = [];
    const problemType = this.getProblemType();
    const hints = this.getHints();
    const question = this.parseQuestions(problemType);
    const solutionExplanation = this.getSolutionExplanation();

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
