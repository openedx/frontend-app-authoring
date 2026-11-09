import { v4 as uuidv4 } from 'uuid';

export type CardSideType = 'left' | 'right';

export interface Card {
  text: string;
}

export interface Pair {
  key: string;
  left: Card;
  right: Card;

  // used locally by the editor, not by the student view
  editorOpen: boolean;
}

export interface MatchingState {
  displayName: string;
  isShuffled: boolean;
  hasTimer: boolean;
  pairs: Pair[];
}

export const emptyPair = (): Pair => ({
  key: uuidv4(),
  left: {
    text: '',
  },
  right: {
    text: '',
  },
  editorOpen: true,
});

export const initialMatchingState: () => MatchingState = () => ({
  displayName: 'Matching',
  isShuffled: true,
  hasTimer: true,
  pairs: [],
});
