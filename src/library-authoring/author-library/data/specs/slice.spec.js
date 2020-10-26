import { baseLibraryDetailReducers as reducers, libraryAuthoringInitialState } from '../slice';
import { LOADING_STATUS } from '../../../common/data';
import { blockFactory, libraryFactory } from '../../../common/specs/factories';

describe('library detail reducers', () => {
  it('Sets the loading status when sending a request', () => {
    const state = { blocks: {} };
    reducers.libraryAuthoringRequest(state, { payload: { attr: 'blocks' } });
    expect(state.blocks.status).toEqual(LOADING_STATUS.LOADING);
  });

  it('loads a library', () => {
    const state = { library: {} };
    const library = libraryFactory();
    reducers.libraryAuthoringSuccess(state, { payload: { value: library, attr: 'library' } });
    expect(state.library).toEqual({ value: library, status: LOADING_STATUS.LOADED });
  });

  it('Handles a loading error', () => {
    const state = { blocks: { value: null, status: LOADING_STATUS.LOADING } };
    reducers.libraryAuthoringFailed(state, {
      payload: {
        errorMessage: 'It borked.', attr: 'blocks', errorFields: { stuff: 'things' },
      },
    });
    expect(state.errorMessage).toEqual('It borked.');
    expect(state.errorMessage).toEqual('It borked.');
    expect(state.blocks.status).toEqual(LOADING_STATUS.FAILED);
  });

  it('Clears the error', () => {
    const state = { errorMessage: 'It borked.' };
    reducers.libraryAuthoringClearError(state);
    expect(state.errorMessage).toBeNull();
  });

  it('Deletes a block', () => {
    const library = libraryFactory();
    const state = {
      library: { value: library, status: LOADING_STATUS.LOADED },
      blocks: {
        value: [
          blockFactory({ id: 'firstBlock' }, { library }),
          blockFactory({ id: 'deletedBlock' }, { library }),
          blockFactory({ id: 'lastBlock' }, { library }),
        ],
        status: LOADING_STATUS.FAILED,
      },
    };
    reducers.libraryAuthoringBlockDeleted(state, { payload: { blockId: 'deletedBlock' } });
    expect(state.blocks.value.length).toBe(2);
    expect(state.blocks.value[0].id).toEqual('firstBlock');
    expect(state.blocks.value[1].id).toEqual('lastBlock');
  });

  it('Adds a block to the block list', () => {
    const library = libraryFactory({
      has_unpublished_changes: false,
    });
    const state = {
      library: { value: library, status: LOADING_STATUS.LOADING },
      blocks: { value: [blockFactory({ id: 'firstBlock' })], status: LOADING_STATUS.LOADED },
    };
    reducers.libraryCreateBlockSuccess(
      state,
      { payload: { libraryBlock: blockFactory({ id: 'test' }, { library }) } },
    );
    expect(state.blocks.value.length).toEqual(2);
    expect(state.blocks.value[0].id).toEqual('firstBlock');
    expect(state.blocks.value[1].id).toEqual('test');
    expect(state.library.value.has_unpublished_changes).toBe(true);
    expect(state.blocks.status).toEqual(LOADING_STATUS.LOADED);
  });

  it('Resets the library detail settings', () => {
    const state = { library: libraryFactory() };
    reducers.libraryAuthoringReset(state);
    expect(state).toEqual(libraryAuthoringInitialState);
  });

  it('Handles the failed creation of an XBlock', () => {
    const state = { blocks: { status: LOADING_STATUS.LOADED } };
    reducers.libraryCreateBlockFailed(state, {
      payload: { errorMessage: 'Boop', errorFields: { block_type: ['Not cool enough.'] } },
    });
    expect(state.blocks.status).toBe(LOADING_STATUS.FAILED);
    expect(state.errorMessage).toEqual('Boop');
    expect(state.errorFields).toEqual({ block_type: ['Not cool enough.'] });
  });
});
