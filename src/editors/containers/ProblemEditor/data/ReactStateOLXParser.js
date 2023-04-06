import _ from 'lodash-es';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { ProblemTypeKeys } from '../../../data/constants/problem';
import { ToleranceTypes } from '../components/EditProblemView/SettingsWidget/settingsComponents/Tolerance/constants';

class ReactStateOLXParser {
  constructor(problemState) {
    const parserOptions = {
      ignoreAttributes: false,
      alwaysCreateTextNode: true,
    };
    const questionParserOptions = {
      ignoreAttributes: false,
      alwaysCreateTextNode: true,
      preserveOrder: true,
    };
    const questionBuilderOptions = {
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      suppressBooleanAttributes: false,
      format: true,
      preserveOrder: true,
    };
    const builderOptions = {
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      suppressBooleanAttributes: false,
      format: true,
    };
    this.questionParser = new XMLParser(questionParserOptions);
    this.parser = new XMLParser(parserOptions);
    this.builder = new XMLBuilder(builderOptions);
    this.questionBuilder = new XMLBuilder(questionBuilderOptions);
    this.editorObject = problemState.editorObject;
    this.problemState = problemState.problem;
  }

  addHints() {
    const hintsArray = [];
    const { hints } = this.editorObject;
    hints.forEach(hint => {
      if (hint.length > 0) {
        const parsedHint = this.parser.parse(hint);
        hintsArray.push({
          ...parsedHint,
        });
      }
    });
    const demandhint = {
      demandhint: {
        hint: hintsArray,
      },
    };
    return demandhint;
  }

  addSolution() {
    const { solution } = this.editorObject;
    if (!solution || solution.length <= 0) { return {}; }
    const solutionTitle = { '#text': 'Explanation' };
    const parsedSolution = this.parser.parse(solution);
    const paragraphs = parsedSolution.p;
    const withWrapper = _.isArray(paragraphs) ? [solutionTitle, ...paragraphs] : [solutionTitle, paragraphs];
    const solutionObject = {
      solution: {
        div: {
          '@_class': 'detailed-solution',
          p: withWrapper,
        },
      },
    };
    return solutionObject;
  }

  addMultiSelectAnswers(option) {
    const choice = [];
    let compoundhint = [];
    let widget = {};
    // eslint-disable-next-line prefer-const
    let { answers, problemType } = this.problemState;
    const answerTitles = this.editorObject?.answers;
    const { selectedFeedback, unselectedFeedback } = this.editorObject;
    /* todo */
    /*
      * the logic for general  feedback is ot current being used.
      * when component is updated will need to return to this code.
      * general feedback replaces selected feedback if all incorrect selected feedback is the same.
      * ******************************************
    if (generalFeedback !== ''
    && answers.every(
      answer => (
        answer.correct
          ? true
          : answer?.selectedFeedback === answers.find(a => a.correct === false).selectedFeedback
      ),
    )) {
      answers = answers.map(answer => (!answer?.correct
        ? { ...answer, selectedFeedback: generalFeedback }
        : answer));
    }
    */
    answers.forEach((answer) => {
      const feedback = [];
      let singleAnswer = {};
      const title = answerTitles ? this.parser.parse(answerTitles[answer.id]) : { '#text': answer.title };
      const currentSelectedFeedback = selectedFeedback?.[answer.id] || null;
      const currentUnselectedFeedback = unselectedFeedback?.[answer.id] || null;
      let isEmpty;
      if (answerTitles) {
        isEmpty = Object.keys(title)?.length <= 0;
      } else {
        isEmpty = title['#text']?.length <= 0;
      }
      if (title && !isEmpty) {
        if (currentSelectedFeedback && problemType === ProblemTypeKeys.MULTISELECT) {
          const parsedSelectedFeedback = this.parser.parse(currentSelectedFeedback);
          feedback.push({
            ...parsedSelectedFeedback,
            '@_selected': true,
          });
        }
        if (currentSelectedFeedback && problemType !== ProblemTypeKeys.MULTISELECT) {
          const parsedSelectedFeedback = this.parser.parse(currentSelectedFeedback);
          feedback.push({
            ...parsedSelectedFeedback,
          });
        }
        if (currentUnselectedFeedback && problemType === ProblemTypeKeys.MULTISELECT) {
          const parsedUnselectedFeedback = this.parser.parse(currentUnselectedFeedback);
          feedback.push({
            ...parsedUnselectedFeedback,
            '@_selected': false,
          });
        }
        if (feedback.length) {
          singleAnswer[`${option}hint`] = feedback;
        }
        singleAnswer = {
          '@_correct': answer.correct,
          ...title,
          ...singleAnswer,
        };
        choice.push(singleAnswer);
      }
    });
    widget = { [option]: choice };
    if (_.has(this.problemState, 'groupFeedbackList') && problemType === ProblemTypeKeys.MULTISELECT) {
      compoundhint = this.addGroupFeedbackList();
      widget = {
        ...widget,
        compoundhint,
      };
    }
    return widget;
  }

