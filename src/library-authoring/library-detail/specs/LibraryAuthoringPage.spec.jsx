import * as React from 'react';
import { screen } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { cleanUp, ctxRender, expectAction } from '../../common/specs/helpers';
import {
  blockStateFactory,
  libraryFactory,
} from '../../common/specs/factories';
import LibraryAuthoringPageContainer from '../LibraryAuthoringPage';
import { STORE_NAMES } from '../../common/data';

// Reducing function which is used to take an array of blocks and creates an object with keys that are their ids and
// values which are state for interacting with that block.
const toBlockInfo = (current, value) => ({ ...current, [value.id]: blockStateFactory(value) });

const genState = (library) => (
  {
    storeOptions: {
      preloadedState: {
        [STORE_NAMES.DETAIL]: { library },
        [STORE_NAMES.BLOCKS]: {
          blocks: library.blocks.reduce(toBlockInfo, {}),
        },
      },
    },
  }
);

const expectBlockAction = (name, payload) => expectAction(`${STORE_NAMES.BLOCKS}/${name}`, payload);

const render = (library, ctxSettings) => ctxRender(
  <LibraryAuthoringPageContainer
    library={library}
    match={{ params: { libraryId: library.id } }}
  />,
  ctxSettings,
);

describe('<LibraryAuthoringPageContainer />', () => {
  afterEach(cleanUp);

  it('Loads blocks', async () => {
    const library = libraryFactory({
      blocks: [
        { id: 'testBlock', display_name: 'Testola' },
        { id: 'anotherBlock', display_name: 'Testament' },
      ],
    });
    render(library, genState(library));
    expect(screen.getByText('Testola')).toBeTruthy();
    expect(screen.getByText('Testament')).toBeTruthy();
  });

  it('Toggles Previews', async () => {
    const library = libraryFactory({ blocks: [{ id: 'testBlock' }] });
    render(library, genState(library));
    expect(screen.getByTestId('block-preview')).toBeTruthy();
    screen.getAllByText('Hide Previews')[0].click();
    await waitFor(() => expect(() => screen.getByTestId('block-preview')).toThrow());
    expect(localStorage.getItem('showPreviews')).toBe('false');
  });

  it('Fetches block information', async () => {
    const library = libraryFactory({ blocks: [{ id: 'testBlock' }] });
    const storeConfig = genState(library);
    // Remove the local info about blocks.
    storeConfig.storeOptions.preloadedState[STORE_NAMES.BLOCKS].blocks = {};
    render(library, storeConfig);
    // There should be no previews because this info hasn't loaded yet.
    await waitFor(() => expect(() => screen.getByTestId('block-preview')).toThrow());
    expectBlockAction('libraryEnsureBlock', { blockId: 'testBlock' });
    expectBlockAction('libraryBlockRequest', { blockId: 'testBlock' });
  });
});
