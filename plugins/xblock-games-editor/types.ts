import type { AxiosResponse } from 'axios';

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

export interface GameSettings {
  shuffle: boolean;
  timer: boolean;
}

export interface GameState {
  settings: GameSettings;
  type: GameType;
  list: Card[];
  isDirty: boolean;
  isLoaded: boolean;
  /** Any failed request (load, save, image upload). */
  error: RequestError | null;
  loadFailed: boolean;
}

/** What `save_settings` is sent, before `buildSavePayload` reshapes it. */
export interface SaveArgs {
  gameType: GameType;
  isShuffled: boolean;
  hasTimer: boolean;
  cards: Partial<Card>[];
  /** Null until the host's editor store has the block's title. */
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

export interface SavePayload {
  display_name: string | null;
  game_type: GameType;
  is_shuffled: boolean;
  has_timer: boolean;
  cards: SavedCard[];
}

/** `get_settings` response body. Every field is optional on a fresh block. */
export interface SettingsResponse {
  game_type?: GameType;
  is_shuffled?: boolean;
  has_timer?: boolean;
  cards?: Partial<Card>[];
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

export interface GameActions {
  getLatestState: () => GameState;
  waitForPendingRequests: () => Promise<void>;
  setShuffleStatus: (value: boolean) => void;
  setTimerStatus: (value: boolean) => void;
  updateType: (value: GameType) => void;
  updateTerm: (args: { index: number; term: string; }) => void;
  updateDefinition: (args: { index: number; definition: string; }) => void;
  updateTermImageAlt: (args: { index: number; termImageAlt: string; }) => void;
  updateDefinitionImageAlt: (args: { index: number; definitionImageAlt: string; }) => void;
  toggleOpen: (args: { index: number; isOpen: boolean; }) => void;
  setList: (value: Card[]) => void;
  addCard: () => void;
  removeCard: (args: { index: number; }) => void;
  uploadGameImage: (args: {
    cardId: string;
    imageFile: File;
    imageType: ImageType;
    index?: number;
  }) => Promise<unknown>;
  deleteGameImage: (args: {
    cardId: string;
    imageType: ImageType;
    index?: number;
    filePath?: string;
  }) => void;
  save: (content: SaveArgs) => Promise<AxiosResponse<SaveResponse>>;
  reload: () => void;
  clearError: () => void;
}

/** Props `XBlockEditorSlot` hands the plugin (the subset this editor uses). */
export interface EditorPluginProps {
  blockId?: string | null;
  /** Course or library the block belongs to. Decides how handler URLs resolve. */
  learningContextId?: string | null;
  /** The Studio this editor talks to. Falls back to the global config when null. */
  studioEndpointUrl?: string | null;
  onClose?: (() => void) | null;
  returnFunction?: (() => (result: unknown) => void) | null;
}

/** What the API layer needs to reach one block's handlers. */
export interface BlockRef {
  blockId: string;
  studioEndpointUrl: string;
  /** Library blocks have no fixed handler route; their URLs are issued by the server. */
  isLibrary: boolean;
}
