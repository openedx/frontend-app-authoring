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
} from '@src/editors/containers/FlashcardsEditor/types';

/**
 * The Flashcards block's own XBlock handlers.
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
 * `deleteFlashcardsImage` in useFlashcardsState), so the keys are there for the backend.
 */
export const buildSavePayload = ({
  isShuffled,
  cards,
  displayName,
}: SaveArgs): SavePayload => {
  const formattedCards: SavedCard[] = cards.map((card, index) => {
    return {
      card_key: card.card_key,
      term: card.term || '',
      definition: card.definition || '',
      order: index + 1,
      term_image: card.term_image || '',
      term_image_path: card.term_image_path || '',
      term_image_alt: card.term_image_alt || '',
      definition_image: card.definition_image || '',
      definition_image_path: card.definition_image_path || '',
      definition_image_alt: card.definition_image_alt || '',
    };
  });

  return {
    display_name: displayName,
    is_shuffled: isShuffled,
    cards: formattedCards,
  };
};

export const saveSettings = (block: BlockRef, args: SaveArgs) =>
  postToHandler<SaveResponse>(block, 'save_settings', buildSavePayload(args));
