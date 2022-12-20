import React from 'react';
import PropTypes from 'prop-types';
import { Form } from '@edx/paragon';
import { ProblemTypes } from '../../../../../data/constants/problem';

// TODO: problemtype
const ProblemTypeSelect = ({
  // redux
  setSelected,
}) => {
  const handleChange = e => setSelected(e.target.value);
  return (
    <Form.Group>
      <Form.RadioSet
        name="problemtype"
        onChange={handleChange}
      >
        <Form.Radio value={ProblemTypes.SINGLESELECT}>{ProblemTypes.SINGLESELECT.title}</Form.Radio>
        <Form.Radio value={ProblemTypes.MULTISELECT}>{ProblemTypes.MULTISELECT.title}</Form.Radio>
        <Form.Radio value={ProblemTypes.DROPDOWN}>{ProblemTypes.DROPDOWN.title}</Form.Radio>
        <Form.Radio value={ProblemTypes.NUMERIC}>{ProblemTypes.NUMERIC.title}</Form.Radio>
        <Form.Radio value={ProblemTypes.TEXTINPUT}>{ProblemTypes.TEXTINPUT.title}</Form.Radio>
      </Form.RadioSet>
    </Form.Group>
  );
};
ProblemTypeSelect.propTypes = {
  setSelected: PropTypes.func.isRequired,
};

export default ProblemTypeSelect;
