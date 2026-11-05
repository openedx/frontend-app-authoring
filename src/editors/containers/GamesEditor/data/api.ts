import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import type { AxiosResponse } from 'axios';

import { resolveHandlerUrl } from '@src/editors/data/services/cms/handlerUrl';

import type {
  BlockRef,
  Card,
  DeckContent,
  SaveArgs,
  SavedCard,
  SavedDeck,
  SavePayload,
  SaveResponse,
  SettingsResponse,
  UploadResponse,
} from '@src/editors/containers/GamesEditor/types';

/**
 * The Games block's own XBlock handlers.
 *
 * Talks to the block's handlers directly: the shared `saveBlock` thunk only
 * knows the payload shapes of `html`, `problem`, `video` and `pdf`, and would
 * drop the `*_image_path` keys this block needs.
 */
const client = () => getAuthenticatedHttpClient();

const postToHandler = async <T>(
  block: BlockRef,
  handlerName: string,
  body: unknown,
): Promise<AxiosResponse<T>> => client().post(await resolveHandlerUrl({ ...block, handlerName }), body);

export const getSettings = (block: BlockRef) => postToHandler<SettingsResponse>(block, 'get_settings', {});

export const uploadImage = (block: BlockRef, file: File) => {
  const data = new FormData();
  data.append('file', file);
  return postToHandler<UploadResponse>(block, 'upload_image', data);
};

/**
 * One card, in the shape the block's `save_settings` handler expects. Every
 * card goes through here, whichever deck it is in.
 */
const formatCard = (card: Partial<Card>, index: number): SavedCard => {
  const baseCard: SavedCard = {
    term: card.term || '',
    definition: card.definition || '',
    // The handler renumbers card order from array position on every save; the
    // number sent here is only what an older backend reads.
    order: index + 1,
  };
  // The block's own key for the card. Sent back so the card keeps its
  // identity; a new card has none, and the block assigns one.
  if (card.card_key) {
    baseCard.card_key = card.card_key;
  }
  // The image fields go with every game type. Matching does not show them,
  // but the block accepts them, and dropping them would wipe the images of
  // an author who tries Matching and switches back to Flashcards.
  return {
    ...baseCard,
    term_image: card.term_image || '',
    term_image_path: card.term_image_path || '',
    term_image_alt: card.term_image_alt || '',
    definition_image: card.definition_image || '',
    definition_image_path: card.definition_image_path || '',
    definition_image_alt: card.definition_image_alt || '',
  };
};

/** One deck, in the shape the block's `save_settings` handler expects. */
const formatDeck = (deck: DeckContent): SavedDeck => {
  const formatted: SavedDeck = {
    // The handler trims and validates names; trimming here keeps the payload
    // it stores as close to what the author typed as possible.
    name: (deck.name || '').trim(),
    cards: deck.cards.map(formatCard),
  };
  // A deck the block has not saved before has no key yet; the block assigns
  // one and keeps sending it back from then on.
  if (deck.deckKey) {
    formatted.deck_key = deck.deckKey;
  }
  return formatted;
};

/**
 * Shape the decks the way the block's `save_settings` handler expects.
 *
 * `decks` is the complete ordered list; the block deletes any deck it does not
 * receive. `cards` is the first (primary) deck's cards again: the block keeps
 * that field as the compatibility mirror older clients and learners read, and
 * a backend that predates decks ignores `decks` and reads only `cards`.
 *
 * `*_image_path` are the storage keys: where each image's file lives, as
 * opposed to the URL it is shown from. They are sent so the block keeps the
 * link between a card and its file across saves; the shared cms api.ts omits
 * them, which loses it. This editor never deletes files itself (see
 * `deleteGameImage` in useGameState), so the keys are there for the backend.
 */
export const buildSavePayload = ({
  gameType,
  isShuffled,
  hasTimer,
  cards,
  decks,
  title,
}: SaveArgs): SavePayload => {
  const payload: SavePayload = {
    game_type: gameType,
    is_shuffled: isShuffled,
    // has_timer goes with every game type: the block stores it regardless and
    // its save handler reads a missing value as true, which would turn a timer
    // the author switched off back on the next time a flashcards game is saved.
    has_timer: hasTimer,
    cards: cards.map(formatCard),
  };

  // No title yet: omit display_name rather than sending null. The current
  // block keeps the name it already has when the field is missing; a block that
  // predates that behaviour still applies its own default, so this is not a
  // guarantee for older deployments.
  if (title != null) { payload.display_name = title; }

  // Decks are only sent when the caller has them: an older block does not
  // declare the field and must keep receiving a cards-only payload. When they
  // are sent they are the complete list, and `cards` mirrors the first deck.
  if (decks?.length) {
    payload.decks = decks.map(formatDeck);
    payload.cards = payload.decks[0].cards;
  }

  return payload;
};

export const saveSettings = (block: BlockRef, args: SaveArgs) =>
  postToHandler<SaveResponse>(block, 'save_settings', buildSavePayload(args));
