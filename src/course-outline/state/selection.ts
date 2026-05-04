import { type SelectionState } from '@src/data/types';

type BuildSelectionStateArgs = SelectionState;

export const buildSelectionState = ({
  currentId,
  sectionId,
  subsectionId,
  index,
}: BuildSelectionStateArgs): SelectionState => ({
  currentId,
  sectionId,
  subsectionId,
  index,
});
