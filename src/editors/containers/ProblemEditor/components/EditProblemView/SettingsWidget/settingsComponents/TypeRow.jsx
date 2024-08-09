import React from 'react';
import { Icon } from '@openedx/paragon';
import PropTypes from 'prop-types';
import { Check } from '@openedx/paragon/icons';
import { typeRowHooks } from '../hooks';

import Button from '../../../../../../sharedComponents/Button';

const TypeRow = ({
  answers,
  blockTitle,
  correctAnswerCount,
  typeKey,
  label,
  selected,
  problemType,
  lastRow,
  setBlockTitle,
  updateField,
  updateAnswer,
}) => {
  const { onClick } = typeRowHooks({
    answers,
    blockTitle,
    correctAnswerCount,
    problemType,
    setBlockTitle,
    typeKey,
    updateField,
    updateAnswer,
  });

  return (
    <>
      <Button onClick={onClick} className="d-flex p-0 flex-row justify-content-between w-100">
        <span className="small text-primary-500">{label}</span>
        <span hidden={selected}><Icon src={Check} className="text-success" /></span>
      </Button>
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
  blockTitle: PropTypes.string.isRequired,
  correctAnswerCount: PropTypes.number.isRequired,
  typeKey: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  lastRow: PropTypes.bool.isRequired,
  problemType: PropTypes.string.isRequired,
  setBlockTitle: PropTypes.func.isRequired,
  updateAnswer: PropTypes.func.isRequired,
  updateField: PropTypes.func.isRequired,
};

export default TypeRow;
