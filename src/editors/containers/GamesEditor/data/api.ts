import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import type { AxiosResponse } from 'axios';

import { resolveHandlerUrl } from '@src/editors/data/services/cms/handlerUrl';

import type {
  BlockRef,
  SaveArgs,
  SavedCard,
  SavePayload,
  SaveResponse,
  SettingsResponse,
  UploadResponse,
} from '../types';

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
 * Shape the card list the way the block's `save_settings` handler expects.
 *
 * `*_image_path` are the storage keys: where each image's file lives, as
 * opposed to the URL it is shown from. They are sent so the block keeps the
 * link between a card and its file across saves; the shared cms api.ts
 * omits them, which loses it. This editor never deletes files itself (see
 * `deleteGameImage` in useGameState), so the keys are there for the backend.
 */
export const buildSavePayload = ({
  gameType,
  isShuffled,
  hasTimer,
  cards,
  title,
}: SaveArgs): SavePayload => {
  const formattedCards: SavedCard[] = cards.map((card, index) => {
    const baseCard: SavedCard = {
      term: card.term || '',
      definition: card.definition || '',
      order: index + 1,
    };
    // The block's own key for the card. Sent back so the card keeps its
    // identity; a new card has none, and the block assigns one.
    if (card.card_key) {
      baseCard.card_key = card.card_key;
    }
    if (gameType !== 'flashcards') {
      return baseCard;
    }
    return {
      ...baseCard,
      term_image: card.term_image || '',
      term_image_path: card.term_image_path || '',
      term_image_alt: card.term_image_alt || '',
      definition_image: card.definition_image || '',
      definition_image_path: card.definition_image_path || '',
      definition_image_alt: card.definition_image_alt || '',
    };
  });

  // has_timer goes with every game type: the block stores it regardless and
  // its save handler reads a missing value as true, which would turn a timer
  // the author switched off back on the next time a flashcards game is saved.
  return {
    display_name: title,
    game_type: gameType,
    is_shuffled: isShuffled,
    has_timer: hasTimer,
    cards: formattedCards,
  };
};

export const saveSettings = (block: BlockRef, args: SaveArgs) =>
  postToHandler<SaveResponse>(block, 'save_settings', buildSavePayload(args));
