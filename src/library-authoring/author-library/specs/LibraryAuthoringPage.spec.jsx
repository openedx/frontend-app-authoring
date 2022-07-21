import * as React from 'react';
import { act, screen } from '@testing-library/react';
import { fireEvent, waitFor } from '@testing-library/dom';
import {
  ctxRender,
  makeN,
  testSuite,
} from '../../common/specs/helpers';
import {
  blockFactory, blockFactoryLine,
  blockStateFactory,
  libraryFactory,
} from '../../common/specs/factories';
import LibraryAuthoringPageContainer from '../LibraryAuthoringPage';
import { LIBRARY_TYPES, LOADING_STATUS, STORE_NAMES } from '../../common/data';
import {
  clearLibrary,
  commitLibraryChanges,
  createBlock,
  fetchLibraryDetail,
  revertLibraryChanges,
  searchLibrary,
  fetchBlockLtiUrl,
  libraryAuthoringActions,
} from '../data';
import { HTML_TYPE, PROBLEM_TYPE, VIDEO_TYPE } from '../../common/specs/constants';
import {
  deleteLibraryBlock, fetchLibraryBlockView, initializeBlock, libraryBlockActions,
} from '../../edit-block/data';
import {
  updateLibrary,
} from '../../configure-library/data'

// Reducing function which is used to take an array of blocks and creates an object with keys that are their ids and
// values which are state for interacting with that block.
const toBlockInfo = (current, value) => ({ ...current, [value.id]: blockStateFactory(value) });

const paginationParams = {
  page: 1,
  page_size: 20,
};

const genState = (library, blocks = []) => (
  {
    storeOptions: {
      preloadedState: {
        [STORE_NAMES.AUTHORING]: {
          library: { value: library, status: LOADING_STATUS.LOADED },
          blocks: {
            status: LOADING_STATUS.LOADED,
            value: {
              data: blocks,
              count: blocks.length,
            },
          },
          ltiUrlClipboard: { value: { blockId: null, lti_url: null }, status: LOADING_STATUS.STANDBY },
        },
        [STORE_NAMES.BLOCKS]: {
          blocks: blocks.reduce(toBlockInfo, {}),
        },
      },
    },
  }
);

const render = (library, ctxSettings) => ctxRender(
  <LibraryAuthoringPageContainer
    match={{ params: { libraryId: library.id } }}
  />,
  ctxSettings,
);

