import React from 'react';
import { Container, Icon } from '@edx/paragon';
import PropTypes from 'prop-types';
import { Check } from '@edx/paragon/icons';
import { typeRowHooks } from '../hooks';

export const TypeRow = ({
  typeKey,
  label,
  selected,
  lastRow,
  updateField,
}) => {
  const { onClick } = typeRowHooks(typeKey, updateField);

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
  typeKey: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  lastRow: PropTypes.bool.isRequired,
  updateField: PropTypes.func.isRequired,
};

export default TypeRow;
