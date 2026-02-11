import { initialState, actions, reducer } from './reducers';

describe('game reducer', () => {
  const mockDate = 1640995200000;
  const mockRandom = 0.123;

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(mockDate);
    jest.spyOn(Math, 'random').mockReturnValue(mockRandom);
  });

  afterEach(() => {
    Date.now.mockRestore();
    Math.random.mockRestore();
  });

  it('has initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  describe('initialState structure', () => {
    it('should have correct default structure', () => {
      expect(initialState).toEqual({
        settings: {
          shuffle: true,
          timer: true,
        },
        type: 'flashcards',
        list: [{
          id: expect.stringMatching(/^card-\d+-\d+$/),
          term: '',
          term_image: '',
          term_image_path: '',
          definition: '',
          definition_image: '',
          definition_image_path: '',
          editorOpen: true,
        }],
        isDirty: false,
      });
    });
  });

  describe('updateSetting action', () => {
    it('should update shuffle setting and set isDirty to true', () => {
      const testState = {
        ...initialState,
        isDirty: false,
      };
      const action = actions.updateSetting({ key: 'shuffle', value: false });
      const result = reducer(testState, action);

      expect(result).toEqual({
        ...testState,
        settings: {
          ...testState.settings,
          shuffle: false,
        },
        isDirty: true,
      });
    });

    it('should update timer setting and set isDirty to true', () => {
      const testState = {
        ...initialState,
        isDirty: false,
      };
      const action = actions.updateSetting({ key: 'timer', value: false });
      const result = reducer(testState, action);

      expect(result).toEqual({
        ...testState,
        settings: {
          ...testState.settings,
          timer: false,
        },
        isDirty: true,
      });
    });

    it('should update custom setting', () => {
      const testState = {
        ...initialState,
        settings: { shuffle: true, timer: true },
      };
      const action = actions.updateSetting({ key: 'customSetting', value: 'customValue' });
      const result = reducer(testState, action);

      expect(result.settings).toEqual({
        shuffle: true,
        timer: true,
        customSetting: 'customValue',
      });
      expect(result.isDirty).toBe(true);
    });
  });

  describe('updateCardField action', () => {
    const testState = {
      ...initialState,
      list: [
        {
          id: 'card-1',
          term: 'Original Term',
          term_image: '',
          definition: 'Original Definition',
          definition_image: '',
          editorOpen: true,
        },
        {
          id: 'card-2',
          term: 'Second Term',
          term_image: '',
          definition: 'Second Definition',
          definition_image: '',
          editorOpen: false,
        },
      ],
      isDirty: false,
    };

    it('should update term field and set isDirty to true', () => {
      const action = actions.updateCardField({ index: 0, field: 'term', value: 'Updated Term' });
      const result = reducer(testState, action);

      expect(result.list[0].term).toBe('Updated Term');
      expect(result.list[1]).toEqual(testState.list[1]); // Other cards unchanged
      expect(result.isDirty).toBe(true);
    });

    it('should update definition field', () => {
      const action = actions.updateCardField({ index: 1, field: 'definition', value: 'Updated Definition' });
      const result = reducer(testState, action);

      expect(result.list[1].definition).toBe('Updated Definition');
      expect(result.list[0]).toEqual(testState.list[0]); // Other cards unchanged
    });

    it('should update term_image field', () => {
      const action = actions.updateCardField({ index: 0, field: 'term_image', value: '/media/image.jpg' });
      const result = reducer(testState, action);

      expect(result.list[0].term_image).toBe('/media/image.jpg');
    });

    it('should update definition_image field', () => {
      const action = actions.updateCardField({ index: 1, field: 'definition_image', value: '/media/def.jpg' });
      const result = reducer(testState, action);

      expect(result.list[1].definition_image).toBe('/media/def.jpg');
    });

    it('should update editorOpen field', () => {
      const action = actions.updateCardField({ index: 1, field: 'editorOpen', value: true });
      const result = reducer(testState, action);

      expect(result.list[1].editorOpen).toBe(true);
    });

    it('should return unchanged state for invalid index', () => {
      const action = actions.updateCardField({ index: 99, field: 'term', value: 'Invalid' });
      const result = reducer(testState, action);

      expect(result).toBe(testState);
    });

    it('should return unchanged state for negative index', () => {
      const action = actions.updateCardField({ index: -1, field: 'term', value: 'Invalid' });
      const result = reducer(testState, action);

      expect(result).toBe(testState);
    });
  });

  describe('setList action', () => {
    it('should replace entire list and set isDirty to true', () => {
      const newList = [
        {
          id: 'new-card-1',
          term: 'New Term 1',
          term_image: '/media/new1.jpg',
          definition: 'New Definition 1',
          definition_image: '',
          editorOpen: true,
        },
        {
          id: 'new-card-2',
          term: 'New Term 2',
          term_image: '',
          definition: 'New Definition 2',
          definition_image: '/media/new2.jpg',
          editorOpen: false,
        },
      ];
      const action = actions.setList(newList);
      const result = reducer(initialState, action);

      expect(result.list).toEqual(newList);
      expect(result.isDirty).toBe(true);
    });

    it('should set empty list', () => {
      const action = actions.setList([]);
      const result = reducer(initialState, action);

      expect(result.list).toEqual([]);
      expect(result.isDirty).toBe(true);
    });
  });

  describe('addCard action', () => {
    it('should add new card with generated ID and set isDirty to true', () => {
      const testState = {
        ...initialState,
        list: [{ id: 'existing-card', term: 'Existing', definition: 'Card' }],
        isDirty: false,
      };
      const action = actions.addCard();
      const result = reducer(testState, action);

      expect(result.list).toHaveLength(2);
      expect(result.list[0]).toEqual(testState.list[0]); // Original card unchanged
      expect(result.list[1]).toEqual({
        id: `card-${mockDate}-${Math.floor(mockRandom * 100000)}`,
        term: '',
        term_image: '',
        term_image_path: '',
        definition: '',
        definition_image: '',
        definition_image_path: '',
        editorOpen: true,
      });
      expect(result.isDirty).toBe(true);
    });
  });

  describe('removeCard action', () => {
    const testState = {
      ...initialState,
      list: [
        { id: 'card-1', term: 'Term 1', definition: 'Definition 1' },
        { id: 'card-2', term: 'Term 2', definition: 'Definition 2' },
        { id: 'card-3', term: 'Term 3', definition: 'Definition 3' },
      ],
      isDirty: false,
    };

    it('should remove card at specified index and set isDirty to true', () => {
      const action = actions.removeCard({ index: 1 });
      const result = reducer(testState, action);

      expect(result.list).toHaveLength(2);
      expect(result.list[0]).toEqual(testState.list[0]);
      expect(result.list[1]).toEqual(testState.list[2]);
      expect(result.isDirty).toBe(true);
    });

    it('should remove first card', () => {
      const action = actions.removeCard({ index: 0 });
      const result = reducer(testState, action);

      expect(result.list).toHaveLength(2);
      expect(result.list[0]).toEqual(testState.list[1]);
      expect(result.list[1]).toEqual(testState.list[2]);
    });

    it('should remove last card', () => {
      const action = actions.removeCard({ index: 2 });
      const result = reducer(testState, action);

      expect(result.list).toHaveLength(2);
      expect(result.list[0]).toEqual(testState.list[0]);
      expect(result.list[1]).toEqual(testState.list[1]);
    });

    it('should return unchanged state for invalid index', () => {
      const action = actions.removeCard({ index: 99 });
      const result = reducer(testState, action);

      expect(result).toBe(testState);
    });

    it('should return unchanged state for negative index', () => {
      const action = actions.removeCard({ index: -1 });
      const result = reducer(testState, action);

      expect(result).toBe(testState);
    });
  });

  describe('setDirty action', () => {
    it('should set isDirty to true', () => {
      const testState = { ...initialState, isDirty: false };
      const action = actions.setDirty(true);
      const result = reducer(testState, action);

      expect(result.isDirty).toBe(true);
    });

    it('should set isDirty to false', () => {
      const testState = { ...initialState, isDirty: true };
      const action = actions.setDirty(false);
      const result = reducer(testState, action);

      expect(result.isDirty).toBe(false);
    });
  });

  describe('backward compatible action creators', () => {
    it('should have setShuffleStatus action creator', () => {
      const action = actions.setShuffleStatus(false);
      expect(action).toEqual({
        type: 'game/updateSetting',
        payload: { key: 'shuffle', value: false },
      });
    });

    it('should have setTimerStatus action creator', () => {
      const action = actions.setTimerStatus(false);
      expect(action).toEqual({
        type: 'game/updateSetting',
        payload: { key: 'timer', value: false },
      });
    });

    it('should have updateTerm action creator', () => {
      const action = actions.updateTerm({ index: 1, term: 'New Term' });
      expect(action).toEqual({
        type: 'game/updateCardField',
        payload: { index: 1, field: 'term', value: 'New Term' },
      });
    });

    it('should have updateTermImage action creator', () => {
      const action = actions.updateTermImage({ index: 0, termImage: '/media/image.jpg' });
      expect(action).toEqual({
        type: 'game/updateCardField',
        payload: { index: 0, field: 'term_image', value: '/media/image.jpg' },
      });
    });

    it('should have updateDefinition action creator', () => {
      const action = actions.updateDefinition({ index: 2, definition: 'New Definition' });
      expect(action).toEqual({
        type: 'game/updateCardField',
        payload: { index: 2, field: 'definition', value: 'New Definition' },
      });
    });

    it('should have updateDefinitionImage action creator', () => {
      const action = actions.updateDefinitionImage({ index: 1, definitionImage: '/media/def.jpg' });
      expect(action).toEqual({
        type: 'game/updateCardField',
        payload: { index: 1, field: 'definition_image', value: '/media/def.jpg' },
      });
    });

    it('should have toggleOpen action creator that converts to boolean', () => {
      const actionTrue = actions.toggleOpen({ index: 0, isOpen: true });
      expect(actionTrue).toEqual({
        type: 'game/updateCardField',
        payload: { index: 0, field: 'editorOpen', value: true },
      });

      const actionFalse = actions.toggleOpen({ index: 0, isOpen: false });
      expect(actionFalse).toEqual({
        type: 'game/updateCardField',
        payload: { index: 0, field: 'editorOpen', value: false },
      });

      // Test boolean conversion
      const actionTruthy = actions.toggleOpen({ index: 0, isOpen: 'truthy' });
      expect(actionTruthy.payload.value).toBe(true);

      const actionFalsy = actions.toggleOpen({ index: 0, isOpen: 0 });
      expect(actionFalsy.payload.value).toBe(false);
    });
  });

  describe('integration tests with backward compatible actions', () => {
    it('should work with setShuffleStatus', () => {
      const action = actions.setShuffleStatus(false);
      const result = reducer(initialState, action);

      expect(result.settings.shuffle).toBe(false);
      expect(result.isDirty).toBe(true);
    });

    it('should work with updateTerm', () => {
      const action = actions.updateTerm({ index: 0, term: 'Test Term' });
      const result = reducer(initialState, action);

      expect(result.list[0].term).toBe('Test Term');
      expect(result.isDirty).toBe(true);
    });

    it('should work with toggleOpen', () => {
      const action = actions.toggleOpen({ index: 0, isOpen: false });
      const result = reducer(initialState, action);

      expect(result.list[0].editorOpen).toBe(false);
      expect(result.isDirty).toBe(true);
    });
  });
});
