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

      if (data.game_type) {
        dispatch(actions.game.updateType(data.game_type));
      }

      if (data.is_shuffled !== undefined) {
        if (data.is_shuffled) {
          dispatch(actions.game.shuffleTrue());
        } else {
          dispatch(actions.game.shuffleFalse());
        }
      }

      if (data.has_timer !== undefined) {
        if (data.has_timer) {
          dispatch(actions.game.timerTrue());
        } else {
          dispatch(actions.game.timerFalse());
        }
      }

      if (data.cards && data.cards.length > 0) {
        const formattedCards = data.cards.map((card, index) => ({
          id: `card-${Date.now()}-${index}`,
          term: card.term || '',
          term_image: card.term_image || '',
          definition: card.definition || '',
          definition_image: card.definition_image || '',
          editorOpen: false,
        }));
        dispatch(actions.game.setList(formattedCards));
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
      const imageUrl = response.data?.url;

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

export default StrictDict({
  loadGamesSettings,
  uploadGameImage,
});
