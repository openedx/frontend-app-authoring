import React from 'react';
import PropTypes from 'prop-types';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { Form } from '@edx/paragon';

const CourseCodeEditor = ({
  code, field, label, helpText, onChange,
}) => (
  <Form.Group className="form-group-custom">
    <Form.Label>{label}</Form.Label>
    <CodeMirror
      value={code}
      extensions={[html()]}
      onChange={(value) => onChange(value, field)}
    />
    <Form.Control.Feedback>{helpText}</Form.Control.Feedback>
  </Form.Group>
);

CourseCodeEditor.defaultProps = {
  code: '',
  label: '',
  helpText: '',
};

CourseCodeEditor.propTypes = {
  code: PropTypes.string,
  label: PropTypes.string,
  field: PropTypes.string.isRequired,
  helpText: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default CourseCodeEditor;
