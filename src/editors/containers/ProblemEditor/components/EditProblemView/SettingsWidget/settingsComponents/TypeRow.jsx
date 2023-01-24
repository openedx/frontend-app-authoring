import React from 'react';
import { Container, Icon } from '@edx/paragon';
import PropTypes from 'prop-types';
import { Check } from '@edx/paragon/icons';
import { typeRowHooks } from '../hooks';

export const TypeRow = ({
  answers,
  correctAnswerCount,
  typeKey,
  label,
  selected,
  lastRow,
  updateField,
  updateAnswer,
}) => {
  const { onClick } = typeRowHooks({
    answers,
    correctAnswerCount,
    typeKey,
    updateField,
    updateAnswer,
  });

  return (
    <>
      <Container size="xl" onClick={onClick} role="button" className="d-flex" fluid>
        <span className="flex-grow-1">{label}</span>
        <span hidden={selected}><Icon src={Check} className="text-success" /></span>
      </Container>
      <hr className={lastRow ? 'd-none' : 'd-block'} />
    </>
  );
};

TypeRow.propTypes = {
  answers: PropTypes.arrayOf(PropTypes.shape({
    correct: PropTypes.bool,
    id: PropTypes.string,
    selectedFeedback: PropTypes.string,
    title: PropTypes.string,
    unselectedFeedback: PropTypes.string,
  })).isRequired,
  correctAnswerCount: PropTypes.number.isRequired,
  typeKey: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  lastRow: PropTypes.bool.isRequired,
  updateAnswer: PropTypes.func.isRequired,
  updateField: PropTypes.func.isRequired,
};

export default TypeRow;
