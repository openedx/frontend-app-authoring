import { getConfig } from '@edx/frontend-platform';
import { loadGamesSettings, uploadGameImage, deleteGameImage } from './game';
import * as requests from './requests';
import { actions as gameActions } from '../game';
import { actions as requestsActions } from '../requests';
import { RequestKeys } from '../../constants/requests';

// Mock the config
jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(() => ({
    STUDIO_BASE_URL: 'http://localhost:18010',
  })),
}));

// Mock the requests module
jest.mock('./requests', () => ({
  getGamesSettings: jest.fn(),
  uploadGamesImage: jest.fn(),
  deleteGamesImage: jest.fn(),
}));

// Mock the action modules
jest.mock('../game', () => ({
  actions: {
    updateType: jest.fn(),
    setShuffleStatus: jest.fn(),
    setTimerStatus: jest.fn(),
    setList: jest.fn(),
    updateTermImage: jest.fn(),
    updateDefinitionImage: jest.fn(),
    updateTermImagePath: jest.fn(),
    updateDefinitionImagePath: jest.fn(),
  },
}));

jest.mock('../requests', () => ({
  actions: {
    failRequest: jest.fn(),
  },
}));

describe('game thunkActions', () => {
  let dispatch;
  const mockDate = 1640995200000; // Fixed timestamp for consistent testing

  beforeEach(() => {
    dispatch = jest.fn();
    jest.clearAllMocks();
    // Mock Date.now() for consistent test results
    jest.spyOn(Date, 'now').mockReturnValue(mockDate);
  });

  afterEach(() => {
    Date.now.mockRestore();
  });

  describe('loadGamesSettings', () => {
    const mockResponse = {
      data: {
        game_type: 'flashcards',
        is_shuffled: true,
        has_timer: false,
        cards: [
          {
            term: 'Test Term 1',
            term_image: '/media/term1.jpg',
            definition: 'Test Definition 1',
            definition_image: '',
          },
          {
            term: 'Test Term 2',
            term_image: '',
            definition: 'Test Definition 2',
            definition_image: '/media/def2.jpg',
          },
        ],
      },
    };

    beforeEach(() => {
      requests.getGamesSettings.mockImplementation(({ onSuccess }) => {
        const mockFn = jest.fn(() => onSuccess && onSuccess(mockResponse));
        return mockFn;
      });
    });

    it('should dispatch getGamesSettings request', () => {
      loadGamesSettings()(dispatch);

      expect(requests.getGamesSettings).toHaveBeenCalledWith({
        onSuccess: expect.any(Function),
        onFailure: expect.any(Function),
      });
    });

    describe('on successful response', () => {
      it('should dispatch updateType when game_type is provided', () => {
        const mockOnSuccess = jest.fn();
        requests.getGamesSettings.mockImplementation(({ onSuccess }) => {
          mockOnSuccess.mockImplementation(onSuccess);
          return jest.fn();
        });

        loadGamesSettings()(dispatch);
        mockOnSuccess(mockResponse);

        expect(gameActions.updateType).toHaveBeenCalledWith('flashcards');
        expect(dispatch).toHaveBeenCalledWith(gameActions.updateType('flashcards'));
      });

      it('should dispatch setShuffleStatus when is_shuffled is true', () => {
        const mockOnSuccess = jest.fn();
        requests.getGamesSettings.mockImplementation(({ onSuccess }) => {
          mockOnSuccess.mockImplementation(onSuccess);
          return jest.fn();
        });

        loadGamesSettings()(dispatch);
        mockOnSuccess(mockResponse);

        expect(gameActions.setShuffleStatus).toHaveBeenCalledWith(true);
        expect(dispatch).toHaveBeenCalledWith(gameActions.setShuffleStatus(true));
      });

      it('should dispatch setShuffleStatus when is_shuffled is false', () => {
        const responseWithShuffleFalse = {
          ...mockResponse,
          data: { ...mockResponse.data, is_shuffled: false },
        };
        const mockOnSuccess = jest.fn();
        requests.getGamesSettings.mockImplementation(({ onSuccess }) => {
          mockOnSuccess.mockImplementation(onSuccess);
          return jest.fn();
        });

        loadGamesSettings()(dispatch);
        mockOnSuccess(responseWithShuffleFalse);

        expect(gameActions.setShuffleStatus).toHaveBeenCalledWith(false);
        expect(dispatch).toHaveBeenCalledWith(gameActions.setShuffleStatus(false));
      });

      it('should dispatch setTimerStatus when has_timer is true', () => {
        const responseWithTimerTrue = {
          ...mockResponse,
          data: { ...mockResponse.data, has_timer: true },
        };
        const mockOnSuccess = jest.fn();
        requests.getGamesSettings.mockImplementation(({ onSuccess }) => {
          mockOnSuccess.mockImplementation(onSuccess);
          return jest.fn();
        });

        loadGamesSettings()(dispatch);
        mockOnSuccess(responseWithTimerTrue);

        expect(gameActions.setTimerStatus).toHaveBeenCalledWith(true);
        expect(dispatch).toHaveBeenCalledWith(gameActions.setTimerStatus(true));
      });

      it('should dispatch setTimerStatus when has_timer is false', () => {
        const mockOnSuccess = jest.fn();
        requests.getGamesSettings.mockImplementation(({ onSuccess }) => {
          mockOnSuccess.mockImplementation(onSuccess);
          return jest.fn();
        });

        loadGamesSettings()(dispatch);
        mockOnSuccess(mockResponse);

        expect(gameActions.setTimerStatus).toHaveBeenCalledWith(false);
        expect(dispatch).toHaveBeenCalledWith(gameActions.setTimerStatus(false));
      });

      it('should dispatch setList with formatted cards when cards are provided', () => {
        const mockOnSuccess = jest.fn();
        requests.getGamesSettings.mockImplementation(({ onSuccess }) => {
          mockOnSuccess.mockImplementation(onSuccess);
          return jest.fn();
        });

        const expectedFormattedCards = [
          {
            id: `card-${mockDate}-0`,
            term: 'Test Term 1',
            term_image: '/media/term1.jpg',
            term_image_path: '',
            term_image_alt: '',
            definition: 'Test Definition 1',
            definition_image: '',
            definition_image_path: '',
            definition_image_alt: '',
            editorOpen: true,
          },
          {
            id: `card-${mockDate}-1`,
            term: 'Test Term 2',
            term_image: '',
            term_image_path: '',
            term_image_alt: '',
            definition: 'Test Definition 2',
            definition_image: '/media/def2.jpg',
            definition_image_path: '',
            definition_image_alt: '',
            editorOpen: true,
          },
        ];

        loadGamesSettings()(dispatch);
        mockOnSuccess(mockResponse);

        expect(gameActions.setList).toHaveBeenCalledWith(expectedFormattedCards);
        expect(dispatch).toHaveBeenCalledWith(gameActions.setList(expectedFormattedCards));
      });

      it('should handle cards with missing properties', () => {
        const responseWithIncompleteCards = {
          data: {
            cards: [
              { term: 'Term Only' },
              { definition: 'Definition Only' },
              {},
            ],
          },
        };
        const mockOnSuccess = jest.fn();
        requests.getGamesSettings.mockImplementation(({ onSuccess }) => {
          mockOnSuccess.mockImplementation(onSuccess);
          return jest.fn();
        });

        const expectedFormattedCards = [
          {
            id: `card-${mockDate}-0`,
            term: 'Term Only',
            term_image: '',
            term_image_path: '',
            term_image_alt: '',
            definition: '',
            definition_image: '',
            definition_image_path: '',
            definition_image_alt: '',
            editorOpen: true,
          },
          {
            id: `card-${mockDate}-1`,
            term: '',
            term_image: '',
            term_image_path: '',
            term_image_alt: '',
            definition: 'Definition Only',
            definition_image: '',
            definition_image_path: '',
            definition_image_alt: '',
            editorOpen: true,
          },
          {
            id: `card-${mockDate}-2`,
            term: '',
            term_image: '',
            term_image_path: '',
            term_image_alt: '',
            definition: '',
            definition_image: '',
            definition_image_path: '',
            definition_image_alt: '',
            editorOpen: true,
          },
        ];

        loadGamesSettings()(dispatch);
        mockOnSuccess(responseWithIncompleteCards);

        expect(gameActions.setList).toHaveBeenCalledWith(expectedFormattedCards);
      });

      it('should dispatch actions with default values when response data is empty', () => {
        const emptyResponse = { data: {} };
        const mockOnSuccess = jest.fn();
        requests.getGamesSettings.mockImplementation(({ onSuccess }) => {
          mockOnSuccess.mockImplementation(onSuccess);
          return jest.fn();
        });

        const expectedEmptyCard = [{
          id: `card-${mockDate}-0`,
          term: '',
          term_image: '',
          term_image_path: '',
          term_image_alt: '',
          definition: '',
          definition_image: '',
          definition_image_path: '',
          definition_image_alt: '',
          editorOpen: true,
        }];

        loadGamesSettings()(dispatch);
        mockOnSuccess(emptyResponse);

        expect(gameActions.updateType).toHaveBeenCalledWith('matching');
        expect(gameActions.setShuffleStatus).toHaveBeenCalledWith(true);
        expect(gameActions.setTimerStatus).toHaveBeenCalledWith(true);
        expect(gameActions.setList).toHaveBeenCalledWith(expectedEmptyCard);
      });
    });

    describe('on failure', () => {
      it('should dispatch failRequest with error', () => {
        const mockError = new Error('Network error');
        const mockOnFailure = jest.fn();
        requests.getGamesSettings.mockImplementation(({ onFailure }) => {
          mockOnFailure.mockImplementation(onFailure);
          return jest.fn();
        });

        loadGamesSettings()(dispatch);
        mockOnFailure(mockError);

        expect(requestsActions.failRequest).toHaveBeenCalledWith({
          requestKey: RequestKeys.fetchBlock,
          error: mockError,
        });
        expect(dispatch).toHaveBeenCalledWith(
          requestsActions.failRequest({
            requestKey: RequestKeys.fetchBlock,
            error: mockError,
          }),
        );
      });
    });
  });

  describe('uploadGameImage', () => {
    const mockParams = {
      index: 0,
      imageFile: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
      imageType: 'term',
    };

    const mockSuccessResponse = {
      data: {
        success: true,
        url: '/media/games/uploaded-image.jpg',
        filename: 'uploaded-image.jpg',
      },
    };

    beforeEach(() => {
      requests.uploadGamesImage.mockImplementation(({ onSuccess }) => {
        const mockFn = jest.fn(() => onSuccess && onSuccess(mockSuccessResponse));
        return mockFn;
      });
    });

    it('should dispatch uploadGamesImage request with correct parameters', () => {
      uploadGameImage(mockParams)(dispatch);

      expect(requests.uploadGamesImage).toHaveBeenCalledWith({
        image: mockParams.imageFile,
        onSuccess: expect.any(Function),
        onFailure: expect.any(Function),
      });
    });

    describe('on successful upload', () => {
      it('should dispatch updateTermImage when imageType is term', () => {
        const mockOnSuccess = jest.fn();
        requests.uploadGamesImage.mockImplementation(({ onSuccess }) => {
          mockOnSuccess.mockImplementation(onSuccess);
          return jest.fn();
        });

        uploadGameImage(mockParams)(dispatch);
        mockOnSuccess(mockSuccessResponse);

        expect(gameActions.updateTermImage).toHaveBeenCalledWith({
          index: 0,
          termImage: `${getConfig().STUDIO_BASE_URL}/media/games/uploaded-image.jpg`,
        });
        expect(dispatch).toHaveBeenCalledWith(
          gameActions.updateTermImage({
            index: 0,
            termImage: `${getConfig().STUDIO_BASE_URL}/media/games/uploaded-image.jpg`,
          }),
        );
      });

      it('should dispatch updateDefinitionImage when imageType is definition', () => {
        const definitionParams = { ...mockParams, imageType: 'definition' };
        requests.uploadGamesImage.mockImplementation(({ onSuccess }) => {
          // Immediately call onSuccess to ensure code coverage
          onSuccess(mockSuccessResponse);
          return jest.fn();
        });

        uploadGameImage(definitionParams)(dispatch);

        expect(gameActions.updateDefinitionImage).toHaveBeenCalledWith({
          index: 0,
          definitionImage: `${getConfig().STUDIO_BASE_URL}/media/games/uploaded-image.jpg`,
        });
        expect(dispatch).toHaveBeenCalledWith(
          gameActions.updateDefinitionImage({
            index: 0,
            definitionImage: `${getConfig().STUDIO_BASE_URL}/media/games/uploaded-image.jpg`,
          }),
        );
      });

      it('should handle response without url gracefully', () => {
        const responseWithoutUrl = { data: { success: true } };
        const mockOnSuccess = jest.fn();
        requests.uploadGamesImage.mockImplementation(({ onSuccess }) => {
          mockOnSuccess.mockImplementation(onSuccess);
          return jest.fn();
        });

        uploadGameImage(mockParams)(dispatch);
        mockOnSuccess(responseWithoutUrl);

        expect(gameActions.updateTermImage).toHaveBeenCalledWith({
          index: 0,
          termImage: undefined,
        });
      });

      it('should handle definition image with full HTTP URL without prepending STUDIO_BASE_URL', () => {
        const definitionParams = { ...mockParams, imageType: 'definition' };
        const responseWithFullUrl = {
          data: {
            success: true,
            url: 'https://s3.amazonaws.com/games/uploaded-image.jpg',
          },
        };
        const mockOnSuccess = jest.fn();
        requests.uploadGamesImage.mockImplementation(({ onSuccess }) => {
          mockOnSuccess.mockImplementation(onSuccess);
          return jest.fn();
        });

        uploadGameImage(definitionParams)(dispatch);
        mockOnSuccess(responseWithFullUrl);

        expect(gameActions.updateDefinitionImage).toHaveBeenCalledWith({
          index: 0,
          definitionImage: 'https://s3.amazonaws.com/games/uploaded-image.jpg',
        });
        expect(dispatch).toHaveBeenCalledWith(
          gameActions.updateDefinitionImage({
            index: 0,
            definitionImage: 'https://s3.amazonaws.com/games/uploaded-image.jpg',
          }),
        );
      });

      it('should prepend STUDIO_BASE_URL for definition image with relative path', () => {
        const definitionParams = { ...mockParams, imageType: 'definition' };
        const relativeUrlResponse = {
          data: {
            success: true,
            url: '/media/games/definition-image.jpg',
          },
        };
        const mockOnSuccess = jest.fn();
        requests.uploadGamesImage.mockImplementation(({ onSuccess }) => {
          mockOnSuccess.mockImplementation(onSuccess);
          return jest.fn();
        });

        uploadGameImage(definitionParams)(dispatch);
        mockOnSuccess(relativeUrlResponse);

        expect(gameActions.updateDefinitionImage).toHaveBeenCalledWith({
          index: 0,
          definitionImage: `${getConfig().STUDIO_BASE_URL}/media/games/definition-image.jpg`,
        });
        expect(dispatch).toHaveBeenCalledWith(
          gameActions.updateDefinitionImage({
            index: 0,
            definitionImage: `${getConfig().STUDIO_BASE_URL}/media/games/definition-image.jpg`,
          }),
        );
      });
    });

    describe('on upload failure', () => {
      it('should dispatch failRequest with error', () => {
        const mockError = new Error('Upload failed');
        const mockOnFailure = jest.fn();
        requests.uploadGamesImage.mockImplementation(({ onFailure }) => {
          mockOnFailure.mockImplementation(onFailure);
          return jest.fn();
        });

        uploadGameImage(mockParams)(dispatch);
        mockOnFailure(mockError);

        expect(requestsActions.failRequest).toHaveBeenCalledWith({
          requestKey: RequestKeys.uploadAsset,
          error: mockError,
        });
        expect(dispatch).toHaveBeenCalledWith(
          requestsActions.failRequest({
            requestKey: RequestKeys.uploadAsset,
            error: mockError,
          }),
        );
      });
    });
  });

  describe('deleteGameImage', () => {
    const mockParams = {
      index: 1,
      imageType: 'term',
      filePath: '/media/games/image-to-delete.jpg',
    };

    describe('when filePath is provided', () => {
      const mockSuccessResponse = {
        data: {
          success: true,
        },
      };

      beforeEach(() => {
        requests.deleteGamesImage.mockImplementation(({ onSuccess }) => {
          const mockFn = jest.fn(() => onSuccess && onSuccess(mockSuccessResponse));
          return mockFn;
        });
      });

      it('should dispatch deleteGamesImage request with correct parameters', () => {
        deleteGameImage(mockParams)(dispatch);

        expect(requests.deleteGamesImage).toHaveBeenCalledWith({
          key: mockParams.filePath,
          onSuccess: expect.any(Function),
          onFailure: expect.any(Function),
        });
      });

      describe('on successful deletion', () => {
        it('should dispatch updateTermImage with empty string when imageType is term', () => {
          const mockOnSuccess = jest.fn();
          requests.deleteGamesImage.mockImplementation(({ onSuccess }) => {
            mockOnSuccess.mockImplementation(onSuccess);
            return jest.fn();
          });

          deleteGameImage(mockParams)(dispatch);
          mockOnSuccess(mockSuccessResponse);

          expect(gameActions.updateTermImage).toHaveBeenCalledWith({
            index: 1,
            termImage: '',
          });
          expect(dispatch).toHaveBeenCalledWith(
            gameActions.updateTermImage({
              index: 1,
              termImage: '',
            }),
          );
        });

        it('should dispatch updateDefinitionImage with empty string when imageType is definition', () => {
          const definitionParams = { ...mockParams, imageType: 'definition' };
          requests.deleteGamesImage.mockImplementation(({ onSuccess }) => {
            // Immediately call onSuccess to ensure code coverage
            onSuccess(mockSuccessResponse);
            return jest.fn();
          });

          deleteGameImage(definitionParams)(dispatch);

          expect(gameActions.updateDefinitionImage).toHaveBeenCalledWith({
            index: 1,
            definitionImage: '',
          });
          expect(dispatch).toHaveBeenCalledWith(
            gameActions.updateDefinitionImage({
              index: 1,
              definitionImage: '',
            }),
          );
        });

        it('should handle deletion failure response', () => {
          const failureResponse = {
            data: {
              success: false,
              error: 'File not found',
            },
          };
          const mockOnSuccess = jest.fn();
          requests.deleteGamesImage.mockImplementation(({ onSuccess }) => {
            mockOnSuccess.mockImplementation(onSuccess);
            return jest.fn();
          });

          deleteGameImage(mockParams)(dispatch);
          mockOnSuccess(failureResponse);

          expect(requestsActions.failRequest).toHaveBeenCalledWith({
            requestKey: RequestKeys.deleteAsset,
            error: 'File not found',
          });
          expect(dispatch).toHaveBeenCalledWith(
            requestsActions.failRequest({
              requestKey: RequestKeys.deleteAsset,
              error: 'File not found',
            }),
          );
        });
      });

      describe('on deletion API failure', () => {
        it('should dispatch failRequest with error', () => {
          const mockError = new Error('Delete failed');
          const mockOnFailure = jest.fn();
          requests.deleteGamesImage.mockImplementation(({ onFailure }) => {
            mockOnFailure.mockImplementation(onFailure);
            return jest.fn();
          });

          deleteGameImage(mockParams)(dispatch);
          mockOnFailure(mockError);

          expect(requestsActions.failRequest).toHaveBeenCalledWith({
            requestKey: RequestKeys.deleteAsset,
            error: mockError,
          });
          expect(dispatch).toHaveBeenCalledWith(
            requestsActions.failRequest({
              requestKey: RequestKeys.deleteAsset,
              error: mockError,
            }),
          );
        });
      });
    });

    describe('when filePath is not provided', () => {
      const mockParamsWithoutFilePath = {
        index: 1,
        imageType: 'term',
        filePath: '',
      };

      it('should not call deleteGamesImage API', () => {
        deleteGameImage(mockParamsWithoutFilePath)(dispatch);

        expect(requests.deleteGamesImage).not.toHaveBeenCalled();
      });

      it('should directly dispatch updateTermImage with empty string when imageType is term', () => {
        deleteGameImage(mockParamsWithoutFilePath)(dispatch);

        expect(gameActions.updateTermImage).toHaveBeenCalledWith({
          index: 1,
          termImage: '',
        });
        expect(dispatch).toHaveBeenCalledWith(
          gameActions.updateTermImage({
            index: 1,
            termImage: '',
          }),
        );
      });

      it('should directly dispatch updateDefinitionImage with empty string when imageType is definition', () => {
        const paramsWithoutFilePath = {
          ...mockParamsWithoutFilePath,
          imageType: 'definition',
        };

        deleteGameImage(paramsWithoutFilePath)(dispatch);

        expect(gameActions.updateDefinitionImage).toHaveBeenCalledWith({
          index: 1,
          definitionImage: '',
        });
        expect(dispatch).toHaveBeenCalledWith(
          gameActions.updateDefinitionImage({
            index: 1,
            definitionImage: '',
          }),
        );
      });

      it('should handle null filePath', () => {
        const paramsWithNullFilePath = {
          index: 1,
          imageType: 'term',
          filePath: null,
        };

        deleteGameImage(paramsWithNullFilePath)(dispatch);

        expect(requests.deleteGamesImage).not.toHaveBeenCalled();
        expect(gameActions.updateTermImage).toHaveBeenCalledWith({
          index: 1,
          termImage: '',
        });
      });

      it('should handle undefined filePath', () => {
        const paramsWithUndefinedFilePath = {
          index: 1,
          imageType: 'term',
          filePath: undefined,
        };

        deleteGameImage(paramsWithUndefinedFilePath)(dispatch);

        expect(requests.deleteGamesImage).not.toHaveBeenCalled();
        expect(gameActions.updateTermImage).toHaveBeenCalledWith({
          index: 1,
          termImage: '',
        });
      });
    });
  });

  describe('module exports', () => {
    it('should export all thunk actions', () => {
      expect(loadGamesSettings).toEqual(expect.any(Function));
      expect(uploadGameImage).toEqual(expect.any(Function));
      expect(deleteGameImage).toEqual(expect.any(Function));
    });
  });
});
