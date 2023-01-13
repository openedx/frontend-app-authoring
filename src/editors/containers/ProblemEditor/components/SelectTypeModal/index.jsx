import React from 'react';
import PropTypes from 'prop-types';

import { Col, Row } from '@edx/paragon';
import ProblemTypeSelect from './content/ProblemTypeSelect';
import Preview from './content/Preview';
import AdvanceTypeSelect from './content/AdvanceTypeSelect';
import SelectTypeWrapper from './SelectTypeWrapper';
import hooks from './hooks';
import { AdvanceProblemKeys } from '../../../../data/constants/problem';

export const SelectTypeModal = ({
  onClose,
}) => {
  const { selected, setSelected } = hooks.selectHooks();
  hooks.useArrowNav(selected, setSelected);

  return (
    <SelectTypeWrapper onClose={onClose} selected={selected}>
      <Row className="justify-content-center align-items-stretch m-4">
        {(!Object.values(AdvanceProblemKeys).includes(selected)) ? (
          <>
            <Col>
              <ProblemTypeSelect selected={selected} setSelected={setSelected} />
            </Col>
            <Col>
              <Preview problemType={selected} />
            </Col>
          </>
        ) : <AdvanceTypeSelect selected={selected} setSelected={setSelected} />}
      </Row>
    </SelectTypeWrapper>
  );
};

SelectTypeModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default SelectTypeModal;
