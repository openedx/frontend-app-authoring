import _ from 'lodash';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { ProblemTypeKeys } from '../../../data/constants/problem';
import { ToleranceTypes } from '../components/EditProblemView/SettingsWidget/settingsComponents/Tolerance/constants';
import { findNodesAndRemoveTheirParentNodes } from './reactStateOLXHelpers';

const HtmlBlockTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'pre', 'blockquote', 'ol', 'ul', 'li', 'dl', 'dt', 'dd', 'hr', 'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'colgroup', 'col', 'address', 'fieldset', 'legend'];

class ReactStateOLXParser {
  constructor(problemState) {
    const richTextParserOptions = {
      ignoreAttributes: false,
      alwaysCreateTextNode: true,
      numberParseOptions: {
        leadingZeros: false,
        hex: false,
      },
      preserveOrder: true,
      // Ensure whitespace inside <pre> tags is preserved
      trimValues: false,
      // Parse <br> correctly
      unpairedTags: ['br'],
    };
    const richTextBuilderOptions = {
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      suppressBooleanAttributes: false,
      // Avoid formatting as it adds unwanted newlines and whitespace,
      // breaking <pre> tags
      format: false,
      numberParseOptions: {
        leadingZeros: false,
        hex: false,
      },
      preserveOrder: true,
      unpairedTags: ['br'],
      // Output <br/> rather than <br>
      suppressUnpairedNode: false,
    };

    this.richTextParser = new XMLParser(richTextParserOptions);
    this.richTextBuilder = new XMLBuilder(richTextBuilderOptions);
    this.editorObject = problemState.editorObject;
    this.problemState = problemState.problem;
  }

  /** addHints()
   * The editorObject saved to the class constuctor is parsed for the attribute hints. No hints returns an empty object.
   * The hints are parsed and appended to the hintsArray as object representations of the hint. The hints array is saved
   * to the hint key in the demandHint object and returned.
   * @return {object} demandhint object with atrribut hint with array of objects
   */
  addHints() {
    const hintsArray = [];
    const { hints } = this.editorObject;
    if (hints.length < 1) {
      return hintsArray;
    }
    hints.forEach(hint => {
      if (hint.length > 0) {
        const parsedHint = this.richTextParser.parse(hint);
        hintsArray.push({
          hint: [...parsedHint],
        });
      }
    });
    const demandhint = [{ demandhint: hintsArray }];
    return demandhint;
  }

  /** addSolution()
   * The editorObject saved to the class constuctor is parsed for the attribute solution. If the soltuion is empty, it
   * returns an empty object. The solution is parsed and checked if paragraph key's value is a string or array. Studio
   * requires a div wrapper with a heading (Explanation). The heading is prepended to the parsed solution object. The
   * solution object is returned with the updated div wrapper.
   * @return {object} object representation of solution
   */
  addSolution() {
    const { solution } = this.editorObject;
    if (!solution || solution.length <= 0) { return []; }
    const solutionTitle = { p: [{ '#text': 'Explanation' }] };
    const parsedSolution = this.richTextParser.parse(solution);
    const withWrapper = [solutionTitle, ...parsedSolution];
    const solutionObject = [{
      solution: [{
        ':@': { '@_class': 'detailed-solution' },
        div: [...withWrapper],
      }],
    }];
    return solutionObject;
  }

