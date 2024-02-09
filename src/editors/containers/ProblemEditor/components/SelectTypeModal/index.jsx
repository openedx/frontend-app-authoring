import React from 'react';
import PropTypes from 'prop-types';

import { Row, Stack } from '@openedx/paragon';
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
      <Row className="justify-content-center">
        {(!Object.values(AdvanceProblemKeys).includes(selected)) ? (
          <Stack direction="horizontal" gap={4} className="flex-wrap mb-6">
            <ProblemTypeSelect selected={selected} setSelected={setSelected} />
            <Preview problemType={selected} />
          </Stack>
        ) : <AdvanceTypeSelect selected={selected} setSelected={setSelected} />}
      </Row>
    </SelectTypeWrapper>
  );
};

SelectTypeModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default SelectTypeModal;
