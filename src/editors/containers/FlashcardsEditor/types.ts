import { v4 as uuidv4 } from 'uuid';

export type CardSideType = 'front' | 'back';

export interface Image {
  url: string;
  alt: string;
}

export interface CardSide {
  text: string;
  image: Image;
}

export interface Card {
  key: string;
  front: CardSide;
  back: CardSide;

  // used locally by the editor, not by the student view
  editorOpen: boolean;
}

export interface FlashcardsState {
  displayName: string;
  isShuffled: boolean;
  cards: Card[];
}

export const emptyCard = (): Card => ({
  key: uuidv4(),
  front: {
    text: '',
    image: {
      url: '',
      alt: '',
    },
  },
  back: {
    text: '',
    image: {
      url: '',
      alt: '',
    },
  },
  editorOpen: true,
});

export const initialFlashcardsState: () => FlashcardsState = () => ({
  displayName: 'Flashcards',
  isShuffled: true,
  cards: [],
});
