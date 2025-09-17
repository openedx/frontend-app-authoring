import React from 'react';
import { Button, Icon } from '@openedx/paragon';
import { EditorView } from '@codemirror/view';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  CheckBoxIcon, Lightbulb, ArrowDropDown, ViewList,
} from '@openedx/paragon/icons';

import messages from './messages';
import {
  HEADING,
  MULTIPLE_CHOICE,
  CHECKBOXES,
  TEXT_INPUT,
  NUMERICAL_INPUT,
  DROPDOWN,
  EXPLANATION,
} from './constants';

import './EditorToolbar.scss';

// ✅ Define props type
interface EditorToolbarProps {
  editorRef: EditorView | null;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ editorRef }) => {
  const intl = useIntl();

  const insertAtCursor = (text: string) => {
    if (!editorRef) { return; }
    const { from, to } = editorRef.state.selection.main;
    editorRef.dispatch({
      changes: { from, to, insert: text },
      selection: { anchor: from + text.length },
    });
    editorRef.focus();
  };

  return (
    <div className="editor-toolbar">
      <Button type="button" className="toolbar-button" onClick={() => insertAtCursor(HEADING)}>
        <span className="editor-icon">{'<H>'}</span>{' '}
        {intl.formatMessage(messages.editorToolbarHeadingButtonLabel)}
      </Button>

      <Button type="button" className="toolbar-button" onClick={() => insertAtCursor(MULTIPLE_CHOICE)}>
        <Icon src={ViewList} size="sm" className="toolbar-icon" />{' '}
        {intl.formatMessage(messages.editorToolbarMultipleChoiceButtonLabel)}
      </Button>

      <Button type="button" className="toolbar-button" onClick={() => insertAtCursor(CHECKBOXES)}>
        <Icon src={CheckBoxIcon} size="sm" className="toolbar-icon" />{' '}
        {intl.formatMessage(messages.editorToolbarCheckboxButtonLabel)}
      </Button>

      <span className="toolbar-separator" />

      <Button type="button" className="toolbar-button" onClick={() => insertAtCursor(TEXT_INPUT)}>
        <span className="editor-icon">ABC</span>{' '}
        {intl.formatMessage(messages.editorToolbarTextButtonLabel)}
      </Button>

      <Button type="button" className="toolbar-button" onClick={() => insertAtCursor(NUMERICAL_INPUT)}>
        <span className="editor-icon">123</span>{' '}
        {intl.formatMessage(messages.editorToolbarNumericalButtonLabel)}
      </Button>

      <Button
        type="button"
        className="toolbar-button editor-btn-dropdown"
        onClick={() => insertAtCursor(DROPDOWN)}
      >
        <Icon src={ArrowDropDown} size="sm" className="toolbar-icon" />{' '}
        {intl.formatMessage(messages.editorToolbarDropdownButtonLabel)}
      </Button>

      <span className="toolbar-separator" />

      <Button type="button" className="toolbar-button" onClick={() => insertAtCursor(EXPLANATION)}>
        <Icon src={Lightbulb} size="sm" className="toolbar-icon" />{' '}
        {intl.formatMessage(messages.editorToolbarExplanationButtonLabel)}
      </Button>
    </div>
  );
};

export default EditorToolbar;
