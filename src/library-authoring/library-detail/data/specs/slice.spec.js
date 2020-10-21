import { baseLibraryDetailReducers as reducers, libraryDetailInitialState } from '../slice';
import { LOADING_STATUS } from '../../../common/data';
import { blockFactory, libraryFactory } from '../../../common/specs/factories';

describe('library detail reducers', () => {
  it('Sets the loading status when sending a request', () => {
    const state = {};
    reducers.libraryDetailRequest(state);
    expect(state.status).toEqual(LOADING_STATUS.LOADING);
  });

  it('loads a library', () => {
    const state = {};
    const library = libraryFactory();
    reducers.libraryDetailSuccess(state, { payload: { library } });
    expect(state.library).toEqual(library);
    expect(state.errorMessage).toBeNull();
    expect(state.status).toBe(LOADING_STATUS.LOADED);
  });

  it('Handles a loading error', () => {
    const state = {};
    reducers.libraryDetailFailed(state, { payload: { errorMessage: 'It borked.' } });
    expect(state.errorMessage).toEqual('It borked.');
  });

  it('Clears the error', () => {
    const state = { errorMessage: 'It borked.' };
    reducers.libraryDetailClearError(state);
    expect(state.errorMessage).toBeNull();
  });

  it('Deletes a block', () => {
    const state = {
      library: libraryFactory({
        blocks: [
          { id: 'firstBlock' }, { id: 'deletedBlock' }, { id: 'lastBlock' },
        ],
      }),
    };
    reducers.libraryDetailBlockDeleted(state, { payload: { blockId: 'deletedBlock' } });
    expect(state.library.blocks.length).toBe(2);
    expect(state.library.blocks[0].id).toEqual('firstBlock');
    expect(state.library.blocks[1].id).toEqual('lastBlock');
  });

  it('Adds a block to the block list', () => {
    const library = libraryFactory({
      blocks: [{ id: 'firstBlock' }],
      has_unpublished_changes: false,
    });
    const state = { library };
    reducers.libraryCreateBlockSuccess(
      state,
      { payload: { libraryBlock: blockFactory({ id: 'test' }, { library }) } },
    );
    expect(state.library.blocks.length).toEqual(2);
    expect(state.library.blocks[0].id).toEqual('firstBlock');
    expect(state.library.blocks[1].id).toEqual('test');
    expect(state.library.has_unpublished_changes).toBe(true);
    expect(state.status).toEqual(LOADING_STATUS.LOADED);
  });

  it('Resets the library detail settings', () => {
    const state = { library: libraryFactory() };
    reducers.libraryDetailReset(state);
    expect(state).toEqual(libraryDetailInitialState);
  });

  it('Handles the failed creation of an XBlock', () => {
    const state = {};
    reducers.libraryCreateBlockFailed(state, {
      payload: { errorMessage: 'Boop', errorFields: { block_type: ['Not cool enough.'] } },
    });
    expect(state.status).toBe(LOADING_STATUS.FAILED);
    expect(state.errorMessage).toEqual('Boop');
    expect(state.errorFields).toEqual({ block_type: ['Not cool enough.'] });
  });
});
