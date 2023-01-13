import React from 'react';
import PropTypes from 'prop-types';
import { Form } from '@edx/paragon';

const Checker = ({
  hasSingleAnswer, answer, setAnswer,
}) => {
  let CheckerType = Form.Checkbox;
  if (hasSingleAnswer) {
    CheckerType = Form.Radio;
  }
  return (
    <CheckerType
      className="pl-4"
      value={answer.id}
      onChange={(e) => setAnswer({ correct: e.target.checked })}
      checked={answer.correct}
    >
      {answer.id}
    </CheckerType>
  );
};
Checker.propTypes = {
  hasSingleAnswer: PropTypes.bool.isRequired,
  answer: PropTypes.shape({
    correct: PropTypes.bool,
    id: PropTypes.number,
  }).isRequired,
  setAnswer: PropTypes.func.isRequired,
};

export default Checker;