testSuite('<LibraryAuthoringPageContainer />', () => {
  it('Fetches a library when missing', async () => {
    await ctxRender(
      <LibraryAuthoringPageContainer
        match={{ params: { libraryId: 'testtest' } }}
      />,
    );
    await waitFor(() => expect(clearLibrary.fn).toHaveBeenCalled());
    clearLibrary.calls[0].resolve();
    await waitFor(() => expect(fetchLibraryDetail.fn).toHaveBeenCalledWith({ libraryId: 'testtest' }));
  });

  it('Fetches a library when the current library does not match', async () => {
    await ctxRender(
      <LibraryAuthoringPageContainer
        match={{ params: { libraryId: 'testtest' } }}
      />,
      genState(libraryFactory()),
    );
    await waitFor(() => expect(clearLibrary.fn).toHaveBeenCalled());
    clearLibrary.calls[0].resolve();
    await waitFor(() => expect(fetchLibraryDetail.fn).toHaveBeenCalledWith({ libraryId: 'testtest' }));
  });

  it('Does not refetch the library if it matches', async () => {
    const library = libraryFactory();
    await render(library, genState(library));
    await process.nextTick(() => {
      expect(clearLibrary.fn).not.toHaveBeenCalled();
    });
  });

  it('Loads blocks', async () => {
    const library = libraryFactory();
    const blocks = makeN(blockFactoryLine([], { library }), 2);
    await render(library, genState(library, blocks));
    expect(screen.getByText(blocks[0].display_name)).toBeTruthy();
    expect(screen.getByText(blocks[1].display_name)).toBeTruthy();
  });

  it('Toggles Previews', async () => {
    const library = libraryFactory();
    const blocks = [blockFactory(undefined, { library })];
    await render(library, genState(library, blocks));
    expect(screen.getByTestId('block-preview')).toBeTruthy();
    screen.getAllByText('Hide Previews')[0].click();
    await waitFor(() => expect(() => screen.getByTestId('block-preview')).toThrow());
    expect(localStorage.getItem('showPreviews')).toBe('false');
  });

  it('Fetches block information', async () => {
    const library = libraryFactory();
    const blocks = [blockFactory({ id: 'testBlock' }, { library })];
    const storeConfig = genState(library, blocks);
    // Remove the local info about blocks.
    storeConfig.storeOptions.preloadedState[STORE_NAMES.BLOCKS].blocks = {};
    await render(library, storeConfig);
    // There should be no previews because this info hasn't loaded yet.
    await waitFor(() => expect(() => screen.getByTestId('block-preview')).toThrow());
    expect(initializeBlock.fn).toHaveBeenCalledWith({ blockId: 'testBlock' });
    initializeBlock.calls[0].dispatch(libraryBlockActions.libraryEnsureBlock({ blockId: 'testBlock' }));
    await waitFor(() => expect(fetchLibraryBlockView.fn).toHaveBeenCalledWith(
      {
        blockId: 'testBlock', viewName: 'student_view', viewSystem: 'studio',
      },
    ));
    expect(fetchLibraryBlockView.fn).toHaveBeenCalledTimes(1);
  });

  it('Fetches block LTI URL to clipboard', async () => {
    const library = libraryFactory({ allow_lti: true });
    const blocks = makeN(blockFactoryLine([], { library }), 2);

    await render(library, genState(library, blocks));
    expect(screen.getByText(blocks[0].display_name)).toBeTruthy();
    expect(screen.getByText(blocks[1].display_name)).toBeTruthy();

    const copyToClipboardButtons = screen.getAllByText('Copy LTI Url');
    expect(copyToClipboardButtons.length).toBe(2);

    copyToClipboardButtons[0].click();

    await waitFor(() => fetchBlockLtiUrl.calls[0].dispatch(
      libraryAuthoringActions.libraryBlockLtiUrlFetchRequest({ blockId: blocks[0].id }),
    ));

    expect(fetchBlockLtiUrl.fn).toHaveBeenCalledWith({ blockId: blocks[0].id });

    await waitFor(() => fetchBlockLtiUrl.calls[0].dispatch(
      libraryAuthoringActions.libraryAuthoringSuccess({
        value: { blockId: blocks[0], lti_url: 'a' },
        attr: 'ltiUrlClipboard',
      }),
    ));
  });

  it('Copy LTI URL not shown unless it is enabled', async () => {
    const library = libraryFactory();
    const blocks = makeN(blockFactoryLine([], { library }), 2);

    await render(library, genState(library, blocks));
    expect(screen.getByText(blocks[0].display_name)).toBeTruthy();
    expect(screen.getByText(blocks[1].display_name)).toBeTruthy();

    const copyToClipboardButtons = screen.queryAllByAltText('Copy LTI Url');
    expect(copyToClipboardButtons.length).toBe(0);
  });

  it('Adds a predefined block type', async () => {
    const library = libraryFactory({ type: LIBRARY_TYPES.VIDEO });
    await render(library, genState(library));
    const addButtons = screen.getAllByText('Add Video');
    // One's hidden by CSS, but the testing library wouldn't know that.
    expect(addButtons.length).toBe(3);
    addButtons[0].click();
    expect(createBlock.fn).toHaveBeenCalledWith({
      libraryId: library.id,
      data: {
        block_type: VIDEO_TYPE.block_type,
        definition_id: expect.any(String),
      },
      query: '',
      types: [],
      paginationParams,
    });
  });

  it('Adds a custom block type', async () => {
    const library = libraryFactory({
      blockTypes: [{ display_name: 'Test Type', block_type: 'test' }],
      type: LIBRARY_TYPES.COMPLEX,
    });
    await render(library, genState(library));
    screen.getByText('Advanced').click();
    const typeOption = await screen.findByText('Test Type', { ignore: 'option' });
    act(() => {
      typeOption.click();
    });
    await waitFor(() => expect(createBlock.fn).toHaveBeenCalledWith({
      libraryId: library.id,
      data: {
        block_type: 'test',
        definition_id: expect.any(String),
      },
      query: '',
      types: [],
      paginationParams,
    }));
  });

  [VIDEO_TYPE, PROBLEM_TYPE, HTML_TYPE].forEach((blockDef) => {
    it(`Adds a ${blockDef.display_name} block to a library`, async () => {
      const library = libraryFactory({ type: LIBRARY_TYPES.COMPLEX });
      await render(library, genState(library));
      screen.getByText('Advanced').click();
      const typeOption = await screen.findByText(blockDef.display_name, { ignore: 'option' });
      act(() => {
        typeOption.click();
      });
      expect(createBlock.fn).toHaveBeenCalledWith({
        libraryId: library.id,
        data: {
          block_type: blockDef.block_type,
          definition_id: expect.any(String),
        },
        query: '',
        types: [],
        paginationParams,
      });
    });
  });

  it('Searches for blocks', async () => {
    const library = libraryFactory();
    await render(library, genState(library));
    const search = screen.getByLabelText('Search...');
    act(() => {
      fireEvent.change(search, { target: { value: 'boop' } });
    });
    await waitFor(() => expect(searchLibrary.fn).toHaveBeenCalledWith({
      libraryId: library.id,
      query: 'boop',
      types: [],
      paginationParams,
    }));
  });

  it('Filters blocks by type', async () => {
    const library = libraryFactory();
    await render(library, genState(library));
    const filter = screen.getByTestId('filter-dropdown');
    act(() => {
      fireEvent.change(filter, { target: { value: 'html' } });
    });
    await waitFor(() => expect(searchLibrary.fn).toHaveBeenCalledWith({
      libraryId: library.id,
      query: '',
      types: ['html'],
      paginationParams,
    }));
  });

  it('Filters blocks by other types', async () => {
    const library = libraryFactory({
      blockTypes: [
        { block_type: 'squirrel', display_name: 'Squirrel' },
        { block_type: 'fox', display_name: 'Fox' },
        VIDEO_TYPE,
      ],
    });
    await render(library, genState(library));
    const filter = screen.getByTestId('filter-dropdown');
    act(() => {
      fireEvent.change(filter, { target: { value: '^' } });
    });
    await waitFor(() => expect(searchLibrary.fn).toHaveBeenCalledWith({
      libraryId: library.id,
      query: '',
      types: ['squirrel', 'fox'],
      paginationParams,
    }));
  });

  it('Commits changes', async () => {
    const library = libraryFactory({ has_unpublished_changes: true });
    await render(library, genState(library));
    screen.getByText('Publish').click();
    expect(commitLibraryChanges.fn).toHaveBeenCalledWith({ libraryId: library.id });
  });

  it('Reverts changes', async () => {
    const library = libraryFactory({ has_unpublished_changes: true });
    await render(library, genState(library));
    screen.getByText('Discard changes').click();
    expect(revertLibraryChanges.fn).toHaveBeenCalledWith({
      libraryId: library.id,
      paginationParams,
    });
  });

  it('Deletes a block', async () => {
    const library = libraryFactory();
    const block = blockFactory(undefined, { library });
    await render(library, genState(library, [block]));
    const del = screen.getByLabelText('Delete');
    act(() => {
      del.click();
    });
    const yes = await screen.findByText('Yes.');
    act(() => {
      yes.click();
    });
    await waitFor(
      () => expect(deleteLibraryBlock.fn).toHaveBeenCalledWith({ blockId: block.id }),
    );
  });

  it('Rename library', async () => {
    const library = libraryFactory();
    const block = blockFactory(undefined, { library });
    await render(library, genState(library, [block]));
    
    const editButton = screen.getByRole('button', { name: /edit name button/i })
    editButton.click();
    const input = await screen.getByRole('textbox', { name: /title input/i })
    fireEvent.change(input, {target: {value: 'New title'}});
    fireEvent.focusOut(input);
    await waitFor(
      () => expect(updateLibrary.fn).toHaveBeenCalledWith({ data: { title: 'New title', libraryId: library.id }}),
    );
  });
});
