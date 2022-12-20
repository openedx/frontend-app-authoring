import React from 'react';

import ProblemTypeSelect from './content/ProblemTypeSelect';
import Preview from './content/Preview';
import SelectTypeWrapper from './SelectTypeWrapper';
import * as hooks from './hooks';

export const SelectTypeModal = () => {
  const { selected, setSelected } = hooks.state.selected(null);

  return (
    <div>
      <SelectTypeWrapper selected={selected}>
        <ProblemTypeSelect setSelected={setSelected} />
        <Preview
          problemType={selected}
        />
      </SelectTypeWrapper>
    </div>
  );
};

export default SelectTypeModal;
