import { StrictDict } from '../../../utils';
import * as requests from './requests';
import { actions as gameActions } from '../game';
import { actions as requestsActions } from '../requests';
import { RequestKeys } from '../../constants/requests';
import { getConfig } from '@edx/frontend-platform';

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
          definition: card.definition || '',
          definition_image: card.definition_image || '',
          editorOpen: true,
        }));
        dispatch(actions.game.setList(formattedCards));
      } else {
        const emptyCard = {
          id: `card-${Date.now()}-0`,
          term: '',
          term_image: '',
          definition: '',
          definition_image: '',
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
      // Extract the URL from the response
      // Response format: { success: true, url: "/media/games/...", filename: "..." }
      let imageUrl = response.data?.url;

      // Check if URL is already complete (starts with http/https) or needs studio base URL
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `${getConfig().STUDIO_BASE_URL}${imageUrl}`;
      }

      if (imageType === 'term') {
        dispatch(actions.game.updateTermImage({ index, termImage: imageUrl }));
      } else if (imageType === 'definition') {
        dispatch(actions.game.updateDefinitionImage({ index, definitionImage: imageUrl }));
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
    // If no filePath, just clear the field without calling API
    if (imageType === 'term') {
      dispatch(actions.game.updateTermImage({ index, termImage: '' }));
    } else if (imageType === 'definition') {
      dispatch(actions.game.updateDefinitionImage({ index, definitionImage: '' }));
    }
    return;
  }

  dispatch(requests.deleteGamesImage({
    key: filePath,
    onSuccess: (response) => {
      if (response.data.success === false) {
        dispatch(actions.requests.failRequest({
          requestKey: RequestKeys.uploadAsset,
          error: response.data?.error,
        }));
        return;
      }
      if (imageType === 'term') {
        dispatch(actions.game.updateTermImage({ index, termImage: '' }));
      } else if (imageType === 'definition') {
        dispatch(actions.game.updateDefinitionImage({ index, definitionImage: '' }));
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

export default StrictDict({
  loadGamesSettings,
  uploadGameImage,
  deleteGameImage,
});
