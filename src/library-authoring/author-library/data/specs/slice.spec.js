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
        value: {
          data: [
            blockFactory({ id: 'firstBlock' }, { library }),
            blockFactory({ id: 'deletedBlock' }, { library }),
            blockFactory({ id: 'lastBlock' }, { library }),
          ],
          count: 3,
        },
        status: LOADING_STATUS.FAILED,
      },
    };
    reducers.libraryAuthoringBlockDeleted(state, { payload: { blockId: 'deletedBlock' } });
    expect(state.blocks.value.data.length).toBe(2);
    expect(state.blocks.value.data[0].id).toEqual('firstBlock');
    expect(state.blocks.value.data[1].id).toEqual('lastBlock');
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

  it('Updates the display name of an XBlock', () => {
    const state = { blocks: { value: { data: [{ id: 'blockone', display_name: 'im a display name' }] } } };
    reducers.libraryBlockUpdateDisplayName(state, {
      payload: { blockId: 'blockone', displayName: 'new display name' },
    });
    expect(state.blocks.value.data[0].display_name).toEqual('new display name');
  });
});
