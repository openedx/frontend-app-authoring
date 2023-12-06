import { LOADING_STATUS } from '@src/library-authoring/common/data';
import { libraryBlockReducers as reducers, libraryBlockInitialState } from '../slice';

describe('edit block reducers', () => {
  it('initiates the library block given a block id', () => {
    const state = { blocks: {} };
    const payload = { blockId: 'testID' };
    reducers.libraryEnsureBlock(state, { payload });
    expect(state).toEqual({
      blocks: { testID: libraryBlockInitialState },
    });
  });

  it('sets the focused block', () => {
    const state = { focusedBlock: {} };
    const payload = { blockId: 'testID' };
    reducers.libraryFocusBlock(state, { payload });
    expect(state).toEqual({ focusedBlock: 'testID' });
  });

  it('sets the standby status when queued', () => {
    const state = { blocks: { testID: { view: { status: null } } } };
    const payload = { attr: 'view', blockId: 'testID' };
    reducers.libraryBlockQueue(state, { payload });
    expect(state).toEqual({ blocks: { testID: { view: { status: LOADING_STATUS.STANDBY } } } });
  });

  it('sets the loading status when request is sent', () => {
    const state = { blocks: { testID: { view: { status: null, value: null } } } };
    const payload = { attr: 'view', blockId: 'testID' };
    reducers.libraryBlockRequest(state, { payload });
    expect(state).toEqual({
      blocks: {
        testID: {
          view: {
            status: LOADING_STATUS.LOADING,
            value: null,
          },
        },
      },
    });
  });

  it('sets the loaded status when request is successful', () => {
    const state = { blocks: { testID: { view: { status: null, value: null } } } };
    const payload = { attr: 'view', blockId: 'testID', value: 'VAlUe' };
    reducers.libraryBlockSuccess(state, { payload });
    expect(state).toEqual({
      blocks: {
        testID: {
          view: {
            status: LOADING_STATUS.LOADED,
            value: payload.value,
          },
        },
      },
    });
  });

  it('sets the failed status when request is unsuccessful', () => {
    const state = { blocks: { testID: { view: { status: null, value: null } } } };
    const payload = { attr: 'view', blockId: 'testID', errorMessage: 'VAlUe' };
    reducers.libraryBlockFailed(state, { payload });
    expect(state).toEqual({
      blocks: {
        testID: {
          view: {
            status: LOADING_STATUS.FAILED,
            value: null,
          },
          errorMessage: payload.errorMessage,
        },
      },
    });
  });

  it('clears the error message', () => {
    const state = { blocks: { testID: { view: { status: null, value: null } } } };
    const payload = { blockId: 'testID' };
    reducers.libraryBlockClearError(state, { payload });
    expect(state).toEqual({
      blocks: {
        testID: {
          ...state.blocks.testID,
          errorMessage: null,
        },
      },
    });
  });

  it('clears the values for a specific block', () => {
    const state = {
      blocks: { testID: { view: { status: null, value: null } } },
      focusedBlock: 'testID',
    };
    const payload = { blockId: 'testID' };
    reducers.libraryClearBlock(state, { payload });
    expect(state).toEqual({ blocks: {}, focusedBlock: null });
  });

  it('updates the display name for a block', () => {
    const state = {
      blocks: { testID: { metadata: { value: { display_name: null } } } },
    };
    const payload = { blockId: 'testID', displayName: 'displayNAME' };
    reducers.libraryBlockUpdateDisplayName(state, { payload });
    expect(state).toEqual({
      blocks: {
        testID: {
          metadata: {
            value: {
              display_name: payload.displayName,
            },
          },
        },
      },
    });
  });
});
