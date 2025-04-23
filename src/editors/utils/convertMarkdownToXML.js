export const convertMarkdownToXml = (markdown) => {
  const demandHintTags = [];

  // Comprehensive XML conversion function
  const toXml = (partialMarkdown) => {
    let xml = partialMarkdown;
    let i; let makeParagraph; let demandhints;
    const responseTypes = [
      'optionresponse', 'multiplechoiceresponse', 'stringresponse', 'numericalresponse', 'choiceresponse',
    ];

    // fix DOS \r\n line endings to look like \n
    xml = xml.replace(/\r\n/g, '\n');

    // replace headers
    xml = xml.replace(/(^.*?$)(?=\n==+$)/gm, '<h3 class="hd hd-2 problem-header">$1</h3>');
    xml = xml.replace(/\n^==+$/gm, '');

    // extract question and description(optional)
    // >>question||description<< converts to
    // <label>question</label> <description>description</description>
    xml = xml.replace(/>>([^]+?)<</gm, (match, questionText) => {
      const result = questionText.split('||');
      const label = `<label>${ result[0] }</label>\n`;

      // don't add empty <description> tag
      if (result.length === 1 || !result[1]) {
        return label;
      }

      return `${label }<description>${ result[1] }</description>\n`;
    });

    // Pull out demand hints,  || a hint ||
    demandhints = '';
    xml = xml.replace(/(^\s*\|\|.*?\|\|\s*$\n?)+/gm, (match) => { // $\n
      let inner;
      const options = match.split('\n');
      for (i = 0; i < options.length; i += 1) {
        inner = /\s*\|\|(.*?)\|\|/.exec(options[i]);
        if (inner) {
          demandhints += `  <hint>${ inner[1].trim() }</hint>\n`;
        }
      }
      return '';
    });

    // replace \n+whitespace within extended hint {{ .. }}, by a space, so the whole
    // hint sits on one line.
    // This is the one instance of {{ ... }} matching that permits \n
    xml = xml.replace(/{{(.|\n)*?}}/gm, (match) => match.replace(/\r?\n( |\t)*/g, ' '));

    // Function used in many places to extract {{ label:: a hint }}.
    // Returns a little hash with various parts of the hint:
    // hint: the hint or empty, nothint: the rest
    // labelassign: javascript assignment of label attribute, or empty
    const extractHint = (inputText, detectParens) => {
      let text = inputText;
      const curly = /\s*{{(.*?)}}/.exec(text);
      let hint = '';
      let label = '';
      let parens = false;
      let labelassign = '';
      let labelmatch;
      if (curly) {
        text = text.replace(curly[0], '');
        hint = curly[1].trim();
        labelmatch = /^(.*?)::/.exec(hint);
        if (labelmatch) {
          hint = hint.replace(labelmatch[0], '').trim();
          label = labelmatch[1].trim();
          labelassign = ` label="${ label }"`;
        }
      }
      if (detectParens) {
        if (text.length >= 2 && text[0] === '(' && text[text.length - 1] === ')') {
          text = text.substring(1, text.length - 1);
          parens = true;
        }
      }
      return {
        nothint: text,
        hint,
        label,
        parens,
        labelassign,
      };
    };

    xml = xml.replace(/\[\[((.|\n)+?)\]\]/g, (match, group1) => {
      let textHint; let options; let optiontag; let correct;
      let optionlines; let line; let correctstr; let hintstr; let label;
      // decide if this is old style or new style
      if (match.indexOf('\n') === -1) { // OLD style, [[ .... ]]  on one line
        options = group1.split(/,\s*/g);
        optiontag = '  <optioninput options="(';
        for (i = 0; i < options.length; i += 1) {
          optiontag += `'${ options[i].replace(/(?:^|,)\s*\((.*?)\)\s*(?:$|,)/g, '$1') }'${
            i < options.length - 1 ? ',' : ''}`;
        }
        optiontag += ')" correct="';
        correct = /(?:^|,)\s*\((.*?)\)\s*(?:$|,)/g.exec(group1);
        if (correct) {
          optiontag += correct[1];
        }
        optiontag += '">';
        return `\n<optionresponse>\n${ optiontag }</optioninput>\n</optionresponse>\n\n`;
      }

      // new style  [[ many-lines ]]
      const lines = group1.split('\n');
      optionlines = '';
      for (i = 0; i < lines.length; i++) {
        line = lines[i].trim();
        if (line.length > 0) {
          textHint = extractHint(line, true);
          correctstr = ` correct="${ textHint.parens ? 'True' : 'False' }"`;
          hintstr = '';
          if (textHint.hint) {
            label = textHint.label;
            if (label) {
              label = ` label="${ label }"`;
            }
            hintstr = ` <optionhint${ label }>${ textHint.hint }</optionhint>`;
          }
          optionlines += `    <option${ correctstr }>${ textHint.nothint }${hintstr }</option>\n`;
        }
      }
      return `\n<optionresponse>\n  <optioninput>\n${ optionlines }  </optioninput>\n</optionresponse>\n\n`;
    });
    xml = xml.replace(/(^\s*\(.{0,3}\).*?$\n*)+/gm, (match) => {
      let choices = '';
      let shuffle = false;
      const options = match.split('\n');
      let correct;
      let fixed; let hint; let
        result;
      for (i = 0; i < options.length; i++) {
        options[i] = options[i].trim(); // trim off leading/trailing whitespace
        if (options[i].length > 0) {
          let [, value] = options[i].split(/^\s*\(.{0,3}\)\s*/);
          const [,inparens] = /^\s*\((.{0,3})\)\s*/.exec(options[i]);
          correct = /x/i.test(inparens);
          fixed = '';
          if (/@/.test(inparens)) {
            fixed = ' fixed="true"';
          }
          if (/!/.test(inparens)) {
            shuffle = true;
          }

          hint = extractHint(value);
          if (hint.hint) {
            value = hint.nothint;
            value = `${value } <choicehint${ hint.labelassign }>${ hint.hint }</choicehint>`;
          }
          choices += `    <choice correct="${ correct }"${ fixed }>${ value }</choice>\n`;
        }
      }
      result = '<multiplechoiceresponse>\n';
      if (shuffle) {
        result += '  <choicegroup type="MultipleChoice" shuffle="true">\n';
      } else {
        result += '  <choicegroup type="MultipleChoice">\n';
      }
      result += choices;
      result += '  </choicegroup>\n';
      result += '</multiplechoiceresponse>\n\n';
      return result;
    });

    // group check answers
    // [.] with {{...}} lines mixed in
    xml = xml.replace(/(^\s*((\[.?\])|({{.*?}})).*?$\n*)+/gm, (match) => {
      let groupString = '<choiceresponse>\n';
      const options = match.split('\n');
      let correct; let abhint; let endHints;
      let hint; let inner; let select; let
        hints;

      groupString += '  <checkboxgroup>\n';
      endHints = ''; // save these up to emit at the end

      for (i = 0; i < options.length; i += 1) {
        if (options[i].trim().length > 0) {
          // detect the {{ ((A*B)) ...}} case first
          // emits: <compoundhint value="A*B">AB hint</compoundhint>

          abhint = /^\s*{{\s*\(\((.*?)\)\)(.*?)}}/.exec(options[i]);
          if (abhint) {
            // lone case of hint text processing outside of extractHint, since syntax here is unique
            let [, , hintbody] = abhint;
            hintbody = hintbody.replace('&lf;', '\n').trim();
            endHints += `    <compoundhint value="${ abhint[1].trim() }">${ hintbody }</compoundhint>\n`;
            // eslint-disable-next-line no-continue
            continue;
          }

          let [, value] = options[i].split(/^\s*\[.?\]\s*/);
          correct = /^\s*\[x\]/i.test(options[i]);
          hints = '';
          //  {{ selected: You’re right that apple is a fruit. },
          //   {unselected: Remember that apple is also a fruit.}}
          hint = extractHint(value);
          if (hint.hint) {
            inner = `{${ hint.hint }}`; // parsing is easier if we put outer { } back

            // include \n since we are downstream of extractHint()
            select = /{\s*(s|selected):((.|\n)*?)}/i.exec(inner);
            // checkbox choicehints get their own line, since there can be two of them
            // <choicehint selected="true">You’re right that apple is a fruit.</choicehint>
            if (select) {
              hints += `\n      <choicehint selected="true">${ select[2].trim() }</choicehint>`;
            }
            select = /{\s*(u|unselected):((.|\n)*?)}/i.exec(inner);
            if (select) {
              hints += `\n      <choicehint selected="false">${ select[2].trim() }</choicehint>`;
            }

            // Blank out the original text only if the specific "selected" syntax is found
            // That way, if the user types it wrong, at least they can see it's not processed.
            if (hints) {
              value = hint.nothint;
            }
          }
          groupString += `    <choice correct="${ correct }">${ value }${hints }</choice>\n`;
        }
      }

      groupString += endHints;
      groupString += '  </checkboxgroup>\n';
      groupString += '</choiceresponse>\n\n';

      return groupString;
    });

    // replace string and numerical, numericalresponse, stringresponse
    // A fine example of the function-composition programming style.
    xml = xml.replace(/(^s?=\s*(.*?$)(\n*(or|not)=\s*(.*?$))*)+/gm, (match, p) => {
      // Line split here, trim off leading xxx= in each function
      const answersList = p.split('\n');

      const isRangeToleranceCase = (answer) => {
        const rangeStart = ['[', '('];
        const rangeEnd = [']', ')'];

        return rangeStart.includes(answer[0]) && rangeEnd.includes(answer[answer.length - 1]);
      };

      const checkIsNumeric = (stringValue) => {
        // remove OLX feedback
        const cleanedValue = stringValue.includes('{{') && stringValue.includes('}}')
          ? stringValue.replace(/{{[\s\S]*?}}/g, '').trim()
          : stringValue;

        // allow for "e" in scientific notation, but exclude other letters
        if (cleanedValue.match(/[a-df-z]/i)) {
          return false;
        }

        return !Number.isNaN(parseFloat(cleanedValue));
      };

      const getAnswerData = (answerValue) => {
        const answerData = {};
        const answerParams = /(.*?)\+-\s*(.*?$)/.exec(answerValue);
        if (answerParams) {
          const [, rawAnswer, defaultValue] = answerParams;
          answerData.answer = rawAnswer.replace(/\s+/g, ''); // inputs like 5*2 +- 10
          answerData.default = defaultValue;
        } else {
          answerData.answer = answerValue.replace(/\s+/g, ''); // inputs like 5*2
        }
        return answerData;
      };

      const processNumericalResponse = (answerValues) => {
        let firstAnswer; let answerData; let numericalResponseString; let additionalAnswerString;
        let hintLine; let additionalTextHint; let additionalHintLine; let orMatch; let
          hasTolerance;

        // First string case is s?= [e.g. = 100]
        firstAnswer = answerValues[0].replace(/^=\s*/, '');

        // If answer is not numerical
        if (!checkIsNumeric(firstAnswer) && !isRangeToleranceCase(firstAnswer)) {
          return false;
        }

        const textHint = extractHint(firstAnswer);
        hintLine = '';
        if (textHint.hint) {
          firstAnswer = textHint.nothint;
          hintLine = `  <correcthint${ textHint.labelassign }>${ textHint.hint }</correcthint>\n`;
        }

        // Range case
        if (isRangeToleranceCase(firstAnswer)) {
          // [5, 7) or (5, 7), or (1.2345 * (2+3), 7*4 ]  - range tolerance case
          // = (5*2)*3 should not be used as range tolerance
          numericalResponseString = `<numericalresponse answer="${ firstAnswer }">\n`;
        } else {
          answerData = getAnswerData(firstAnswer);
          numericalResponseString = `<numericalresponse answer="${ answerData.answer }">\n`;
          if (answerData.default) {
            numericalResponseString += `  <responseparam type="tolerance" default="${ answerData.default }" />\n`;
          }
        }

        // Additional answer case or= [e.g. or= 10]
        // Since answerValues[0] is firstAnswer, so we will not include this in additional answers.
        additionalAnswerString = '';
        for (i = 1; i < answerValues.length; i++) {
          additionalHintLine = '';
          additionalTextHint = extractHint(answerValues[i]);
          orMatch = /^or=\s*(.*)/.exec(additionalTextHint.nothint);
          if (orMatch) {
            hasTolerance = /(.*?)\+-\s*(.*?$)/.exec(orMatch[1]);
            // Do not add additional_answer if additional answer is not numerical (eg. or= ABC)
            // or contains range tolerance case (eg. or= (5,7)
            // or has tolerance (eg. or= 10 +- 0.02)
            if (Number.isNaN(Number(orMatch[1]))
                                || isRangeToleranceCase(orMatch[1])
                                || hasTolerance) {
            // eslint-disable-next-line no-continue
              continue;
            }

            if (additionalTextHint.hint) {
              additionalHintLine = `<correcthint${ additionalTextHint.labelassign }>${ additionalTextHint.hint }</correcthint>`;
            }

            additionalAnswerString += `  <additional_answer answer="${ orMatch[1] }">`;
            additionalAnswerString += additionalHintLine;
            additionalAnswerString += '</additional_answer>\n';
          }
        }

        // Add additional answers string to numerical problem string.
        if (additionalAnswerString) {
          numericalResponseString += additionalAnswerString;
        }

        numericalResponseString += '  <formulaequationinput />\n';
        numericalResponseString += hintLine;
        numericalResponseString += '</numericalresponse>\n\n';

        return numericalResponseString;
      };

      const processStringResponse = (values) => {
        let firstAnswer; let textHint; let typ; let string; let orMatch; let
          notMatch;
          // First string case is s?=
        firstAnswer = values.shift();
        firstAnswer = firstAnswer.replace(/^s?=\s*/, '');
        textHint = extractHint(firstAnswer);
        firstAnswer = textHint.nothint;
        typ = ' type="ci"';
        if (firstAnswer[0] === '|') { // this is regexp case
          typ = ' type="ci regexp"';
          firstAnswer = firstAnswer.slice(1).trim();
        }
        string = `<stringresponse answer="${ firstAnswer }"${ typ } >\n`;
        if (textHint.hint) {
          string += `  <correcthint${ textHint.labelassign }>${
            textHint.hint }</correcthint>\n`;
        }

        // Subsequent cases are not= or or=
        for (i = 0; i < values.length; i += 1) {
          textHint = extractHint(values[i]);
          notMatch = /^not=\s*(.*)/.exec(textHint.nothint);
          if (notMatch) {
            string += `  <stringequalhint answer="${ notMatch[1] }"${ textHint.labelassign }>${ textHint.hint }</stringequalhint>\n`;
            // eslint-disable-next-line no-continue
            continue;
          }
          orMatch = /^or=\s*(.*)/.exec(textHint.nothint);
          if (orMatch) {
            // additional_answer with answer= attribute
            string += `  <additional_answer answer="${ orMatch[1] }">`;
            if (textHint.hint) {
              string += `<correcthint${ textHint.labelassign }>${ textHint.hint }</correcthint>`;
            }
            string += '</additional_answer>\n';
          }
        }

        string += '  <textline size="20"/>\n</stringresponse>\n\n';

        return string;
      };
      return processNumericalResponse(answersList) || processStringResponse(answersList);
    });

    // replace explanations
    xml = xml.replace(/\[explanation\]\n?([^\]]*)\[\/?explanation\]/gmi, (match, p1) => `<solution>\n<div class="detailed-solution">\nExplanation\n\n${ p1 }\n</div>\n</solution>`);

    // replace code blocks
    xml = xml.replace(/\[code\]\n?([^\]]*)\[\/?code\]/gmi, (match, p1) => `<pre><code>${ p1 }</code></pre>`);

    // split scripts and preformatted sections, and wrap paragraphs
    const splits = xml.split(/(<\/?(?:script|pre|label|description).*?>)/g);

    // Wrap a string by <p> tag when line is not already wrapped by another tag
    // true when line is not already wrapped by another tag false otherwise
    makeParagraph = true;

    for (i = 0; i < splits.length; i += 1) {
      if (/<(script|pre|label|description)/.test(splits[i])) {
        makeParagraph = false;
      }

      if (makeParagraph) {
        splits[i] = splits[i].replace(/(^(?!\s*<|$).*$)/gm, '<p>$1</p>');
      }

      if (/<\/(script|pre|label|description)/.test(splits[i])) {
        makeParagraph = true;
      }
    }
    xml = splits.join('');

    // rid white space
    xml = xml.replace(/\n\n\n/g, '\n');

    // if we've come across demand hints, wrap in <demandhint> at the end
    if (demandhints) {
      demandHintTags.push(demandhints);
    }

    // make selector to search responsetypes in xml
    const responseTypesSelector = responseTypes.join(', ');

    // make temporary xml
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(`<prob>${ xml }</prob>`, 'application/xml');
    let responseType = xmlDoc.querySelectorAll(responseTypesSelector);
    // convert if there is only one responsetype
    if (responseType.length === 1) {
      [responseType] = responseType;
      const inputtype = responseType.firstElementChild;
      // used to decide whether an element should be placed before or after an inputtype
      let beforeInputtype = true;

      Array.from(xmlDoc.querySelector('prob').children).forEach(child => {
        // we don't want to add the responsetype again into new xml
        if (responseType.nodeName === child.nodeName) {
          beforeInputtype = false;
          return;
        }

        if (beforeInputtype) {
          responseType.insertBefore(child, inputtype);
        } else {
          responseType.appendChild(child);
        }
      });

      const serializer = new XMLSerializer();

      xml = serializer.serializeToString(responseType);

      // remove xmlns attribute added by the serializer
      xml = xml.replace(/\sxmlns=['"].*?['"]/gi, '');

      // XMLSerializer messes the indentation of XML so add newline
      // at the end of each ending tag to make the xml looks better
      xml = xml.replace(/(<\/.*?>)(<.*?>)/gi, '$1\n$2');
    }
    // remove class attribute added on <p> tag for question title
    xml = xml.replace(/\sclass='qtitle'/gi, '');

    return xml;
  };

  // Process markdown into XML
  const responseTypesMarkdown = markdown.split(/\n\s*---\s*\n/g);
  const responseTypesXML = responseTypesMarkdown
    .filter(responseTypeMarkdown => responseTypeMarkdown.trim().length > 0)
    .map(toXml);

  // Construct final XML
  let finalDemandHints = '';
  if (demandHintTags.length) {
    finalDemandHints = `\n<demandhint>\n${demandHintTags.join('')}</demandhint>`;
  }

  const finalXml = `<problem>\n${responseTypesXML.join('\n\n')}${finalDemandHints}\n</problem>`;

  return finalXml;
};