  /** addMultiSelectAnswers(option)
   * addMultiSelectAnswers takes option. Option is used to assign an answers to the
   * correct OLX tag. This function is used for multiple choice, checkbox, and
   * dropdown problems. The editorObject saved to the class constuctor is parsed for
   * answers (titles only), selectFeedback, and unselectedFeedback. The problemState
   * saved to the class constructor is parsed for the problemType and answers (full
   * object). The answers are looped through to  pair feedback with its respective
   * OLX tags. While matching feedback tags, answers are also mapped to their
   * respective OLX tags. he object representation of the answers is returned with
   * the correct wrapping tags. For checkbox problems, compound hints are also returned.
   * @param {string} option - string of answer tag name
   * @return {object} object representation of answers
   */
  addMultiSelectAnswers(option) {
    const choice = [];
    let compoundhint = [];
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
      let singleAnswer = [];
      const title = answerTitles ? this.richTextParser.parse(answerTitles[answer.id]) : [{ '#text': answer.title }];
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
          const parsedSelectedFeedback = this.richTextParser.parse(currentSelectedFeedback);
          feedback.push({
            ':@': { '@_selected': true },
            [`${option}hint`]: parsedSelectedFeedback,
          });
        }
        if (currentSelectedFeedback && problemType !== ProblemTypeKeys.MULTISELECT) {
          const parsedSelectedFeedback = this.richTextParser.parse(currentSelectedFeedback);
          feedback.push({
            [`${option}hint`]: parsedSelectedFeedback,
          });
        }
        if (currentUnselectedFeedback && problemType === ProblemTypeKeys.MULTISELECT) {
          const parsedUnselectedFeedback = this.richTextParser.parse(currentUnselectedFeedback);
          feedback.push({
            ':@': { '@_selected': false },
            [`${option}hint`]: parsedUnselectedFeedback,
          });
        }
        singleAnswer = {
          ':@': { '@_correct': answer.correct },
          [option]: [...title, ...feedback],
        };
        choice.push(singleAnswer);
      }
    });
    if (_.has(this.problemState, 'groupFeedbackList') && problemType === ProblemTypeKeys.MULTISELECT) {
      compoundhint = this.addGroupFeedbackList();
      choice.push(...compoundhint);
    }
    return choice;
  }

  /** addGroupFeedbackList()
   * The problemState saved to the class constuctor is parsed for the attribute groupFeedbackList.
   * No group feedback returns an empty array. Each groupFeedback in the groupFeedback list is
   * mapped to a new object and appended to the compoundhint array.
   * @return {object} object representation of compoundhints
   */
  addGroupFeedbackList() {
    const compoundhint = [];
    const { groupFeedbackList } = this.problemState;
    groupFeedbackList.forEach((element) => {
      compoundhint.push({
        compoundhint: [{ '#text': element.feedback }],
        ':@': { '@_value': element.answers.join(' ') },
      });
    });
    return compoundhint;
  }

  /** addQuestion()
   * The editorObject saved to the class constuctor is parsed for the attribute question. The question is parsed and
   * checked for label tags. label tags are extracted from block-type tags like <p> or <h1>, and the block-type tag is
   * deleted while label is kept. For example, <p><label>Question</label></p> becomes <label>Question</label>, while
   * <p><span>Text</span></p> remains <p><span>Text</span></p>. The question is returned as an object representation.
   * @return {object} object representaion of question
   */
  addQuestion() {
    const { question } = this.editorObject;
    const questionObjectArray = this.richTextParser.parse(question);
    /* Removes block tags like <p> or <h1> that surround the <label> format.
      Block tags are required by tinyMCE but have adverse effect on css in studio.
      */
    const result = findNodesAndRemoveTheirParentNodes({
      arrayOfNodes: questionObjectArray,
      nodesToFind: ['label'],
      parentsToRemove: HtmlBlockTags,
    });

    return result;
  }

  // findNodesWithChildTags(nodes, tagNames, recursive=false) {
  //   const result = [];

  /** buildMultiSelectProblem()
   * OLX builder for multiple choice, checkbox, and dropdown problems. The question
   * builder has a different format than the other parts (demand hint, answers, and
   * solution) of the problem so it has to be inserted into the OLX after the rest
   * of the problem is built.
   * @param {string} problemType - string of problem type tag
   * @param {string} widget - string of answer tag name
   * @param {string} option - string of feedback tag name
   * @return {string} string of OLX
   */
  buildMultiSelectProblem(problemType, widget, option) {
    const question = this.addQuestion();
    const widgetObject = this.addMultiSelectAnswers(option);
    const demandhint = this.addHints();
    const solution = this.addSolution();

    const problemBodyArr = [{
      [problemType]: [
        { [widget]: widgetObject },
        ...solution,
      ],
    }];

    const questionString = this.richTextBuilder.build(question);
    const hintString = this.richTextBuilder.build(demandhint);
    const problemBody = this.richTextBuilder.build(problemBodyArr);
    let problemTypeTag;

    switch (problemType) {
      case ProblemTypeKeys.MULTISELECT:
        [problemTypeTag] = problemBody.match(/<choiceresponse>|<choiceresponse.[^>]+>/);
        break;
      case ProblemTypeKeys.DROPDOWN:
        [problemTypeTag] = problemBody.match(/<optionresponse>|<optionresponse.[^>]+>/);
        break;
      case ProblemTypeKeys.SINGLESELECT:
        [problemTypeTag] = problemBody.match(/<multiplechoiceresponse>|<multiplechoiceresponse.[^>]+>/);
        break;
      default:
        break;
    }
    const questionStringWithEmDescriptionReplace = this.replaceEmWithDescriptionTag(questionString);
    const updatedString = `${problemTypeTag}\n${questionStringWithEmDescriptionReplace}`;
    const problemBodyString = problemBody.replace(problemTypeTag, updatedString);
    const fullProblemString = `<problem>${problemBodyString}${hintString}\n</problem>`;

    return fullProblemString;
  }

  replaceEmWithDescriptionTag(xmlString) {
    const regexPattern = /<em class="olx_description">(.*?)<\/em>/g;
    const replacement = '<description>$1</description>';

    const updatedHtml = xmlString.replace(regexPattern, replacement);
    return updatedHtml;
  }

  /** buildTextInput()
   * String response OLX builder. The question builder has a different format than the
   * other parts (demand hint, answers, and solution) of the problem so it has to be
   * inserted into the OLX after the rest of the problem is built.
   * @return {string} string of string response OLX
   */
  buildTextInput() {
    const question = this.addQuestion();
    const demandhint = this.addHints();
    const answerObject = this.buildTextInputAnswersFeedback();
    const solution = this.addSolution();

    answerObject[ProblemTypeKeys.TEXTINPUT].push(...solution);

    const problemBody = this.richTextBuilder.build([answerObject]);
    const questionString = this.richTextBuilder.build(question);
    const hintString = this.richTextBuilder.build(demandhint);
    const [problemTypeTag] = problemBody.match(/<stringresponse>|<stringresponse.[^>]+>/);
    const updatedString = `${problemTypeTag}\n${questionString}`;
    const problemBodyString = problemBody.replace(problemTypeTag, updatedString);
    const fullProblemString = `<problem>${problemBodyString}${hintString}\n</problem>`;

    return fullProblemString;
  }

  /** buildTextInputAnswersFeedback()
   * The editorObject saved to the class constuctor is parsed for the attribute
   * selectedFeedback. String response problems have two types of feedback tags,
   * correcthint and stringequalhint. Correcthint is for feedback associated with
   * correct answers and stringequalhint is for feedback associated with wrong
   * answers. The answers are fetched from the problemState and looped through to
   * pair feedback with its respective OLX tags. While matching feedback tags,
   * answers are also mapped to their respective OLX tags. The first correct
   * answer is wrapped in stringreponse tag. All other correct answers are wrapped
   * in additonal_answer tags. Incorrect answers are wrapped in stringequalhint
   * tags. The object representation of the answers is returned with the correct
   * wrapping tags.
   * @return {object} object representation of answers
   */
  buildTextInputAnswersFeedback() {
    const { answers, problemType } = this.problemState;
    const { selectedFeedback } = this.editorObject;
    let answerObject = { [problemType]: [] };
    let firstCorrectAnswerParsed = false;
    answers.forEach((answer) => {
      const correcthint = this.getAnswerHints(selectedFeedback?.[answer.id]);
      if (this.hasAttributeWithValue(answer, 'title')) {
        if (answer.correct && firstCorrectAnswerParsed) {
          answerObject[problemType].push({
            ':@': { '@_answer': answer.title },
            additional_answer: [...correcthint],
          });
        } else if (answer.correct && !firstCorrectAnswerParsed) {
          firstCorrectAnswerParsed = true;
          answerObject = {
            ':@': {
              '@_answer': answer.title,
              '@_type': _.get(this.problemState, 'additionalAttributes.type', 'ci'),
            },
            [problemType]: [...correcthint],
          };
        } else if (!answer.correct) {
          const wronghint = correcthint[0]?.correcthint;
          answerObject[problemType].push({
            ':@': { '@_answer': answer.title },
            stringequalhint: wronghint ? [...wronghint] : [],
          });
        }
      }
    });
    answerObject[problemType].push({
      textline: { '#text': '' },
      ':@': { '@_size': _.get(this.problemState, 'additionalAttributes.textline.size', 20) },
    });
    return answerObject;
  }

  /** buildNumericInput()
   * Numeric response OLX builder. The question builder has a different format than the
   * other parts (demand hint, answers, and solution) of the problem so it has to be
   * inserted into the OLX after the rest of the problem is built.
   * @return {string} string of numeric response OLX
   */
  buildNumericInput() {
    const question = this.addQuestion();
    const demandhint = this.addHints();
    const answerObject = this.buildNumericalResponse();
    const solution = this.addSolution();

    answerObject[ProblemTypeKeys.NUMERIC].push(...solution);

    const problemBody = this.richTextBuilder.build([answerObject]);
    const questionString = this.richTextBuilder.build(question);
    const hintString = this.richTextBuilder.build(demandhint);
    const [problemTypeTag] = problemBody.match(/<numericalresponse>|<numericalresponse.[^>]+>/);
    const updatedString = `${questionString}\n${problemTypeTag}`;
    const problemBodyString = problemBody.replace(problemTypeTag, updatedString);
    const fullProblemString = `<problem>${problemBodyString}${hintString}\n</problem>`;

    return fullProblemString;
  }

  /** buildNumericalResponse()
   * The editorObject saved to the class constuctor is parsed for the attribute
   * selectedFeedback. The tolerance is fetched from the problemState settings.
   * The answers are fetched from the problemState and looped through to
   * pair feedback with its respective OLX tags. While matching feedback tags,
   * answers are also mapped to their respective OLX tags. For each answer, if
   * it is an answer range, it is santized to be less than to great than. The
   * first answer is wrapped in numericresponse tag. All other answers are
   * wrapped in additonal_answer tags. The object representation of the answers
   * is returned with the correct  wrapping tags.
   * @return {object} object representation of answers
   */
  buildNumericalResponse() {
    const { answers, problemType } = this.problemState;
    const { tolerance } = this.problemState.settings;
    const { selectedFeedback } = this.editorObject;
    let answerObject = { [problemType]: [] };
    let firstCorrectAnswerParsed = false;
    answers.forEach((answer) => {
      const correcthint = this.getAnswerHints(selectedFeedback?.[answer.id]);
      if (this.hasAttributeWithValue(answer, 'title')) {
        let { title } = answer;
        if (title.startsWith('(') || title.startsWith('[')) {
          const parsedRange = title.split(',');
          const [rawLowerBound, rawUpperBound] = parsedRange;
          let lowerBoundInt;
          let lowerBoundFraction;
          let upperBoundInt;
          let upperBoundFraction;
          if (rawLowerBound.includes('/')) {
            lowerBoundFraction = rawLowerBound.replace(/[^0-9-/]/gm, '');
            const [numerator, denominator] = lowerBoundFraction.split('/');
            const lowerBoundFloat = Number(numerator) / Number(denominator);
            lowerBoundInt = lowerBoundFloat;
          } else {
            // these regex replaces remove everything that is not a decimal or positive/negative numer
            lowerBoundInt = Number(rawLowerBound.replace(/[^0-9-.]/gm, ''));
          }
          if (rawUpperBound.includes('/')) {
            upperBoundFraction = rawUpperBound.replace(/[^0-9-/]/gm, '');
            const [numerator, denominator] = upperBoundFraction.split('/');
            const upperBoundFloat = Number(numerator) / Number(denominator);
            upperBoundInt = upperBoundFloat;
          } else {
            // these regex replaces remove everything that is not a decimal or positive/negative numer
            upperBoundInt = Number(rawUpperBound.replace(/[^0-9-.]/gm, ''));
          }
          if (lowerBoundInt > upperBoundInt) {
            const lowerBoundChar = rawUpperBound[rawUpperBound.length - 1] === ']' ? '[' : '(';
            const upperBoundChar = rawLowerBound[0] === '[' ? ']' : ')';
            if (lowerBoundFraction) {
              lowerBoundInt = lowerBoundFraction;
            }
            if (upperBoundFraction) {
              upperBoundInt = upperBoundFraction;
            }
            title = `${lowerBoundChar}${upperBoundInt},${lowerBoundInt}${upperBoundChar}`;
          }
        }
        if (answer.correct && !firstCorrectAnswerParsed) {
          firstCorrectAnswerParsed = true;
          const responseParam = [];
          if (tolerance?.value) {
            responseParam.push({
              responseparam: [],
              ':@': {
                '@_type': 'tolerance',
                '@_default': `${tolerance.value}${tolerance.type === ToleranceTypes.number.type ? '' : '%'}`,
              },
            });
          }
          answerObject = {
            ':@': { '@_answer': title },
            [problemType]: [...responseParam, ...correcthint],
          };
        } else if (answer.correct && firstCorrectAnswerParsed) {
          answerObject[problemType].push({
            ':@': { '@_answer': title },
            additional_answer: [...correcthint],
          });
        }
      }
    });
    answerObject[problemType].push({ formulaequationinput: { '#text': '' } });
    return answerObject;
  }

  /** getAnswerHints(feedback)
   * getAnswerHints takes feedback. The feedback is checked for definition. If feedback is
   * undefined or an empty string, it returns an empty object. The defined feedback is
   * parsed and saved to the key correcthint. Correcthint is the tag name for
   * numeric response and string response feedback.
   * @param {string} feedback - string of feedback
   * @return {object} object representaion of feedback
   */
  getAnswerHints(feedback) {
    const correcthint = [];
    if (feedback !== undefined && feedback !== '') {
      const parsedFeedback = this.richTextParser.parse(feedback);
      correcthint.push({ correcthint: parsedFeedback });
    }
    return correcthint;
  }

  /** hasAttributeWithValue(obj, attr)
   * hasAttributeWithValue takes obj and atrr. The obj is checked for the attribute defined by attr.
   * Returns true if attribute is present, otherwise false.
   * @param {object} obj - defined object
   * @param {string} attr - string of desired attribute
   * @return {bool}
   */
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
