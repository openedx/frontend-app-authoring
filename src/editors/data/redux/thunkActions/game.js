import { getConfig } from '@edx/frontend-platform';
import { StrictDict } from '../../../utils';
import * as requests from './requests';
import { actions as gameActions } from '../game';
import { actions as requestsActions } from '../requests';
import { RequestKeys } from '../../constants/requests';

const actions = {
  game: gameActions,
  requests: requestsActions,
};

/**
 * Load existing game settings and populate the Redux store
 */
export const loadGamesSettings = () => (dispatch) => {
  dispatch(requests.getGamesSettings({
    onSuccess: (response) => {
      const { data } = response;

      const gameType = data.game_type || 'matching';
      dispatch(actions.game.updateType(gameType));
      const isShuffled = data.is_shuffled !== undefined ? data.is_shuffled : true;
      dispatch(actions.game.setShuffleStatus(isShuffled));
      const hasTimer = data.has_timer !== undefined ? data.has_timer : true;
      dispatch(actions.game.setTimerStatus(hasTimer));

      if (data.cards && data.cards.length > 0) {
        const formattedCards = data.cards.map((card, index) => ({
          id: `card-${Date.now()}-${index}`,
          term: card.term || '',
          term_image: card.term_image || '',
          term_image_path: card.term_image_path || '',
          term_image_alt: card.term_image_alt || '',
          definition: card.definition || '',
          definition_image: card.definition_image || '',
          definition_image_path: card.definition_image_path || '',
          definition_image_alt: card.definition_image_alt || '',
          editorOpen: true,
        }));
        dispatch(actions.game.setList(formattedCards));
      } else {
        const emptyCard = {
          id: `card-${Date.now()}-0`,
          term: '',
          term_image: '',
          term_image_path: '',
          term_image_alt: '',
          definition: '',
          definition_image: '',
          definition_image_path: '',
          definition_image_alt: '',
          editorOpen: true,
        };
        dispatch(actions.game.setList([emptyCard]));
      }
    },
    onFailure: (error) => {
      dispatch(actions.requests.failRequest({
        requestKey: RequestKeys.fetchBlock,
        error,
      }));
    },
  }));
};

/**
 * Upload an image for games xblock and update the state with the returned URL
 * @param {number} index - The index of the card in the list
 * @param {File} imageFile - The image file to upload
 * @param {string} imageType - Either 'term' or 'definition'
 */
export const uploadGameImage = ({ index, imageFile, imageType }) => (dispatch) => {
  dispatch(requests.uploadGamesImage({
    image: imageFile,
    onSuccess: (response) => {
      // Extract the URL and file_path from the response
      // Response format: { success: true, url: "/media/games/...", filename: "...", file_path: "games/..." }
      let imageUrl = response.data?.url;
      const filePath = response.data?.file_path || '';

      // Check if URL is already complete (starts with http/https) or needs studio base URL
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `${getConfig().STUDIO_BASE_URL}${imageUrl}`;
      }

      if (imageType === 'term') {
        dispatch(actions.game.updateTermImage({ index, termImage: imageUrl }));
        dispatch(actions.game.updateTermImagePath({ index, termImagePath: filePath }));
      } else if (imageType === 'definition') {
        dispatch(actions.game.updateDefinitionImage({ index, definitionImage: imageUrl }));
        dispatch(actions.game.updateDefinitionImagePath({ index, definitionImagePath: filePath }));
      }
    },
    onFailure: (error) => {
      dispatch(actions.requests.failRequest({
        requestKey: RequestKeys.uploadAsset,
        error,
      }));
    },
  }));
};

/**
 * Delete an image from games xblock
 */
export const deleteGameImage = ({ index, imageType, filePath }) => (dispatch) => {
  if (!filePath) {
    // If no filePath, just clear the fields without calling API
    if (imageType === 'term') {
      dispatch(actions.game.updateTermImage({ index, termImage: '' }));
      dispatch(actions.game.updateTermImagePath({ index, termImagePath: '' }));
    } else if (imageType === 'definition') {
      dispatch(actions.game.updateDefinitionImage({ index, definitionImage: '' }));
      dispatch(actions.game.updateDefinitionImagePath({ index, definitionImagePath: '' }));
    }
    return;
  }

  dispatch(requests.deleteGamesImage({
    key: filePath,
    onSuccess: (response) => {
      if (response.data.success === false) {
        dispatch(actions.requests.failRequest({
          requestKey: RequestKeys.deleteAsset,
          error: response.data?.error,
        }));
        return;
      }
      if (imageType === 'term') {
        dispatch(actions.game.updateTermImage({ index, termImage: '' }));
        dispatch(actions.game.updateTermImagePath({ index, termImagePath: '' }));
      } else if (imageType === 'definition') {
        dispatch(actions.game.updateDefinitionImage({ index, definitionImage: '' }));
        dispatch(actions.game.updateDefinitionImagePath({ index, definitionImagePath: '' }));
      }
    },
    onFailure: (error) => {
      dispatch(actions.requests.failRequest({
        requestKey: RequestKeys.deleteAsset,
        error,
      }));
    },
  }));
};

export default StrictDict({
  loadGamesSettings,
  uploadGameImage,
  deleteGameImage,
});