  addGroupFeedbackList() {
    const compoundhint = [];
    const { groupFeedbackList } = this.problemState;
    groupFeedbackList.forEach((element) => {
      compoundhint.push({
        '#text': element.feedback,
        '@_value': element.answers.join(' '),
      });
    });
    return compoundhint;
  }

  addQuestion() {
    const { question } = this.editorObject;
    const questionObject = this.questionParser.parse(question);
    return questionObject;
  }

  buildMultiSelectProblem(problemType, widget, option) {
    const question = this.addQuestion();
    const widgetObject = this.addMultiSelectAnswers(option);
    const demandhint = this.addHints();
    const solution = this.addSolution();

    const problemObject = {
      problem: {
        [problemType]: {
          [widget]: widgetObject,
          ...solution,
        },
        ...demandhint,
      },
    };

    const problem = this.builder.build(problemObject);
    const questionString = this.questionBuilder.build(question);
    let problemTypeTag;
    switch (problemType) {
      case ProblemTypeKeys.MULTISELECT:
        [problemTypeTag] = problem.match(/<choiceresponse>|<choiceresponse.[^>]+>/);
        break;
      case ProblemTypeKeys.DROPDOWN:
        [problemTypeTag] = problem.match(/<optionresponse>|<optionresponse.[^>]+>/);
        break;
      case ProblemTypeKeys.SINGLESELECT:
        [problemTypeTag] = problem.match(/<multiplechoiceresponse>|<multiplechoiceresponse.[^>]+>/);
        break;
      default:
        break;
    }
    const updatedString = `${problemTypeTag}\n${questionString}`;
    const problemString = problem.replace(problemTypeTag, updatedString);

    return problemString;
  }

  buildTextInput() {
    const question = this.addQuestion();
    const demandhint = this.addHints();
    const answerObject = this.buildTextInputAnswersFeedback();
    const solution = this.addSolution();

    const problemObject = {
      problem: {
        [ProblemTypeKeys.TEXTINPUT]: {
          ...answerObject,
          ...solution,
        },
        ...demandhint,
      },
    };

    const problem = this.builder.build(problemObject);
    const questionString = this.questionBuilder.build(question);
    const [problemTypeTag] = problem.match(/<stringresponse>|<stringresponse.[^>]+>/);
    const updatedString = `${problemTypeTag}\n${questionString}`;
    const problemString = problem.replace(problemTypeTag, updatedString);

    return problemString;
  }

  buildTextInputAnswersFeedback() {
    const { answers } = this.problemState;
    const { selectedFeedback } = this.editorObject;
    let answerObject = {};
    const additionAnswers = [];
    const wrongAnswers = [];
    let firstCorrectAnswerParsed = false;
    answers.forEach((answer) => {
      const correcthint = this.getAnswerHints(selectedFeedback?.[answer.id]);
      if (this.hasAttributeWithValue(answer, 'title')) {
        if (answer.correct && firstCorrectAnswerParsed) {
          additionAnswers.push({
            '@_answer': answer.title,
            ...correcthint,
          });
        } else if (answer.correct && !firstCorrectAnswerParsed) {
          firstCorrectAnswerParsed = true;
          answerObject = {
            '@_answer': answer.title,
            ...correcthint,
          };
        } else if (!answer.correct) {
          const wronghint = correcthint.correcthint;
          wrongAnswers.push({
            '@_answer': answer.title,
            ...wronghint,
          });
        }
      }
    });
    answerObject = {
      ...answerObject,
      additional_answer: additionAnswers,
      stringequalhint: wrongAnswers,
      '@_type': _.get(this.problemState, 'additionalAttributes.type', 'ci'),
      textline: {
        '@_size': _.get(this.problemState, 'additionalAttributes.textline.size', 20),
      },
    };
    return answerObject;
  }

