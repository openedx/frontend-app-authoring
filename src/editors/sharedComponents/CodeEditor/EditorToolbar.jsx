import React from 'react';
import { Button, Icon } from '@openedx/paragon';
import PropTypes from 'prop-types';
import { EditorView } from '@codemirror/view';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  CheckBoxIcon, Lightbulb, ArrowDropDown, ViewList,
} from '@openedx/paragon/icons';

import messages from './messages';
import {
  HEADING, MULTIPLE_CHOICE, CHECKBOXES, TEXT_INPUT, NUMERICAL_INPUT, DROPDOWN, EXPLANATION,
} from './constants';

import './EditorToolbar.scss';

const EditorToolbar = ({ editorRef }) => {
  const intl = useIntl();
  const cm = editorRef;

  const insertAtCursor = (text) => {
    if (!cm) { return; }
    const { from, to } = cm.state.selection.main;
    cm.dispatch({
      changes: { from, to, insert: text },
      selection: { anchor: from + text.length },
    });
    cm.focus();
  };

  return (
    <div className="editor-toolbar">
      <Button type="button" className="toolbar-button" onClick={() => insertAtCursor(HEADING)}>
        <span className="editor-icon">{'<H>'}</span> {intl.formatMessage(messages.editorToolbarHeadingButtonLabel)}
      </Button>

      <Button type="button" className="toolbar-button" onClick={() => insertAtCursor(MULTIPLE_CHOICE)}>
        <Icon src={ViewList} size="sm" className="toolbar-icon" /> {intl.formatMessage(messages.editorToolbarMultipleChoiceButtonLabel)}
      </Button>

      <Button type="button" className="toolbar-button" onClick={() => insertAtCursor(CHECKBOXES)}>
        <Icon src={CheckBoxIcon} size="sm" className="toolbar-icon" /> {intl.formatMessage(messages.editorToolbarCheckboxButtonLabel)}
      </Button>

      <span className="toolbar-separator" />

      <Button type="button" className="toolbar-button" onClick={() => insertAtCursor(TEXT_INPUT)}>
        <span className="editor-icon">ABC</span> {intl.formatMessage(messages.editorToolbarTextButtonLabel)}
      </Button>

      <Button type="button" className="toolbar-button" onClick={() => insertAtCursor(NUMERICAL_INPUT)}>
        <span className="editor-icon">123</span> {intl.formatMessage(messages.editorToolbarNumericalButtonLabel)}
      </Button>

      <Button type="button" className="toolbar-button editor-btn-dropdown" onClick={() => insertAtCursor(DROPDOWN)}>
        <Icon src={ArrowDropDown} size="sm" className="toolbar-icon" /> {intl.formatMessage(messages.editorToolbarDropdownButtonLabel)}
      </Button>

      <span className="toolbar-separator" />

      <Button type="button" className="toolbar-button" onClick={() => insertAtCursor(EXPLANATION)}>
        <Icon src={Lightbulb} size="sm" className="toolbar-icon" /> {intl.formatMessage(messages.editorToolbarExplanationButtonLabel)}
      </Button>
    </div>
  );
};

EditorToolbar.propTypes = {
  editorRef: PropTypes.oneOfType([
    PropTypes.shape({ current: PropTypes.instanceOf(EditorView) }),
    PropTypes.instanceOf(EditorView),
  ]),
};

EditorToolbar.defaultProps = {
  editorRef: null,
};

export default EditorToolbar;
