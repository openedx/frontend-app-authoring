import {
  immediate, instaFail, testSuite,
} from '@src/library-authoring/common/specs/helpers';
import { useRealThunks } from '@src/library-authoring/common/data';
import * as api from '../api';
import * as thunks from '../thunks';
import { libraryBlockActions as actions } from '../slice';
import { libraryAuthoringActions as detailActions } from '../../../author-library/data';

testSuite('Library block thunks', () => {
  const dispatch = jest.fn();
  beforeEach(() => {
    useRealThunks(true);
  });
  afterEach(() => {
    // Have to manually reset some things since debounce may live on.
    api.getLibraryBlock.fn.mockReset();
    api.getLibraryBlockAssets.fn.mockReset();
    api.renderXBlockView.fn.mockReset();
    dispatch.mockReset();
  });

  const blockId = 'testID';
  const value = 'MOCKvalue';

  const checkRequested = (attr, id) => {
    expect(dispatch).toHaveBeenCalledWith(actions.libraryBlockRequest({ attr, blockId: id }));
  };

  const checkSuccess = (attr, id, val) => {
    expect(dispatch).toHaveBeenCalledWith(actions.libraryBlockSuccess({ attr, blockId: id, value: val }));
  };

  const checkError = (attr, id, error) => {
    expect(dispatch).toHaveBeenCalledWith(actions.libraryBlockFailed(
      { attr, blockId: id, errorMessage: error.message },
    ));
  };

  it('fetches a specific block metadata', async () => {
    api.getLibraryBlock.fn.mockImplementation(() => immediate(value));
    await thunks.fetchLibraryBlockMetadata(dispatch)({ blockId });
    expect(api.getLibraryBlock.fn).toHaveBeenCalledWith(blockId);
    checkRequested('metadata', blockId);
    checkSuccess('metadata', blockId, value);
  });

  it('handles fetch block metadata failure', async () => {
    const error = new Error('It borked');
    api.getLibraryBlock.fn.mockImplementation(() => instaFail(error));
    await thunks.fetchLibraryBlockMetadata(dispatch)({ blockId });
    checkError('metadata', blockId, error);
  });

  it('fetches a specific block view', async () => {
    api.renderXBlockView.fn.mockImplementation(() => immediate(value));
    await thunks.fetchLibraryBlockView(dispatch)({ blockId, viewSystem: 'sYs', viewName: 'nAMe' });
    expect(api.renderXBlockView.fn).toHaveBeenCalledWith(blockId, 'sYs', 'nAMe');
    checkRequested('view', blockId);
    checkSuccess('view', blockId, value);
  });

  it('handles fetch block view failure', async () => {
    const error = new Error('It borked');
    api.renderXBlockView.fn.mockImplementation(() => instaFail(error));
    await thunks.fetchLibraryBlockView(dispatch)({ blockId, viewSystem: 'sYs', viewName: 'nAMe' });
    checkError('view', blockId, error);
  });

  it('updates a specific block view', async () => {
    await thunks.updateLibraryBlockView(dispatch)({ blockId });
    expect(dispatch).toHaveBeenCalledWith(actions.libraryBlockQueue({ attr: 'view', blockId }));
  });

  it('updates all block views', async () => {
    const blocks = {
      value: {
        data: [
          { id: 'id1' },
          { id: 'id2' },
        ],
      },
    };
    await thunks.updateAllLibraryBlockView(dispatch)({ blocks });
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenCalledWith(actions.libraryBlockQueue({
      blockId: blocks.value.data[1].id,
      attr: 'view',
    }));
  });

  it('fetches block assets', async () => {
    api.getLibraryBlockAssets.fn.mockImplementation(() => immediate(value));
    await thunks.fetchLibraryBlockAssets(dispatch)({ blockId });
    expect(api.getLibraryBlockAssets.fn).toHaveBeenCalledWith(blockId);
    checkRequested('assets', blockId);
    checkSuccess('assets', blockId, value);
  });

  it('handles fetch block assets failure', async () => {
    const error = new Error('It borked');
    api.getLibraryBlockAssets.fn.mockImplementation(() => instaFail(error));
    await thunks.fetchLibraryBlockAssets(dispatch)({ blockId });
    expect(dispatch).toHaveBeenCalledWith(actions.libraryBlockFailed(
      { attr: 'assets', errorMessage: error.message },
    ));
  });

  it('uploads block assets', async () => {
    const files = [
      { name: 'nm1' },
      { name: 'nm2' },
    ];
    api.addLibraryBlockAsset.fn.mockImplementation(() => immediate(value));
    api.getLibraryBlock.fn.mockImplementation(() => immediate(value));
    api.getLibraryBlockAssets.fn.mockImplementation(() => immediate(value));
    await thunks.uploadLibraryBlockAssets(dispatch)({ blockId, files });
    expect(api.addLibraryBlockAsset.fn).toHaveBeenCalledTimes(2);
    expect(api.addLibraryBlockAsset.fn).toHaveBeenCalledWith(blockId, 'nm1', files[0]);
    expect(api.getLibraryBlock.fn).toHaveBeenCalledWith(blockId);
    expect(api.getLibraryBlockAssets.fn).toHaveBeenCalledWith(blockId);
    checkSuccess('assets', blockId, value);
    checkSuccess('metadata', blockId, value);
  });

  it('handles upload block assets failure', async () => {
    const files = [
      { name: 'nm1' },
      { name: 'nm2' },
    ];
    const error = new Error('It borked');
    api.getLibraryBlockAssets.fn.mockImplementation(() => instaFail(error));
    await thunks.uploadLibraryBlockAssets(dispatch)({ blockId, files });
    expect(dispatch).toHaveBeenCalledWith(actions.libraryBlockFailed(
      { blockId, errorMessage: error.message },
    ));
  });

  it('deletes block assets', async () => {
    const fileName = 'fileNAME';
    api.deleteLibraryBlockAsset.fn.mockImplementation(() => immediate(value));
    api.getLibraryBlockAssets.fn.mockImplementation(() => immediate(value));
    api.getLibraryBlock.fn.mockImplementation(() => immediate(value));
    await thunks.deleteLibraryBlockAsset(dispatch)({ blockId, fileName });
    expect(api.deleteLibraryBlockAsset.fn).toHaveBeenCalledWith(blockId, fileName);
    expect(api.getLibraryBlockAssets.fn).toHaveBeenCalledWith(blockId);
    expect(api.getLibraryBlock.fn).toHaveBeenCalledWith(blockId);
    checkSuccess('assets', blockId, value);
    checkSuccess('metadata', blockId, value);
  });

  it('handles delete block assets failure', async () => {
    const fileName = 'fileNAME';
    const error = new Error('It borked');
    api.deleteLibraryBlockAsset.fn.mockImplementation(() => instaFail(error));
    await thunks.deleteLibraryBlockAsset(dispatch)({ blockId, fileName });
    expect(dispatch).toHaveBeenCalledWith(actions.libraryBlockFailed(
      { blockId, errorMessage: error.message },
    ));
  });

  it('sets block display name', async () => {
    const displayName = 'displayNAME';
    await thunks.setLibraryBlockDisplayName(dispatch)({ blockId, displayName });
    expect(dispatch).toHaveBeenCalledWith(actions.libraryBlockUpdateDisplayName({ blockId, displayName }));
    expect(dispatch).toHaveBeenCalledWith(detailActions.libraryBlockUpdate({ blockId, displayName }));
  });

  it('deletes specified block', async () => {
    api.deleteLibraryBlock.fn.mockImplementation(() => immediate(value));
    await thunks.deleteLibraryBlock(dispatch)({ blockId });
    expect(api.deleteLibraryBlock.fn).toHaveBeenCalledWith(blockId);
    expect(dispatch).toHaveBeenCalledWith(detailActions.libraryAuthoringBlockDeleted({ blockId }));
    expect(dispatch).toHaveBeenCalledWith(actions.libraryClearBlock({ blockId }));
    checkRequested('deletion', blockId);
  });

  it('initializes a block', async () => {
    await thunks.initializeBlock(dispatch)({ blockId });
    expect(dispatch).toHaveBeenCalledWith(actions.libraryEnsureBlock({ blockId }));
  });
});