  buildNumericInput() {
    const question = this.addQuestion();
    const demandhint = this.addHints();
    const answerObject = this.buildNumericalResponse();
    const solution = this.addSolution();

    const problemObject = {
      problem: {
        [ProblemTypeKeys.NUMERIC]: {
          ...answerObject,
          ...solution,
        },
        ...demandhint,
      },
    };

    const problem = this.builder.build(problemObject);
    const questionString = this.questionBuilder.build(question);
    const [problemTypeTag] = problem.match(/<numericalresponse>|<numericalresponse.[^>]+>/);
    const updatedString = `${questionString}\n${problemTypeTag}`;
    const problemString = problem.replace(problemTypeTag, updatedString);

    return problemString;
  }

  buildNumericalResponse() {
    const { answers } = this.problemState;
    const { tolerance } = this.problemState.settings;
    const { selectedFeedback } = this.editorObject;
    let answerObject = {};
    const additionalAnswers = [];
    let firstCorrectAnswerParsed = false;
    answers.forEach((answer) => {
      const correcthint = this.getAnswerHints(selectedFeedback?.[answer.id]);
      if (this.hasAttributeWithValue(answer, 'title')) {
        if (answer.correct && !firstCorrectAnswerParsed) {
          firstCorrectAnswerParsed = true;
          let responseParam = {};
          if (tolerance?.value) {
            responseParam = {
              responseparam: {
                '@_type': 'tolerance',
                '@_default': `${tolerance.value}${tolerance.type === ToleranceTypes.number.type ? '' : '%'}`,
              },
            };
          }
          answerObject = {
            '@_answer': answer.title,
            ...responseParam,
            ...correcthint,
          };
        } else if (answer.correct && firstCorrectAnswerParsed) {
          additionalAnswers.push({
            '@_answer': answer.title,
            ...correcthint,
          });
        }
      }
    });
    answerObject = {
      ...answerObject,
      additional_answer: additionalAnswers,
      formulaequationinput: {
        '#text': '',
      },
    };
    return answerObject;
  }

  getAnswerHints(feedback) {
    let correcthint = {};
    if (feedback !== undefined && feedback !== '') {
      const parsedFeedback = this.parser.parse(feedback);
      correcthint = {
        correcthint: {
          ...parsedFeedback,
        },
      };
    }
    return correcthint;
  }

  hasAttributeWithValue(obj, attr) {
    return _.has(obj, attr) && _.get(obj, attr, '').toString().trim() !== '';
  }

  buildOLX() {
    const { problemType } = this.problemState;
    let problemString = '';

    switch (problemType) {
      case ProblemTypeKeys.MULTISELECT:
        problemString = this.buildMultiSelectProblem(ProblemTypeKeys.MULTISELECT, 'checkboxgroup', 'choice');
        break;
      case ProblemTypeKeys.DROPDOWN:
        problemString = this.buildMultiSelectProblem(ProblemTypeKeys.DROPDOWN, 'optioninput', 'option');
        break;
      case ProblemTypeKeys.SINGLESELECT:
        problemString = this.buildMultiSelectProblem(ProblemTypeKeys.SINGLESELECT, 'choicegroup', 'choice');
        break;
      case ProblemTypeKeys.TEXTINPUT:
        problemString = this.buildTextInput();
        break;
      case ProblemTypeKeys.NUMERIC:
        problemString = this.buildNumericInput();
        break;
      default:
        break;
    }
    return problemString;
  }
}

export default ReactStateOLXParser;
