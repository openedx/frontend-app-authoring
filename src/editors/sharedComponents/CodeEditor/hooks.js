import React, { useEffect } from 'react';
import xmlChecker from 'xmlchecker';

import { basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { html } from '@codemirror/lang-html';
import { xml } from '@codemirror/lang-xml';
import { linter } from '@codemirror/lint';
import alphanumericMap from './constants';
import './index.scss';

const CODEMIRROR_LANGUAGES = { HTML: 'html', XML: 'xml' };

export const state = {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  showBtnEscapeHTML: (val) => React.useState(val),
};

export const prepareShowBtnEscapeHTML = () => {
  const [visibility, setVisibility] = state.showBtnEscapeHTML(true);
  const hide = () => setVisibility(false);
  return { showBtnEscapeHTML: visibility, hideBtn: hide };
};

export const cleanHTML = ({ initialText }) => {
  const translateRegex = new RegExp(`&(${Object.keys(alphanumericMap).join('|')});`, 'g');
  const translator = ($0, $1) => alphanumericMap[$1];
  return initialText.replace(translateRegex, translator);
};

export const syntaxChecker = ({ textArr, lang }) => {
  const diagnostics = [];
  if (lang === 'xml' && textArr) {
    const docString = textArr.join('\n');
    const xmlDoc = `<?xml version="1.0" encoding="UTF-8"?> ${docString}`;

    try {
      xmlChecker.check(xmlDoc);
    } catch (error) {
      let errorStart = 0;
      for (let i = 0; i < error.line - 1; i++) {
        errorStart += textArr[i].length;
      }
      const errorLine = error.line;
      const errorEnd = errorStart + textArr[errorLine - 1].length;
      diagnostics.push({
        from: errorStart,
        to: errorEnd,
        severity: 'error',
        message: `${error.name}: ${error.message}`,
      });
    }
  }
  return diagnostics;
};

export const createCodeMirrorDomNode = ({
  ref,
  initialText,
  upstreamRef,
  lang,
}) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const languageExtension = lang === CODEMIRROR_LANGUAGES.HTML ? html() : xml();
    const cleanText = cleanHTML({ initialText });
    const newState = EditorState.create({
      doc: cleanText,
      extensions: [
        basicSetup,
        languageExtension,
        EditorView.lineWrapping,
        linter((view) => {
          const textArr = view.state.doc.text;
          return syntaxChecker({ textArr, lang });
        }),
      ],
    });
    const view = new EditorView({ state: newState, parent: ref.current });
    // eslint-disable-next-line no-param-reassign
    upstreamRef.current = view;
    view.focus();

    return () => {
      // called on cleanup
      view.destroy();
    };
  }, []);
};

export const escapeHTMLSpecialChars = ({ ref, hideBtn }) => {
  const text = ref.current.state.doc.toString();
  let pos = 0;
  const changes = [];
  Object.keys(alphanumericMap).forEach(
    (escapedKeyword) => {
      // eslint-disable-next-line no-cond-assign
      for (let next; (next = text.indexOf(alphanumericMap[escapedKeyword], pos)) > -1;) {
        changes.push({ from: next, to: next + 1, insert: `&${escapedKeyword};` });
        pos = next + 1;
      }
    },
  );

  ref.current.dispatch({ changes });
  hideBtn();
};
