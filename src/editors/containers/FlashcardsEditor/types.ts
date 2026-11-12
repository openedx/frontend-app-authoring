import { v4 as uuidv4 } from 'uuid';

export type CardSideType = 'term' | 'definition';

// represents info about an image for the image alt text editor modal
export interface ImageSettings {
  index: number;
  cardSide: CardSideType;
  altText: string;
  url: string;
}

export interface Image {
  url: string;
  alt: string;
}

export interface CardSide {
  text: string;
  image: Image;
}

export interface Card {
  cardKey: string;
  term: CardSide;
  definition: CardSide;

  // used locally by the editor, not by the student view
  editorOpen: boolean;
}

export interface FlashcardsState {
  displayName: string;
  isShuffled: boolean;
  cards: Card[];
}

export const emptyCard = (): Card => ({
  cardKey: uuidv4(),
  term: {
    text: '',
    image: {
      url: '',
      alt: '',
    },
  },
  definition: {
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
  cards: [emptyCard()],
});
