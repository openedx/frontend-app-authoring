import { waitFor } from '@testing-library/dom';
import {
  immediate, instaFail, makeN, testSuite,
} from '../../../common/specs/helpers';
import { useRealThunks } from '../../../common/data';
import * as api from '../api';
import { blockFactory, blockFactoryLine, libraryFactory } from '../../../common/specs/factories';
import {
  clearLibrary,
  commitLibraryChanges,
  createBlock, debouncedBlockSearch,
  fetchBlocks,
  fetchLibraryDetail,
  revertLibraryChanges, searchLibrary,
} from '../thunks';
import { libraryAuthoringActions as actions } from '../slice';
import { normalizeErrors } from '../../../common/helpers';

testSuite('Library detail thunks', () => {
  const dispatch = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    useRealThunks(true);
  });
  afterEach(() => {
    // Have to manually reset some things since debounce may live on.
    debouncedBlockSearch.cancel();
    api.getBlocks.fn.mockReset();
    api.getLibraryDetail.fn.mockReset();
    dispatch.mockReset();
  });

  const checkError = (attr, error) => {
    try {
      normalizeErrors(error);
      // Should not reach here.
      expect(true).toBe(false);
    } catch (normalized) {
      expect(dispatch).toHaveBeenCalledWith(actions.libraryAuthoringFailed(
        { attr, errorFields: normalized.fields, errorMessage: normalized.message },
      ));
    }
  };

  const checkRequested = (attr) => {
    expect(dispatch).toHaveBeenCalledWith(actions.libraryAuthoringRequest({ attr }));
  };

  const checkSuccess = (attr, value) => {
    expect(dispatch).toHaveBeenCalledWith(actions.libraryAuthoringSuccess({ attr, value }));
  };

  describe('clearLibrary', () => {
    const abortFn = jest.fn();
    global.AbortController = jest.fn(() => ({
      abort: abortFn,
    }));

    it('with no previous api calls should not call abort', async () => {
      await clearLibrary(dispatch)();
      expect(abortFn).not.toHaveBeenCalled();
    });

    it('with previous api calls should call abort', async () => {
      const library = libraryFactory();
      await fetchLibraryDetail(dispatch)({ libraryId: library.id });
      await clearLibrary(dispatch)();
      expect(abortFn).toHaveBeenCalledTimes(1);
    });
  });

  it('Fetches library details', async () => {
    const library = libraryFactory();
    api.getLibraryDetail.fn.mockImplementation(() => immediate(library));
    await fetchLibraryDetail(dispatch)({ libraryId: library.id });
    expect(api.getLibraryDetail.fn).toHaveBeenCalledWith(library.id, new AbortController());
    checkRequested('library');
    checkSuccess('library', library);
  });

  it('Handles a library details failure', async () => {
    const error = new Error('It borked');
    api.getLibraryDetail.fn.mockImplementation(() => instaFail(error));
    await fetchLibraryDetail(dispatch)({ libraryId: 'test' });
    checkError('library', error);
  });

  it('Fetches blocks', async () => {
    const library = libraryFactory();
    const blocks = makeN(blockFactoryLine([], { library }), 3);
    api.getBlocks.fn.mockImplementation(() => immediate(blocks));
    await fetchBlocks(dispatch)({ libraryId: library.id });
    expect(api.getBlocks.fn).toHaveBeenCalledWith({ libraryId: library.id, controller: new AbortController() });
    checkRequested('blocks');
    checkSuccess('blocks', blocks);
  });

  it('Fetches blocks with a search query', async () => {
    const library = libraryFactory();
    const blocks = makeN(blockFactoryLine([], { library }), 3);
    api.getBlocks.fn.mockImplementation(() => immediate(blocks));
    await fetchBlocks(dispatch)({ libraryId: library.id, query: 'test' });
    expect(api.getBlocks.fn).toHaveBeenCalledWith({ libraryId: library.id, query: 'test', controller: new AbortController() });
    checkRequested('blocks');
    checkSuccess('blocks', blocks);
  });

  it('Handles a block-fetching failure', async () => {
    const error = new Error('It borked!');
    api.getBlocks.fn.mockImplementation(() => instaFail(error));
    await fetchBlocks(dispatch)({ libraryId: 'test' });
    checkRequested('blocks');
    checkError('blocks', error);
  });

  it('Creates a library block', async () => {
    const block = blockFactory();
    const blockSpec = { block_type: 'video', description_id: 'test' };
    const paginationParams = {
      page: 1,
      page_size: 20,
    };

    api.createLibraryBlock.fn.mockImplementation(() => immediate(block));
    api.getBlocks.fn.mockImplementation(() => immediate({ data: [block], count: 1 }));

    await createBlock(dispatch)({
      libraryId: 'testLibrary', data: blockSpec, paginationParams, query: '', types: '',
    });

    expect(dispatch).toHaveBeenCalledWith(actions.libraryAuthoringRequest({ attr: 'blocks' }));
    expect(api.createLibraryBlock.fn).toHaveBeenCalledWith({ libraryId: 'testLibrary', data: blockSpec });
    expect(api.getLibraryDetail.fn).toHaveBeenCalledWith('testLibrary');
    expect(api.getBlocks.fn).toHaveBeenCalledWith({
      libraryId: 'testLibrary',
      paginationParams,
      query: '',
      types: '',
    });

    // checkRequested('blocks');
    expect(dispatch).toHaveBeenCalledWith(actions.libraryAuthoringSuccess({
      value: {
        data: [block],
        count: 1,
      },
      attr: 'blocks',
    }));
  });

  it('Handles a block creation failure', async () => {
    const error = new Error('It borked!');
    api.createLibraryBlock.fn.mockImplementation(() => instaFail(error));
    const blockSpec = { block_type: 'video', description_id: 'test' };
    await createBlock(dispatch)({ libraryId: 'testLibrary', data: blockSpec });
    checkRequested('blocks');
    checkError('blocks', error);
  });

  it('Commits changes', async () => {
    const library = libraryFactory();
    api.commitLibraryChanges.fn.mockImplementation(() => immediate(null));
    api.getLibraryDetail.fn.mockImplementation(() => immediate(library));
    await commitLibraryChanges(dispatch)({ libraryId: 'test' });
    expect(api.commitLibraryChanges.fn).toHaveBeenCalledWith('test');
    expect(api.getLibraryDetail.fn).toHaveBeenCalledWith('test');
    checkRequested('library');
    checkSuccess('library', library);
  });

  it('Handles a commit failure', async () => {
    const error = new Error('It borked!');
    api.commitLibraryChanges.fn.mockImplementation(() => instaFail(error));
    await commitLibraryChanges(dispatch)({ libraryId: 'test' });
    checkRequested('library');
    checkError('library', error);
  });

  it('Handles a refetch failure, post-commit', async () => {
    const error = new Error('It borked!');
    api.commitLibraryChanges.fn.mockImplementation(() => immediate(null));
    api.getLibraryDetail.fn.mockImplementation(() => instaFail(error));
    await commitLibraryChanges(dispatch)({ libraryId: 'test' });
    checkRequested('library');
    checkError('library', error);
  });

  it('Reverts library changes', async () => {
    const library = libraryFactory();
    const blocks = makeN(blockFactoryLine([], { library }), 3);
    api.revertLibraryChanges.fn.mockImplementation(() => immediate(null));
    api.getLibraryDetail.fn.mockImplementation(() => immediate(library));
    api.getBlocks.fn.mockImplementation(() => immediate(blocks));
    await revertLibraryChanges(dispatch)({ libraryId: 'test' });
  });

  it('Handles a failure during reversion', async () => {
    const error = new Error('It borked!');
    api.revertLibraryChanges.fn.mockImplementation(() => instaFail(error));
    await revertLibraryChanges(dispatch)({ libraryId: 'test' });
    checkRequested('library');
    checkError('library', error);
  });

  it('Handles a failure during refetch after reversion', async () => {
    const error = new Error('It borked!');
    api.revertLibraryChanges.fn.mockImplementation(() => immediate(null));
    api.getLibraryDetail.fn.mockImplementation(() => instaFail(error));
    await revertLibraryChanges(dispatch)({ libraryId: 'test' });
    checkRequested('library');
    checkError('library', error);
    checkError('blocks', error);
  });

  it('Searches for blocks', async () => {
    const library = libraryFactory();
    const blocks = makeN(blockFactoryLine([], { library }), 3);
    api.getBlocks.fn.mockImplementation(() => immediate(blocks));
    await searchLibrary(dispatch)({ libraryId: library.id, query: 'test', types: ['video'] });
    await waitFor(() => checkRequested('blocks'));
    checkSuccess('blocks', blocks);
    expect(api.getBlocks.fn).toHaveBeenCalledWith({
      libraryId: library.id,
      query: 'test',
      types: ['video'],
      controller: new AbortController(),
    });
  });
});
