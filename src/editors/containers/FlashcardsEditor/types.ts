import { v4 as uuidv4 } from 'uuid';

export type CardSide = 'term' | 'definition';

// represents info about an image for the image alt text editor modal
export interface ImageData {
  index: number;
  cardSide: CardSide;
  altText: string;
  url: string;
}

export interface Card {
  cardKey: string;
  term: string;
  termImage: string;
  termImagePath: string;
  termImageAlt: string;
  definition: string;
  definitionImage: string;
  definitionImagePath: string;
  definitionImageAlt: string;
  editorOpen: boolean;
}

export interface FlashcardsState {
  displayName: string;
  isShuffled: boolean;
  cards: Card[];
}

export const emptyCard = (): Card => ({
  cardKey: uuidv4(),
  term: '',
  termImage: '',
  termImagePath: '',
  termImageAlt: '',
  definition: '',
  definitionImage: '',
  definitionImagePath: '',
  definitionImageAlt: '',
  editorOpen: true,
});

export const initialFlashcardsState: () => FlashcardsState = () => ({
  displayName: 'Flashcards',
  isShuffled: true,
  cards: [emptyCard()],
});
