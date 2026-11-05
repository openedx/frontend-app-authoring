import type { EditorComponent } from '@src/editors/EditorComponent';

export type GameType = 'flashcards' | 'matching';
export type ImageType = 'term' | 'definition';

export interface Card {
  id: string;
  /** The block's stable key for this card; absent until the block has saved it once. */
  card_key?: string;
  term: string;
  term_image: string;
  term_image_path: string;
  term_image_alt: string;
  definition: string;
  definition_image: string;
  definition_image_path: string;
  definition_image_alt: string;
  editorOpen: boolean;
}

/** One ordered deck. Its order in `GameState.decks` is its order in the block. */
export interface Deck {
  /** Local, stable id: keys validation errors and the active deck. Never saved. */
  id: string;
  /** The block's stable key for this deck; absent until the block has saved it once. */
  deck_key?: string;
  name: string;
  cards: Card[];
}

export interface GameSettings {
  shuffle: boolean;
  timer: boolean;
}

/**
 * Where a card is dropped: a deck, and a position in it counted after the card
 * has left its source deck but before the target's blank draft is dropped
 * (see `moveCard`). A drag resolver reports this; the state transition
 * is the only thing that acts on it.
 */
export interface CardDropTarget {
  deckId: string;
  index: number;
}

/**
 * Why a deck name is invalid: it is blank, or another deck already has it,
 * ignoring case. One vocabulary for the data layer and the UI.
 */
export type DeckNameError = 'required' | 'duplicate';

export interface GameState {
  settings: GameSettings;
  type: GameType;
  /** The ordered decks; the first one is the block's primary (legacy) deck. */
  decks: Deck[];
  activeDeckId: string;
  /**
   * Whether the block's backend understands decks: true only when
   * `get_settings` returned a `decks` array. An older block is one deck and
   * must be saved with `cards` only, or its unknown `decks` field is refused.
   */
  supportsDecks: boolean;
  /**
   * Compatibility view of the active deck's cards. The built-in editor reads
   * it, so every deck transition refreshes it; `decks` stays authoritative.
   */
  list: Card[];
  isDirty: boolean;
  isLoaded: boolean;
  /** Any failed request (load, save, image upload). */
  error: RequestError | null;
  loadFailed: boolean;
}

/** One deck as it goes into a save, before `buildSavePayload` reshapes it. */
export interface DeckContent {
  deckKey?: string;
  name: string;
  cards: Partial<Card>[];
}

/** What `save_settings` is sent, before `buildSavePayload` reshapes it. */
export interface SaveArgs {
  gameType: GameType;
  isShuffled: boolean;
  hasTimer: boolean;
  /** The primary deck's cards. Ignored when `decks` is given. */
  cards: Partial<Card>[];
  /** Every deck, in order. Absent from callers that only know one deck. */
  decks?: DeckContent[];
  /** Null until the editors' store has the block's title. */
  title: string | null;
}

export interface SavedCard {
  term: string;
  card_key?: string;
  definition: string;
  order: number;
  term_image?: string;
  term_image_path?: string;
  term_image_alt?: string;
  definition_image?: string;
  definition_image_path?: string;
  definition_image_alt?: string;
}

export interface SavedDeck {
  deck_key?: string;
  name: string;
  cards: SavedCard[];
}

export interface SavePayload {
  /** Omitted when the editor has no title, so the block keeps the one it has. */
  display_name?: string | null;
  game_type: GameType;
  is_shuffled: boolean;
  has_timer: boolean;
  /**
   * Every deck, in order. Omitted for a backend that does not support decks;
   * an older block rejects a field it does not declare.
   */
  decks?: SavedDeck[];
  /** The primary deck's cards; the block keeps this as its `cards` mirror. */
  cards: SavedCard[];
}

/** One deck in a `get_settings` response. */
export interface SettingsDeck {
  deck_key?: string;
  name?: string;
  cards?: Partial<Card>[];
}

/** `get_settings` response body. Every field is optional on a fresh block. */
export interface SettingsResponse {
  game_type?: GameType;
  is_shuffled?: boolean;
  has_timer?: boolean;
  cards?: Partial<Card>[];
  /** Absent on a backend that predates decks. */
  decks?: SettingsDeck[];
}

/** Which request an error came from. The editor picks the alert heading by it. */
export type RequestErrorCode = 'uploadFailed' | 'saveFailed';

/**
 * An error the editor shows. `message` is the server's detail, if it gave one;
 * `code` identifies the request when the server gave no text.
 */
export type RequestError = Error & { code?: RequestErrorCode; };

/** `upload_image` response body. Failure arrives as HTTP 200 + `success: false`. */
export type UploadResponse =
  | { success: false; error?: string; }
  | { success?: true; url: string; file_path?: string; };

/** `save_settings` response body. Same 200-with-`success: false` convention. */
export interface SaveResponse {
  success?: boolean;
  error?: string;
  [key: string]: unknown;
}

export type ImageData = { url: string; altText?: string; };

/** What the built-in entry (index.tsx) hands the block-scoped editor. */
export interface BlockEditorProps {
  blockId: string | null;
  /** The Studio this editor talks to. */
  studioEndpointUrl: string;
  onClose: (() => void) | null;
  returnFunction?: EditorComponent['returnFunction'];
}

/** What the API layer needs to reach one block's handlers. */
export interface BlockRef {
  blockId: string;
  studioEndpointUrl: string;
  /** Library blocks have no fixed handler route; their URLs are issued by the server. */
  isLibrary: boolean;
}
