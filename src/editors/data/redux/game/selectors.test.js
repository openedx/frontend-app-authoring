import * as selectors from './selectors';

describe('game selectors', () => {
  const mockGameState = {
    settings: {
      shuffle: true,
      timer: false,
    },
    type: 'flashcards',
    list: [
      {
        id: 'card-1',
        term: 'Term 1',
        term_image: '/media/term1.jpg',
        definition: 'Definition 1',
        definition_image: '',
        editorOpen: true,
      },
      {
        id: 'card-2',
        term: 'Term 2',
        term_image: '',
        definition: 'Definition 2',
        definition_image: '/media/def2.jpg',
        editorOpen: false,
      },
    ],
    isDirty: true,
  };

  const mockState = {
    game: mockGameState,
    otherSlice: {
      someData: 'test',
    },
  };

  describe('gameState selector', () => {
    it('should return the game state slice', () => {
      expect(selectors.gameState(mockState)).toBe(mockGameState);
    });

    it('should return undefined for missing game state', () => {
      expect(selectors.gameState({})).toBeUndefined();
    });
  });

  describe('simpleSelectors', () => {
    describe('settings selector', () => {
      it('should return settings object', () => {
        const result = selectors.simpleSelectors.settings(mockState);
        expect(result).toEqual({
          shuffle: true,
          timer: false,
        });
        expect(result).toBe(mockGameState.settings);
      });

      it('should return undefined when game state is missing', () => {
        expect(() => selectors.simpleSelectors.settings({})).toThrow();
      });
    });

    describe('type selector', () => {
      it('should return game type', () => {
        const result = selectors.simpleSelectors.type(mockState);
        expect(result).toBe('flashcards');
      });

      it('should work with different game types', () => {
        const stateWithMatching = {
          game: {
            ...mockGameState,
            type: 'matching',
          },
        };
        const result = selectors.simpleSelectors.type(stateWithMatching);
        expect(result).toBe('matching');
      });
    });

    describe('list selector', () => {
      it('should return cards list', () => {
        const result = selectors.simpleSelectors.list(mockState);
        expect(result).toEqual(mockGameState.list);
        expect(result).toBe(mockGameState.list);
      });

      it('should return empty array when list is empty', () => {
        const stateWithEmptyList = {
          game: {
            ...mockGameState,
            list: [],
          },
        };
        const result = selectors.simpleSelectors.list(stateWithEmptyList);
        expect(result).toEqual([]);
      });
    });

    describe('isDirty selector', () => {
      it('should return isDirty status when true', () => {
        const result = selectors.simpleSelectors.isDirty(mockState);
        expect(result).toBe(true);
      });

      it('should return isDirty status when false', () => {
        const stateWithCleanFlag = {
          game: {
            ...mockGameState,
            isDirty: false,
          },
        };
        const result = selectors.simpleSelectors.isDirty(stateWithCleanFlag);
        expect(result).toBe(false);
      });
    });

    describe('completeState selector', () => {
      it('should return entire game state', () => {
        const result = selectors.simpleSelectors.completeState(mockState);
        expect(result).toEqual(mockGameState);
        expect(result).toBe(mockGameState);
      });
    });
  });

  describe('default export selectors', () => {
    it('should include all simpleSelectors', () => {
      expect(selectors.default.settings).toBe(selectors.simpleSelectors.settings);
      expect(selectors.default.type).toBe(selectors.simpleSelectors.type);
      expect(selectors.default.list).toBe(selectors.simpleSelectors.list);
      expect(selectors.default.isDirty).toBe(selectors.simpleSelectors.isDirty);
      expect(selectors.default.completeState).toBe(selectors.simpleSelectors.completeState);
    });

    it('should work when accessed through default export', () => {
      expect(selectors.default.settings(mockState)).toEqual(mockGameState.settings);
      expect(selectors.default.type(mockState)).toBe('flashcards');
      expect(selectors.default.list(mockState)).toEqual(mockGameState.list);
      expect(selectors.default.isDirty(mockState)).toBe(true);
      expect(selectors.default.completeState(mockState)).toEqual(mockGameState);
    });
  });

  describe('selector memoization', () => {
    it('should return same reference for same input', () => {
      const result1 = selectors.simpleSelectors.settings(mockState);
      const result2 = selectors.simpleSelectors.settings(mockState);
      expect(result1).toBe(result2);
    });

    it('should return new reference when game state changes', () => {
      const modifiedState = {
        game: {
          ...mockGameState,
          settings: {
            shuffle: false,
            timer: true,
          },
        },
      };

      const result1 = selectors.simpleSelectors.settings(mockState);
      const result2 = selectors.simpleSelectors.settings(modifiedState);
      expect(result1).not.toBe(result2);
      expect(result1).toEqual({ shuffle: true, timer: false });
      expect(result2).toEqual({ shuffle: false, timer: true });
    });

    it('should not recompute when unrelated state changes', () => {
      const stateWithModifiedOtherSlice = {
        ...mockState,
        otherSlice: {
          someData: 'modified',
        },
      };

      const result1 = selectors.simpleSelectors.settings(mockState);
      const result2 = selectors.simpleSelectors.settings(stateWithModifiedOtherSlice);
      expect(result1).toBe(result2); // Same reference due to memoization
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle state with null game slice', () => {
      const stateWithNullGame = { game: null };
      expect(() => selectors.simpleSelectors.settings(stateWithNullGame)).toThrow();
    });

    it('should handle partially populated game state', () => {
      const partialGameState = {
        game: {
          settings: { shuffle: true },
          // Missing other properties
        },
      };

      expect(selectors.simpleSelectors.settings(partialGameState)).toEqual({ shuffle: true });
      expect(selectors.simpleSelectors.type(partialGameState)).toBeUndefined();
      expect(selectors.simpleSelectors.list(partialGameState)).toBeUndefined();
      expect(selectors.simpleSelectors.isDirty(partialGameState)).toBeUndefined();
    });

    it('should handle empty game state', () => {
      const emptyGameState = { game: {} };

      expect(selectors.simpleSelectors.settings(emptyGameState)).toBeUndefined();
      expect(selectors.simpleSelectors.type(emptyGameState)).toBeUndefined();
      expect(selectors.simpleSelectors.list(emptyGameState)).toBeUndefined();
      expect(selectors.simpleSelectors.isDirty(emptyGameState)).toBeUndefined();
      expect(selectors.simpleSelectors.completeState(emptyGameState)).toEqual({});
    });
  });

  describe('real-world scenarios', () => {
    it('should work with initial state structure', () => {
      const initialStateShape = {
        game: {
          settings: { shuffle: true, timer: true },
          type: 'flashcards',
          list: [{
            id: 'card-123-456',
            term: '',
            term_image: '',
            definition: '',
            definition_image: '',
            editorOpen: true,
          }],
          isDirty: false,
        },
      };

      expect(selectors.simpleSelectors.settings(initialStateShape)).toEqual({
        shuffle: true,
        timer: true,
      });
      expect(selectors.simpleSelectors.type(initialStateShape)).toBe('flashcards');
      expect(selectors.simpleSelectors.list(initialStateShape)).toHaveLength(1);
      expect(selectors.simpleSelectors.isDirty(initialStateShape)).toBe(false);
    });

    it('should work with large card lists', () => {
      const largeCardList = Array.from({ length: 100 }, (_, index) => ({
        id: `card-${index}`,
        term: `Term ${index}`,
        term_image: '',
        definition: `Definition ${index}`,
        definition_image: '',
        editorOpen: index % 2 === 0, // Alternate between open/closed
      }));

      const stateWithLargeList = {
        game: {
          ...mockGameState,
          list: largeCardList,
        },
      };

      const result = selectors.simpleSelectors.list(stateWithLargeList);
      expect(result).toHaveLength(100);
      expect(result[0].term).toBe('Term 0');
      expect(result[99].term).toBe('Term 99');
      expect(result).toBe(largeCardList); // Reference equality
    });
  });
});
