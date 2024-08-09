import React from 'react';
import PropTypes from 'prop-types';
import { Form } from '@openedx/paragon';

const Checker = ({
  hasSingleAnswer,
  answer,
  setAnswer,
  disabled,
}) => {
  let CheckerType = Form.Checkbox;
  if (hasSingleAnswer) {
    CheckerType = Form.Radio;
  }
  return (
    <>
      <CheckerType
        className="pt-2.5"
        value={answer.id}
        onChange={(e) => setAnswer({ correct: e.target.checked })}
        checked={answer.correct}
        isValid={answer.correct}
        disabled={disabled}
      />
      <Form.Label
        className="pt-2"
      >
        {answer.id}
      </Form.Label>
    </>
  );
};
Checker.defaultProps = {
  disabled: false,
};
Checker.propTypes = {
  hasSingleAnswer: PropTypes.bool.isRequired,
  answer: PropTypes.shape({
    correct: PropTypes.bool,
    id: PropTypes.number,
  }).isRequired,
  setAnswer: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default Checker;
