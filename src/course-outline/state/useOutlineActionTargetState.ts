import { useState } from 'react';

import { SelectionState } from '@src/data/types';

export type UseOutlineActionTargetState = {
  actionTargetSelection: SelectionState | undefined;
  setActionTargetSelection: React.Dispatch<React.SetStateAction<SelectionState | undefined>>;
};

/**
 * Manages action/menu target selection state for the course outline.
 *
 * This is intentionally separate from sidebar/card selection so opening a menu
 * does not change which card is selected in the outline.
 */
const useOutlineActionTargetState = (): UseOutlineActionTargetState => {
  const [actionTargetSelection, setActionTargetSelection] = useState<SelectionState | undefined>();

  return { actionTargetSelection, setActionTargetSelection };
};

export default useOutlineActionTargetState;
