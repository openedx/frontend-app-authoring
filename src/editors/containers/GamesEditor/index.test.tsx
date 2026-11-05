import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, focusManager, onlineManager } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { getConfig } from '@edx/frontend-platform';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import {
  fireEvent,
  initializeMocks,
  makeQueryClientWrapper,
  screen,
  waitFor,
  within,
} from '@src/testUtils';

import { editorRender, getEditorStore } from '@src/editors/editorTestRender';
import { actions as editorActions, type PartialEditorState } from '@src/editors/data/redux';
import EditorContainer from '@src/editors/containers/EditorContainer';
import * as editorHooks from '@src/editors/hooks';

import GamesEditor from '.';
import * as editorViewHooks from './gameContent';
import * as api from './data/api';
import { emptyCard, useGameState } from './data/useGameState';
import type { ImageType } from './types';
import { verticalSortableListCollisionDetection } from '@src/generic/DraggableList/verticalSortableList';

const blockId = 'block-v1:org+course+run+type@games+block@abc';

type AppState = NonNullable<PartialEditorState['app']>;

/** The editors' store as Editor.tsx leaves it once a block has been fetched. */
const appState = (overrides: AppState = {}): AppState => ({
  blockId,
  blockType: 'games',
  learningContextId: 'course-v1:org+course+run',
  studioEndpointUrl: 'http://studio',
  lmsEndpointUrl: 'http://lms',
  blockTitle: 'Games',
  blockValue: {
    data: {
      id: blockId,
      display_name: 'Games',
      category: 'games',
      data: '',
      metadata: { display_name: 'Games' },
    },
  },
  unitUrl: {
    data: { ancestors: [{ id: 'unit-1', display_name: 'Unit', category: 'vertical', has_children: true }] },
  },
  ...overrides,
});

/**
 * Renders the editor the way EditorPage does: inside the editors' Redux store
 * and EditorContext. EditorContainer reads from both.
 */
const renderEditor = (
  props: Partial<React.ComponentProps<typeof GamesEditor>> = {},
  app: AppState = {},
) =>
  editorRender(
    <GamesEditor onClose={() => {}} {...props} />,
    {
      initialState: { app: appState(app) },
      // The editor reads the learning context from EditorContext, as the host
      // page provides it, so the two are kept in step here.
      learningContextId: app.learningContextId ?? undefined,
    },
  );

/**
 * Loaded cards start collapsed, so a test that reads or types into a card opens
 * it first, the way an author does. Every card is opened, and finding none is a
 * failure: a test whose block loads no cards (a failed or pending fetch) reads
 * no fields, and renders with `renderEditor` instead.
 */
const expandLoadedCards = async () => {
  const expandButtons = await screen.findAllByRole('button', { name: 'Expand card' });
  expandButtons.forEach((button) => fireEvent.click(button));
};

const renderEditorWithCardsOpen = async (
  props: Partial<React.ComponentProps<typeof GamesEditor>> = {},
  app: AppState = {},
) => {
  const result = renderEditor(props, app);
  await expandLoadedCards();
  return result;
};

/** A card's own chrome, found from its drag handle; the deck and flat lists both render it. */
const cardRoot = (cardName: string) =>
  screen.getByRole('button', { name: `Reorder ${cardName}` }).closest('.card') as HTMLElement;

/** Re-initialises the editors' store, as Editor.tsx does when the page moves to another block. */
const reinitialize = (overrides: AppState) =>
  act(() => {
    getEditorStore().dispatch(editorActions.app.initialize(appState(overrides)));
  });

// `useGameState` uses React Query, so rendering it bare needs a client. A new
// one per call, like a fresh page load, with the same "no retries" as testUtils.
const blockRef = (
  id: string | null,
) => (id ? { blockId: id, studioEndpointUrl: 'http://studio', isLibrary: false } : null);
const renderGameState = (id: string | null = blockId) =>
  renderHook(() => useGameState(blockRef(id)), {
    wrapper: makeQueryClientWrapper(new QueryClient({ defaultOptions: { queries: { retry: false } } })),
  });

// Stubbed so the editor body renders: the real EditorContainer gates its
// children on the editors' block-fetch state, which only Editor.tsx primes.
// Keeping it a jest.fn also lets us assert the props the editor hands it.
jest.mock('@src/editors/containers/EditorContainer', () => ({
  __esModule: true,
  default: jest.fn(({ children }) => children),
}));

// Collision detection decides where a keyboard drag lands; the drag test
// points it at a specific card. Every other test keeps the real one.
jest.mock('@src/generic/DraggableList/verticalSortableList', () => {
  const actual = jest.requireActual('@src/generic/DraggableList/verticalSortableList');
  return { ...actual, verticalSortableListCollisionDetection: jest.fn(actual.verticalSortableListCollisionDetection) };
});

jest.mock('@edx/frontend-platform/analytics', () => ({
  ...jest.requireActual('@edx/frontend-platform/analytics'),
  sendTrackEvent: jest.fn(),
}));

jest.mock('./data/api', () => ({
  getSettings: jest.fn(),
  uploadImage: jest.fn(),
  saveSettings: jest.fn(),
  buildSavePayload: jest.requireActual('./data/api').buildSavePayload,
}));

// The two modules mocked above, seen as the jest.fn()s they now are.
const mockedApi = api as unknown as Record<'getSettings' | 'uploadImage' | 'saveSettings', jest.Mock>;
const MockedEditorContainer = EditorContainer as unknown as jest.Mock;

describe('GamesEditor', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue({
      data: {
        game_type: 'flashcards',
        is_shuffled: true,
        has_timer: false,
        cards: [{ term: 'Photosynthesis', definition: 'How plants eat' }],
      },
    });
  });

  it('loads the block settings through the block own handler', async () => {
    renderEditor();
    await waitFor(() => expect(api.getSettings).toHaveBeenCalledWith(expect.objectContaining({ blockId })));
  });

  it('renders the saved cards', async () => {
    await renderEditorWithCardsOpen();
    expect(await screen.findByDisplayValue('Photosynthesis')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('How plants eat')).toBeInTheDocument();
  });
});

describe('saving', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue({
      data: {
        game_type: 'flashcards',
        is_shuffled: true,
        has_timer: false,
        cards: [{
          term: 't',
          definition: 'd',
          term_image: 'http://x/i.png',
          term_image_path: 'games/abc/hash.png',
          card_key: 'saved-key',
        }],
      },
    });
    mockedApi.saveSettings.mockResolvedValue({ data: { success: true } });
  });

  // Regression guard: the editor must save through the block's OWN handler. If it
  // falls back to the shared saveBlock thunk, that payload builder silently
  // drops the *_image_path storage keys, losing the link from card to file.
  // The shared save signals the unit page the same way. Session storage
  // keeps the signal to this tab; local storage would fire it in every other
  // Studio tab on the origin too.
  it('signals the course refresh through sessionStorage, like the shared save does', async () => {
    sessionStorage.removeItem('courseRefreshTriggerOnComponentEditSave');
    localStorage.removeItem('courseRefreshTriggerOnComponentEditSave');
    await renderEditorWithCardsOpen();
    expect(await screen.findByDisplayValue('t')).toBeInTheDocument();
    const { onSave } = MockedEditorContainer.mock.lastCall[0];
    await onSave();
    expect(sessionStorage.getItem('courseRefreshTriggerOnComponentEditSave')).not.toBeNull();
    expect(localStorage.getItem('courseRefreshTriggerOnComponentEditSave')).toBeNull();
  });

  it('sends the card key the block loaded, so the card keeps its identity', async () => {
    await renderEditorWithCardsOpen();
    expect(await screen.findByDisplayValue('t')).toBeInTheDocument();
    const { onSave } = MockedEditorContainer.mock.lastCall[0];
    await onSave();
    const [, content] = mockedApi.saveSettings.mock.calls[0];
    expect(content.cards[0].card_key).toEqual('saved-key');
  });

  it('passes an onSave to EditorContainer so the shared saveBlock thunk is bypassed', () => {
    renderEditor();
    const props = MockedEditorContainer.mock.calls[0][0];
    expect(typeof props.onSave).toBe('function');
  });

  // The container's cancel and discard flows call returnFunction
  // when there is no onClose. The editor's save already honours it; cancel
  // must reach it too.
  // The editors' store says which Studio to talk to, and which learning
  // context the block is in. Both must reach the API layer.
  it('passes the store\'s Studio endpoint to the API', async () => {
    renderEditor({}, { studioEndpointUrl: 'http://other-studio' });
    await waitFor(() => expect(mockedApi.getSettings).toHaveBeenCalled());
    expect(mockedApi.getSettings).toHaveBeenCalledWith(
      expect.objectContaining({ blockId, studioEndpointUrl: 'http://other-studio' }),
    );
  });

  // The editors treat a block as a library block by its learning context too,
  // not only by an `lb:` id. A library-context block must use the handler-URL
  // resolver, as the other built-in editors do.
  it('treats a block in a library learning context as a library block', async () => {
    renderEditor({}, { learningContextId: 'lib:Org:lib1' });
    await waitFor(() => expect(mockedApi.getSettings).toHaveBeenCalled());
    expect(mockedApi.getSettings).toHaveBeenCalledWith(expect.objectContaining({ isLibrary: true }));
  });

  // Only v2 libraries have server-issued handler URLs. A legacy (v1) library
  // block has a legacy usage key, which the v2 resolver rejects; it takes the
  // fixed handler route like a course block.
  it('does not treat a legacy (v1) library context as a v2 library block', async () => {
    renderEditor({}, { learningContextId: 'library-v1:Org+lib1' });
    await waitFor(() => expect(mockedApi.getSettings).toHaveBeenCalled());
    expect(mockedApi.getSettings).toHaveBeenCalledWith(expect.objectContaining({ isLibrary: false }));
  });

  // The learning context comes from EditorContext, which the host page
  // provides, not from the editors' store.
  it('takes the learning context from the editor context', async () => {
    editorRender(
      <GamesEditor onClose={() => {}} />,
      {
        initialState: { app: appState({ learningContextId: 'course-v1:org+course+run' }) },
        learningContextId: 'lib:Org:lib1',
      },
    );
    await waitFor(() => expect(mockedApi.getSettings).toHaveBeenCalled());
    expect(mockedApi.getSettings).toHaveBeenCalledWith(expect.objectContaining({ isLibrary: true }));
  });

  it('passes returnFunction through to EditorContainer', () => {
    const returnFunction = () => () => {};
    renderEditor({ returnFunction });
    const props = MockedEditorContainer.mock.calls[0][0];
    expect(props.returnFunction).toBe(returnFunction);
  });

  it('saves through the block own handler, storage keys included', async () => {
    const onClose = jest.fn();
    await renderEditorWithCardsOpen({ onClose });
    await waitFor(() => expect(api.getSettings).toHaveBeenCalled());
    // Saving is refused until the settings are in, so wait for the card itself,
    // not just for the request to have gone out.
    expect(await screen.findByDisplayValue('t')).toBeInTheDocument();

    // Take the most recent render: the first one closes over the pre-load state.
    const { onSave } = MockedEditorContainer.mock.calls[MockedEditorContainer.mock.calls.length - 1][0];
    await onSave();

    expect(api.saveSettings).toHaveBeenCalledTimes(1);
    const [calledBlock, content] = mockedApi.saveSettings.mock.calls[0];
    expect(calledBlock.blockId).toEqual(blockId);
    expect(content.cards[0].term_image_path).toEqual('games/abc/hash.png');
    expect(onClose).toHaveBeenCalled();
  });
});

// Validation errors and unsaved text are attached to a card, not to a position
// in the list. Reordering must move them with the card.
describe('per-card state after a reorder', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue({
      data: {
        game_type: 'matching',
        cards: [
          { term: 'First term', definition: 'First definition' },
          { term: 'Second term', definition: '' }, // invalid: no definition
        ],
      },
    });
    mockedApi.saveSettings.mockResolvedValue({ data: { success: true } });
  });

  // The card menus, in list order.
  const cardMenus = () => screen.getAllByRole('button', { name: 'Card actions' });

  it('keeps the error on the invalid card when it is moved up', async () => {
    await renderEditorWithCardsOpen();
    expect(await screen.findByDisplayValue('Second term')).toBeInTheDocument();

    // Save: the seam's validation flags card 2.
    const { onSave } = MockedEditorContainer.mock.lastCall[0];
    await act(async () => {
      expect(await onSave()).toMatchObject({ persisted: false });
    });
    expect(await screen.findByText('Enter a definition')).toBeInTheDocument();
    expect(mockedApi.saveSettings).not.toHaveBeenCalled();

    // Move card 2 up, so the invalid card is now first.
    fireEvent.click(cardMenus()[1]);
    fireEvent.click(await screen.findByText('Move up'));

    const definitionInputs = screen.getAllByPlaceholderText('Enter your definition');
    expect(definitionInputs[0]).toHaveValue('');
    expect(definitionInputs[1]).toHaveValue('First definition');
    // The one error message sits inside the first card, next to the empty field.
    const message = screen.getByText('Enter a definition');
    expect(definitionInputs[0].closest('.card-definition')).toContainElement(message);
  });

  it('keeps text typed into a card with that card when it is moved', async () => {
    await renderEditorWithCardsOpen();
    const first = await screen.findByDisplayValue('First term');
    // Type without blurring: the text must still travel with the card.
    fireEvent.change(first, { target: { value: 'Edited first term' } });

    fireEvent.click(cardMenus()[0]);
    fireEvent.click(await screen.findByText('Move down'));

    const termInputs = screen.getAllByPlaceholderText('Enter your term');
    expect(termInputs[0]).toHaveValue('Second term');
    expect(termInputs[1]).toHaveValue('Edited first term');
  });
});

describe('accessible names', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue({
      data: { game_type: 'matching', cards: [{ term: 'A', definition: 'B' }] },
    });
  });

  it('names the card actions menu', async () => {
    await renderEditorWithCardsOpen();
    await screen.findByDisplayValue('A');
    expect(screen.getByRole('button', { name: 'Card actions' })).toBeInTheDocument();
  });

  it('labels the term and definition fields', async () => {
    await renderEditorWithCardsOpen();
    await screen.findByDisplayValue('A');
    expect(screen.getByLabelText('Term')).toHaveValue('A');
    expect(screen.getByLabelText('Definition')).toHaveValue('B');
  });
});

describe('card heading controls', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue({
      data: { game_type: 'matching', cards: [{ term: 'a', definition: 'b' }] },
    });
  });

  // The card menu once sat inside the collapsible trigger, so opening it
  // also toggled the card. The menu must open on its own.
  it('opens the card menu without collapsing the card', async () => {
    const user = userEvent.setup();
    await renderEditorWithCardsOpen();
    await screen.findByDisplayValue('a');
    await user.click(screen.getByRole('button', { name: 'Card actions' }));
    expect(await screen.findByText('Delete')).toBeInTheDocument();
    expect(screen.getByDisplayValue('a')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Collapse card' })).toBeInTheDocument();
  });

  // A loaded card starts collapsed: the row shows the one-line preview and the
  // fields mount only when the author opens it, from the chevron or the heading.
  it('starts a loaded card collapsed and expands it from the chevron and the heading', async () => {
    const user = userEvent.setup();
    renderEditor();
    // The preview is the collapsed row's content; the fields are not mounted.
    expect(await screen.findByText('a')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('a')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Expand card' }));

    expect(screen.getByDisplayValue('a')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Collapse card' })).toBeInTheDocument();

    // The heading is the only control that reports the expanded state.
    await user.click(screen.getByRole('button', { expanded: true }));
    await waitFor(() => expect(screen.queryByDisplayValue('a')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Expand card' })).toBeInTheDocument();
  });
});

describe('image settings while a save is in flight', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue({
      data: {
        game_type: 'flashcards',
        cards: [{ term: 't', definition: 'd', term_image: 'http://x/i.png', term_image_alt: 'old alt' }],
      },
    });
    mockedApi.saveSettings.mockReturnValue(new Promise(() => {})); // never settles
  });

  // A native button gives keyboard activation and the button role for free;
  // a div with role="button" has to re-implement both by hand.
  it('renders the image settings trigger as a native button', async () => {
    await renderEditorWithCardsOpen();
    expect(await screen.findByDisplayValue('t')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Image settings' }).tagName).toBe('BUTTON');
  });

  // The modal sits outside the disabled fieldset. An alt-text change made
  // while the request is out is not in the payload and is lost on close.
  it('cannot be opened once Save has been clicked', async () => {
    await renderEditorWithCardsOpen();
    expect(await screen.findByDisplayValue('t')).toBeInTheDocument();
    const { onSave } = MockedEditorContainer.mock.lastCall[0];
    act(() => {
      void onSave();
    });
    await waitFor(() => expect(mockedApi.saveSettings).toHaveBeenCalled());

    // The trigger is named by the image inside it.
    fireEvent.click(screen.getByRole('button', { name: 'Image settings' }));
    expect(screen.queryByText('Image Settings')).not.toBeInTheDocument();
  });

  it('is not in the document until an image is clicked, and leaves it on Save', async () => {
    const user = userEvent.setup();
    await renderEditorWithCardsOpen();
    expect(await screen.findByDisplayValue('t')).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Image Settings' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Image settings' }));
    const dialog = await screen.findByRole('dialog', { name: 'Image Settings' });
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Image Settings' })).not.toBeInTheDocument());
  });

  it('can be opened before Save is clicked', async () => {
    await renderEditorWithCardsOpen();
    expect(await screen.findByDisplayValue('t')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Image settings' }));
    expect(await screen.findByText('Image Settings')).toBeInTheDocument();
  });

  // Save can be clicked while the modal is already open. Its own Save must
  // then be disabled, and its callback must not write into the card either.
  it('cannot save alt text from a modal that was open when Save was clicked', async () => {
    await renderEditorWithCardsOpen();
    expect(await screen.findByDisplayValue('t')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Image settings' }));
    const dialog = await screen.findByRole('dialog', { name: 'Image Settings' });
    const modalSave = within(dialog).getByRole('button', { name: 'Save' });
    expect(modalSave).toBeEnabled();

    const { onSave } = MockedEditorContainer.mock.lastCall[0];
    act(() => {
      void onSave();
    });
    await waitFor(() => expect(mockedApi.saveSettings).toHaveBeenCalled());

    expect(within(dialog).getByRole('button', { name: 'Save' })).toBeDisabled();
  });
});

// The Studio endpoint is part of what a block *is* to this editor. Changing it
// with the same block id must start over, as a block change does; otherwise
// the previous server's cards stay loaded and saveable to the new one.
describe('changing the Studio endpoint for the same block', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.saveSettings.mockResolvedValue({ data: { success: true } });
  });

  it('drops the previous endpoint state and refuses to save until the new fetch lands', async () => {
    mockedApi.getSettings.mockResolvedValueOnce({
      data: { game_type: 'matching', cards: [{ term: 'old server', definition: 'd' }] },
    });
    await renderEditorWithCardsOpen({}, { studioEndpointUrl: 'http://a' });
    expect(await screen.findByDisplayValue('old server')).toBeInTheDocument();

    mockedApi.getSettings.mockReturnValueOnce(new Promise(() => {})); // new server never answers
    reinitialize({ studioEndpointUrl: 'http://b' });
    await waitFor(() => expect(mockedApi.getSettings).toHaveBeenCalledTimes(2));

    expect(screen.queryByDisplayValue('old server')).not.toBeInTheDocument();
    const { onSave } = MockedEditorContainer.mock.lastCall[0];
    expect(await onSave()).toMatchObject({
      persisted: false,
      error: expect.objectContaining({ message: expect.stringMatching(/not loaded/) }),
    });
    expect(mockedApi.saveSettings).not.toHaveBeenCalled();
  });
});

describe('images without alt text', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue({
      data: {
        game_type: 'flashcards',
        cards: [{ term: 't', definition: 'd', term_image: '/media/i.png', term_image_alt: '' }],
      },
    });
  });

  // The block shows learners the card's text as the alt of an image that has
  // none; the editor's preview does the same, so what the author sees matches.
  it('falls back to the card text as the alt of an image with none, as the block does', async () => {
    await renderEditorWithCardsOpen();
    expect(await screen.findByDisplayValue('t')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 't' })).toBeInTheDocument();
    expect(screen.queryByText('Term image')).not.toBeInTheDocument();
  });

  // The trigger is named by its own label, not by the image inside it.
  it('names the image-settings trigger independently of the image', async () => {
    await renderEditorWithCardsOpen();
    expect(await screen.findByDisplayValue('t')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Image settings' })).toBeInTheDocument();
  });

  // A relative URL from the block is shown from the block's Studio, but is
  // stored and saved as it came, so learner content never names the host.
  it('shows a relative image URL from the Studio host but keeps it relative in the content', async () => {
    await renderEditorWithCardsOpen();
    expect(await screen.findByDisplayValue('t')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 't' })).toHaveAttribute('src', 'http://studio/media/i.png');
    expect(latestContainerProps().getContent().cards[0].term_image).toBe('/media/i.png');
  });
});

describe('settings are always loaded fresh', () => {
  beforeEach(() => {
    initializeMocks();
  });

  const settings = (term: string) => ({
    data: { game_type: 'flashcards', cards: [{ term, definition: 'd' }] },
  });

  // A cached response must never stand in for the block's current settings:
  // reopening the editor after a save would otherwise show the old cards.
  it('fetches again when the same block is opened a second time', async () => {
    mockedApi.getSettings.mockResolvedValueOnce(settings('Before the save'));
    const first = await renderEditorWithCardsOpen();
    expect(await screen.findByDisplayValue('Before the save')).toBeInTheDocument();
    first.unmount();

    mockedApi.getSettings.mockResolvedValueOnce(settings('After the save'));
    await renderEditorWithCardsOpen();
    expect(await screen.findByDisplayValue('After the save')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Before the save')).not.toBeInTheDocument();
    expect(mockedApi.getSettings).toHaveBeenCalledTimes(2);
  });

  // Fresh server data goes through the `loaded` action, which replaces the
  // card list. Anything that refetches in the background would wipe the
  // author's unsaved work.
  it('does not refetch, or lose edits, when the window regains focus', async () => {
    mockedApi.getSettings.mockResolvedValue(settings('From the server'));
    await renderEditorWithCardsOpen();
    const term = await screen.findByDisplayValue('From the server');
    fireEvent.change(term, { target: { value: 'Typed by the author' } });
    fireEvent.blur(term);

    act(() => {
      focusManager.setFocused(false);
      focusManager.setFocused(true);
    });
    await act(async () => {});

    expect(mockedApi.getSettings).toHaveBeenCalledTimes(1);
    expect(screen.getByDisplayValue('Typed by the author')).toBeInTheDocument();
    focusManager.setFocused(undefined);
  });
});

// React Query's default is to hold a request while the browser is offline and
// send it when the connection returns, even if the component is long gone. For
// this editor that is wrong in both directions: requests must go out (and fail)
// at once, exactly as a plain HTTP call would.
describe('while the browser is offline', () => {
  const saveArgs = { title: 'Games' };

  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue({ data: { game_type: 'flashcards', cards: [] } });
  });

  afterEach(() => {
    onlineManager.setOnline(true);
  });

  // The sequence that matters: Save while offline, give up, close the editor
  // and discard. The save must already have failed by then. If it were queued
  // instead, it would go out on reconnect and persist what the author threw away.
  it('fails a save at once, and sends nothing later when the connection returns', async () => {
    const { result, unmount } = renderGameState();
    await waitFor(() => expect(result.current.state.isLoaded).toBe(true));

    act(() => onlineManager.setOnline(false));
    mockedApi.saveSettings.mockRejectedValue(new Error('Network Error'));
    let outcome: unknown;
    await act(async () => {
      outcome = await result.current.actions.save(saveArgs).catch((error: Error) => error);
    });
    expect(mockedApi.saveSettings).toHaveBeenCalledTimes(1);
    expect(outcome).toEqual(new Error('Network Error'));

    unmount();
    mockedApi.saveSettings.mockResolvedValue({ data: { success: true } });
    await act(async () => {
      onlineManager.setOnline(true);
    });
    expect(mockedApi.saveSettings).toHaveBeenCalledTimes(1);
  });

  it('fails an image upload at once instead of queueing it', async () => {
    const { result } = renderGameState();
    await waitFor(() => expect(result.current.state.isLoaded).toBe(true));

    // The loaded block has no cards, so the author makes the one they upload to.
    act(() => result.current.actions.addCard());
    act(() => onlineManager.setOnline(false));
    mockedApi.uploadImage.mockRejectedValue(new Error('Network Error'));
    await act(async () => {
      await result.current.actions.uploadGameImage({
        cardId: result.current.state.list[0].id,
        imageFile: new File(['x'], 'x.png', { type: 'image/png' }),
        imageType: 'term',
      });
    });
    expect(mockedApi.uploadImage).toHaveBeenCalledTimes(1);
    expect(result.current.state.error).toEqual(new Error('Network Error'));
  });

  // Queued, the load would sit on its spinner with no way out.
  it('reports a failed load, with its retry, instead of waiting for a connection', async () => {
    onlineManager.setOnline(false);
    mockedApi.getSettings.mockReset();
    mockedApi.getSettings.mockRejectedValue(new Error('Network Error'));
    const { result } = renderGameState();
    await waitFor(() => expect(result.current.state.loadFailed).toBe(true));
    expect(mockedApi.getSettings).toHaveBeenCalledTimes(1);
  });
});

describe('loading', () => {
  beforeEach(() => {
    initializeMocks();
  });

  // The block's default game type is flashcards, as is this hook's initial
  // state. A response without the field must land on the same default.
  it('defaults to flashcards when the response has no game_type', async () => {
    mockedApi.getSettings.mockResolvedValue({ data: { cards: [] } });
    const { result } = renderGameState();
    await waitFor(() => expect(result.current.state.isLoaded).toBe(true));
    expect(result.current.state.type).toBe('flashcards');
  });
});

// gameContent.test.ts owns the card and deck-name rules. Only the two
// image-without-text branches it cannot reach from a blank card stay here: the
// definition side, and a side whose opposite has text.
describe('validateCards', () => {
  it('flags an image side with no text on it, whichever side it is', () => {
    const definitionOnly = { ...emptyCard(), definition_image: 'http://x/d.png' };
    expect(editorViewHooks.validateCards({ type: 'flashcards', list: [definitionOnly] }).errors)
      .toEqual({ [`${definitionOnly.id}_definition`]: 'imageWithoutText' });

    // Text on the other side does not excuse an image with none beside it.
    const definitionImage = { ...emptyCard(), term: 'a', definition_image: 'http://x/d.png' };
    const termImage = { ...emptyCard(), definition: 'b', term_image: 'http://x/t.png' };
    expect(editorViewHooks.validateCards({ type: 'flashcards', list: [definitionImage, termImage] }).errors)
      .toEqual({
        [`${definitionImage.id}_definition`]: 'imageWithoutText',
        [`${termImage.id}_term`]: 'imageWithoutText',
      });
  });
});

describe('saving before the settings have loaded', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockReturnValue(new Promise(() => {})); // never resolves
    mockedApi.saveSettings.mockResolvedValue({ data: { success: true } });
  });

  // The pre-load list is empty, and an empty list validates clean, so without
  // the seam's loaded gate a Save click would overwrite the block's real
  // content.
  it('refuses to save before the settings have loaded', async () => {
    renderEditor();
    const { onSave } = MockedEditorContainer.mock.calls[0][0];
    expect(await onSave()).toMatchObject({
      persisted: false,
      error: expect.objectContaining({ message: expect.stringMatching(/not loaded/) }),
    });
    expect(api.saveSettings).not.toHaveBeenCalled();
  });
});

// The last real render's props. React's development build also calls a
// component with no arguments to locate it for a warning's component stack;
// those probe calls are skipped.
const latestContainerProps = () => MockedEditorContainer.mock.calls.filter(([props]) => props).at(-1)[0];
const loadedSettings = {
  data: { game_type: 'flashcards', cards: [{ term: 'Photosynthesis', definition: 'How plants eat' }] },
};
// Card ids are runtime UUIDs, so a card's hidden file input is found by the
// field prefix of its id. These tests render a single card, so it is unique.
const fileInput = (imageType: ImageType) => {
  const selector = `input[type="file"][id^="${imageType}_image_upload|"]`;
  const inputs = document.querySelectorAll<HTMLInputElement>(selector);
  if (inputs.length !== 1) { throw new Error(`Expected one ${imageType} file input, found ${inputs.length}`); }
  return inputs[0];
};
const pickFile = (imageType: ImageType) =>
  fireEvent.change(fileInput(imageType), {
    target: { files: [new File(['x'], 'x.png', { type: 'image/png' })] },
  });

describe('image requests after the settings have loaded', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue(loadedSettings);
    mockedApi.saveSettings.mockResolvedValue({ data: { success: true } });
  });

  // Regression: the upload handler once closed over the pre-load list, so it
  // looked up a card id that was not there and the update was dropped. Proven
  // here by saving: only an update that reached the loaded card puts the
  // storage path in the payload.
  it('attaches an uploaded image to the loaded card, not the pre-load state', async () => {
    mockedApi.uploadImage.mockResolvedValue({ data: { success: true, url: '/media/x.png', file_path: 'games/x.png' } });
    await renderEditorWithCardsOpen();
    await screen.findByDisplayValue('Photosynthesis');

    pickFile('term');
    await waitFor(() => expect(api.uploadImage).toHaveBeenCalledTimes(1));

    await waitFor(async () => {
      await latestContainerProps().onSave();
      const [, content] = mockedApi.saveSettings.mock.calls[mockedApi.saveSettings.mock.calls.length - 1];
      expect(content.cards[0].term_image_path).toEqual('games/x.png');
    });
  });

  it('shows a dismissible error when an image upload fails', async () => {
    mockedApi.uploadImage.mockResolvedValue({ data: { success: false, error: 'too large' } });
    await renderEditorWithCardsOpen();
    await screen.findByDisplayValue('Photosynthesis');

    pickFile('term');
    expect(await screen.findByText(/last image change could not be saved/)).toBeInTheDocument();
    expect(screen.getByText('too large')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    await waitFor(() => expect(screen.queryByText('too large')).not.toBeInTheDocument());
  });

  // Browsers fire no `change` when the same file is chosen again, so an input
  // that keeps its selection cannot retry the file after a failed upload.
  // Testing Library sets `files` directly, so jsdom's `value` never reflects
  // the pick; the clear is observed on the element's own `value` setter.
  it('clears the file input once the file is read, so the same file can be chosen again', async () => {
    mockedApi.uploadImage.mockResolvedValue({ data: { success: false, error: 'too large' } });
    await renderEditorWithCardsOpen();
    await screen.findByDisplayValue('Photosynthesis');
    const input = fileInput('term');
    const setValue = jest.spyOn(input, 'value', 'set');

    pickFile('term');
    await waitFor(() => expect(api.uploadImage).toHaveBeenCalledTimes(1));
    expect(setValue).toHaveBeenCalledWith('');
  });
});

describe('unsaved-change detection', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue(loadedSettings);
  });

  it('counts a typed edit as unsaved before the field is left', async () => {
    await renderEditorWithCardsOpen();
    const input = await screen.findByDisplayValue('Photosynthesis');
    expect(latestContainerProps().isDirty()).toBe(false);

    fireEvent.change(input, { target: { value: 'Photo' } });
    await waitFor(() => expect(latestContainerProps().isDirty()).toBe(true));
  });

  it('does not arm the discard prompt just because a card was collapsed', async () => {
    await renderEditorWithCardsOpen();
    await screen.findByDisplayValue('Photosynthesis');
    fireEvent.click(screen.getByRole('button', { name: 'Collapse card' }));
    expect(latestContainerProps().isDirty()).toBe(false);
  });
});

describe('settings load failure', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('shows the error with a retry that reloads the settings', async () => {
    mockedApi.getSettings
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(loadedSettings);
    renderEditor();

    expect(await screen.findByText(/could not be loaded/)).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    await expandLoadedCards();
    expect(await screen.findByDisplayValue('Photosynthesis')).toBeInTheDocument();
    expect(api.getSettings).toHaveBeenCalledTimes(2);
  });
});

describe('saving while an image request is in flight', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue(loadedSettings);
    mockedApi.saveSettings.mockResolvedValue({ data: { success: true } });
  });

  it('waits for a pending upload and saves the card with the new image', async () => {
    let finishUpload;
    mockedApi.uploadImage.mockReturnValue(
      new Promise((resolve) => {
        finishUpload = resolve;
      }),
    );
    await renderEditorWithCardsOpen();
    await screen.findByDisplayValue('Photosynthesis');

    pickFile('term');
    await waitFor(() => expect(api.uploadImage).toHaveBeenCalledTimes(1));

    const saving = latestContainerProps().onSave();
    await act(async () => {
      await Promise.resolve();
    });
    expect(api.saveSettings).not.toHaveBeenCalled();

    await act(async () => {
      finishUpload({ data: { success: true, url: '/media/x.png', file_path: 'games/x.png' } });
      await saving;
    });
    expect(api.saveSettings).toHaveBeenCalledTimes(1);
    const [, content] = mockedApi.saveSettings.mock.calls[0];
    expect(content.cards[0].term_image_path).toEqual('games/x.png');
  });

  // Regression: a failed request used to be swallowed, so the save went ahead
  // with the old image state and closed the editor on top of the error.
  it('reports the failure, without saving or closing, when the pending upload fails', async () => {
    let finishUpload;
    mockedApi.uploadImage.mockReturnValue(
      new Promise((resolve) => {
        finishUpload = resolve;
      }),
    );
    const onClose = jest.fn();
    await renderEditorWithCardsOpen({ onClose });
    await screen.findByDisplayValue('Photosynthesis');

    pickFile('term');
    await waitFor(() => expect(api.uploadImage).toHaveBeenCalledTimes(1));

    const saving = latestContainerProps().onSave();
    let outcome;
    await act(async () => {
      finishUpload({ data: { success: false, error: 'too large' } });
      outcome = await saving;
    });
    expect(outcome).toMatchObject({ persisted: false, error: expect.objectContaining({ message: 'too large' }) });
    expect(api.saveSettings).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText('too large')).toBeInTheDocument();
  });
});

describe('cards added in the editor', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue(loadedSettings);
    mockedApi.uploadImage.mockResolvedValue({ data: { success: true, url: '/media/x.png', file_path: 'games/x.png' } });
  });

  // Regression: the card id was generated inside the reducer, which runs once
  // for the rendered state and once for the save-time mirror, so the two held
  // different ids and an upload reached the displayed card only.
  it('keeps an uploaded image on a newly added card in the state that is saved', async () => {
    const { result } = renderGameState();
    await waitFor(() => expect(result.current.state.isLoaded).toBe(true));

    act(() => result.current.actions.addCard());
    const added = result.current.state.list[1];
    expect(result.current.actions.getLatestState().list[1].id).toEqual(added.id);

    await act(async () => {
      await result.current.actions.uploadGameImage({
        cardId: added.id,
        imageFile: new File(['x'], 'x.png', { type: 'image/png' }),
        imageType: 'term',
      });
    });
    expect(result.current.state.list[1].term_image_path).toEqual('games/x.png');
    expect(result.current.actions.getLatestState().list[1].term_image_path).toEqual('games/x.png');
  });
});

describe('a save the block rejects', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue(loadedSettings);
  });

  // The block's save_settings handler reports failure as HTTP 200 with
  // `success: false`, so a resolved request is not yet a successful save.
  it('reports the block error and keeps the editor open', async () => {
    mockedApi.saveSettings.mockResolvedValue({ data: { success: false, error: 'Each card must be an object' } });
    const onClose = jest.fn();
    await renderEditorWithCardsOpen({ onClose });
    await screen.findByDisplayValue('Photosynthesis');

    await act(async () => {
      expect(await latestContainerProps().onSave()).toMatchObject({
        persisted: false,
        error: expect.objectContaining({ message: 'Each card must be an object' }),
      });
    });
    expect(onClose).not.toHaveBeenCalled();
    expect(await screen.findByText('Each card must be an object')).toBeInTheDocument();
  });
});

describe('handler failures with no detail message', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue(loadedSettings);
  });

  // The handlers report failure as `success: false`, sometimes with no `error`
  // text. The editor must not fall back to an untranslated string.
  it('shows a translated heading for a failed upload, not the English fallback', async () => {
    mockedApi.uploadImage.mockResolvedValue({ data: { success: false } });
    await renderEditorWithCardsOpen();
    await screen.findByDisplayValue('Photosynthesis');

    pickFile('term');
    expect(await screen.findByText('The last image change could not be saved.')).toBeInTheDocument();
    expect(screen.queryByText('Upload failed')).not.toBeInTheDocument();
  });

  it('shows the save heading for a failed save, not the image one or the English fallback', async () => {
    mockedApi.saveSettings.mockResolvedValue({ data: { success: false } });
    await renderEditorWithCardsOpen();
    await screen.findByDisplayValue('Photosynthesis');

    await act(async () => {
      // No server detail, so the error carries only its code.
      expect(await latestContainerProps().onSave()).toMatchObject({
        persisted: false,
        error: expect.objectContaining({ code: 'saveFailed', message: '' }),
      });
    });
    expect(await screen.findByText('The game could not be saved.')).toBeInTheDocument();
    expect(screen.queryByText('Save failed')).not.toBeInTheDocument();
    expect(screen.queryByText(/image change/)).not.toBeInTheDocument();
  });

  it('keeps the server detail under the save heading when there is one', async () => {
    mockedApi.saveSettings.mockResolvedValue({ data: { success: false, error: 'Each card must be an object' } });
    await renderEditorWithCardsOpen();
    await screen.findByDisplayValue('Photosynthesis');

    await act(async () => {
      expect(await latestContainerProps().onSave()).toMatchObject({
        persisted: false,
        error: expect.objectContaining({ message: 'Each card must be an object' }),
      });
    });
    expect(await screen.findByText('The game could not be saved.')).toBeInTheDocument();
    expect(screen.getByText('Each card must be an object')).toBeInTheDocument();
  });
});

describe('validation after a pending upload', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue({ data: { game_type: 'flashcards', cards: [] } });
    mockedApi.saveSettings.mockResolvedValue({ data: { success: true } });
  });

  // Regression: the card validated clean at the Save click, before the upload
  // landed, and was image-only by the time the save went out.
  it('refuses to save an image-only card the upload produced', async () => {
    let finishUpload;
    mockedApi.uploadImage.mockReturnValue(
      new Promise((resolve) => {
        finishUpload = resolve;
      }),
    );
    const onClose = jest.fn();
    const user = userEvent.setup();
    renderEditor({ onClose });
    // A loaded block with no cards offers only its Add button: the author
    // creates the card they fill in; the load ships no draft to type into.
    await user.click(await screen.findByRole('button', { name: 'Add card' }));
    expect(screen.getAllByPlaceholderText('Enter your term')).toHaveLength(1);

    pickFile('term');
    await waitFor(() => expect(api.uploadImage).toHaveBeenCalledTimes(1));

    const saving = latestContainerProps().onSave();
    let outcome;
    await act(async () => {
      finishUpload({ data: { success: true, url: '/media/x.png', file_path: 'games/x.png' } });
      outcome = await saving;
    });
    expect(outcome).toMatchObject({ persisted: false });
    expect(api.saveSettings).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(await screen.findByText('Text is required for flashcard images.')).toBeInTheDocument();
  });
});

describe('validation with text not yet blurred', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue({
      data: { game_type: 'matching', cards: [{ term: 'a', definition: '' }] },
    });
  });

  // Safari, and Firefox on macOS, do not blur the focused field when Save is
  // clicked, so validation can run before the field is left. It must validate
  // what the author sees.
  it('accepts a field the author has filled in but not left', async () => {
    await renderEditorWithCardsOpen();
    await screen.findByDisplayValue('a');
    fireEvent.change(screen.getByLabelText('Definition'), { target: { value: 'b' } });
    expect(await latestContainerProps().onSave()).toMatchObject({ persisted: true });
  });

  it('reports a field the author has just cleared but not left', async () => {
    mockedApi.getSettings.mockResolvedValue({
      data: { game_type: 'matching', cards: [{ term: 'a', definition: 'b' }] },
    });
    await renderEditorWithCardsOpen();
    await screen.findByDisplayValue('a');
    fireEvent.change(screen.getByLabelText('Definition'), { target: { value: '' } });
    expect(await latestContainerProps().onSave()).toMatchObject({ persisted: false });
  });
});

describe('unsaved title changes', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue(loadedSettings);
  });

  it('counts a title-only edit as dirty', async () => {
    await renderEditorWithCardsOpen();
    await screen.findByDisplayValue('Photosynthesis');
    expect(latestContainerProps().isDirty()).toBe(false);

    act(() => {
      getEditorStore().dispatch(editorActions.app.setBlockTitle('New title'));
    });
    await waitFor(() => expect(latestContainerProps().isDirty()).toBe(true));
  });
});

describe('removing a saved image', () => {
  const withImage = {
    data: {
      game_type: 'flashcards',
      cards: [{
        term: 't',
        definition: 'd',
        term_image: 'http://x/i.png',
        term_image_path: 'games/abc/hash.png',
      }],
    },
  };
  const removeImage = (result) =>
    act(() => {
      result.current.actions.deleteGameImage({
        cardId: result.current.state.list[0].id,
        imageType: 'term',
      });
    });

  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue(withImage);
    mockedApi.saveSettings.mockResolvedValue({ data: { success: true } });
  });

  // The stored file is shared by every version of the block. The draft no
  // longer pointing at it says nothing about the published version learners
  // see, and only the backend can know that, so the editor never deletes it:
  // not on removal (which "Discard changes" could not undo), not after a save.
  it('clears the card without deleting the stored file', async () => {
    const { result } = renderGameState();
    await waitFor(() => expect(result.current.state.isLoaded).toBe(true));

    removeImage(result);
    expect(result.current.state.list[0].term_image).toEqual('');
    expect(result.current.state.list[0].term_image_path).toEqual('');
    expect(result.current.state.isDirty).toBe(true);

    await act(async () => {
      await result.current.actions.save({ title: 'Games' });
    });
    // Settings load and the save: no other request, and no way to make one.
    expect(api.uploadImage).not.toHaveBeenCalled();
    expect(jest.requireActual('./data/api').deleteImage).toBeUndefined();
  });
});

describe('overlapping uploads to the same image', () => {
  const deferred = () => {
    let resolve;
    const promise = new Promise((r) => {
      resolve = r;
    });
    return { promise, resolve };
  };
  const uploaded = (name) => ({ data: { success: true, url: `/media/${name}.png`, file_path: `games/${name}.png` } });
  const file = new File(['x'], 'x.png', { type: 'image/png' });

  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue(loadedSettings);
  });

  // Regression: every response was applied, so a slow first upload finishing
  // after a second one replaced the author's latest choice.
  it('keeps the latest selection when an older upload finishes last', async () => {
    const a = deferred();
    const b = deferred();
    mockedApi.uploadImage.mockReturnValueOnce(a.promise).mockReturnValueOnce(b.promise);
    const { result } = renderGameState();
    await waitFor(() => expect(result.current.state.isLoaded).toBe(true));
    const cardId = result.current.state.list[0].id;

    act(() => {
      void result.current.actions.uploadGameImage({ cardId, imageFile: file, imageType: 'term' });
      void result.current.actions.uploadGameImage({ cardId, imageFile: file, imageType: 'term' });
    });
    await act(async () => {
      b.resolve(uploaded('b'));
      await b.promise;
      a.resolve(uploaded('a'));
      await result.current.actions.waitForPendingRequests();
    });
    expect(result.current.state.list[0].term_image_path).toEqual('games/b.png');
    expect(result.current.actions.getLatestState().list[0].term_image_path).toEqual('games/b.png');
  });

  it('ignores the failure of an upload that has been superseded', async () => {
    const a = deferred();
    mockedApi.uploadImage.mockReturnValueOnce(a.promise).mockResolvedValueOnce(uploaded('b'));
    const { result } = renderGameState();
    await waitFor(() => expect(result.current.state.isLoaded).toBe(true));
    const cardId = result.current.state.list[0].id;

    act(() => {
      void result.current.actions.uploadGameImage({ cardId, imageFile: file, imageType: 'term' });
      void result.current.actions.uploadGameImage({ cardId, imageFile: file, imageType: 'term' });
    });
    await act(async () => {
      a.resolve({ data: { success: false, error: 'too large' } });
      await result.current.actions.waitForPendingRequests();
    });
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.list[0].term_image_path).toEqual('games/b.png');
  });

  it('does not bring back an image removed while its upload was in flight', async () => {
    const a = deferred();
    mockedApi.uploadImage.mockReturnValueOnce(a.promise);
    const { result } = renderGameState();
    await waitFor(() => expect(result.current.state.isLoaded).toBe(true));
    const cardId = result.current.state.list[0].id;

    act(() => {
      void result.current.actions.uploadGameImage({ cardId, imageFile: file, imageType: 'term' });
      result.current.actions.deleteGameImage({ cardId, imageType: 'term' });
    });
    await act(async () => {
      a.resolve(uploaded('a'));
      await result.current.actions.waitForPendingRequests();
    });
    expect(result.current.state.list[0].term_image_path).toEqual('');
  });

  it('lets the two sides of a card upload independently', async () => {
    mockedApi.uploadImage.mockResolvedValueOnce(uploaded('term')).mockResolvedValueOnce(uploaded('definition'));
    const { result } = renderGameState();
    await waitFor(() => expect(result.current.state.isLoaded).toBe(true));
    const cardId = result.current.state.list[0].id;

    await act(async () => {
      void result.current.actions.uploadGameImage({ cardId, imageFile: file, imageType: 'term' });
      void result.current.actions.uploadGameImage({ cardId, imageFile: file, imageType: 'definition' });
      await result.current.actions.waitForPendingRequests();
    });
    expect(result.current.state.list[0].term_image_path).toEqual('games/term.png');
    expect(result.current.state.list[0].definition_image_path).toEqual('games/definition.png');
  });
});

describe('text typed while a save waits on an upload', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue(loadedSettings);
    mockedApi.saveSettings.mockResolvedValue({ data: { success: true } });
  });

  // Regression: text typed while the save waited on an upload was dropped and
  // the editor closed on top of it. The save must read the state as it stands
  // once the upload settles.
  it('is included in what gets saved', async () => {
    let finishUpload;
    mockedApi.uploadImage.mockReturnValue(
      new Promise((resolve) => {
        finishUpload = resolve;
      }),
    );
    await renderEditorWithCardsOpen();
    const term = await screen.findByDisplayValue('Photosynthesis');

    pickFile('term');
    await waitFor(() => expect(api.uploadImage).toHaveBeenCalledTimes(1));

    const saving = latestContainerProps().onSave();
    fireEvent.change(term, { target: { value: 'Typed during the wait' } }); // no blur

    await act(async () => {
      finishUpload({ data: { success: true, url: '/media/x.png', file_path: 'games/x.png' } });
      await saving;
    });
    const [, content] = mockedApi.saveSettings.mock.calls[0];
    expect(content.cards[0].term).toEqual('Typed during the wait');
    expect(content.cards[0].term_image_path).toEqual('games/x.png');
  });
});

describe('saving from the standalone editor route', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue(loadedSettings);
    mockedApi.saveSettings.mockResolvedValue({ data: { success: true } });
  });

  // That route passes neither `returnFunction` nor `onClose`. The built-in
  // save falls back to the return URL there, and so must this one.
  it('navigates to the return URL after a save', async () => {
    const navigateTo = jest.spyOn(editorHooks, 'navigateTo').mockImplementation(() => {});
    await renderEditorWithCardsOpen({ onClose: null });
    await screen.findByDisplayValue('Photosynthesis');

    await act(async () => {
      await latestContainerProps().onSave();
    });
    expect(navigateTo).toHaveBeenCalledTimes(1);
    expect(navigateTo).toHaveBeenCalledWith(`http://studio/container/unit-1#${blockId}`);
    navigateTo.mockRestore();
  });

  // The standalone route initialises the store without an endpoint.
  it('falls back to the configured Studio when the store has no endpoint', async () => {
    await renderEditorWithCardsOpen({ onClose: null }, { studioEndpointUrl: null });
    await waitFor(() => expect(mockedApi.getSettings).toHaveBeenCalled());
    expect(mockedApi.getSettings).toHaveBeenCalledWith(
      expect.objectContaining({ studioEndpointUrl: getConfig().STUDIO_BASE_URL }),
    );
  });

  it('does not navigate when the page supplied a way to close', async () => {
    const navigateTo = jest.spyOn(editorHooks, 'navigateTo').mockImplementation(() => {});
    const onClose = jest.fn();
    await renderEditorWithCardsOpen({ onClose });
    await screen.findByDisplayValue('Photosynthesis');

    await act(async () => {
      await latestContainerProps().onSave();
    });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(navigateTo).not.toHaveBeenCalled();
    navigateTo.mockRestore();
  });
});

describe('a save still waiting when the editor goes away', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue(loadedSettings);
    mockedApi.saveSettings.mockResolvedValue({ data: { success: true } });
  });

  // Regression: Save during an upload, then Cancel -> Discard changes. The
  // editor unmounted but the waiting save carried on and persisted the very
  // changes the author had just discarded.
  it('does not persist once the editor has unmounted', async () => {
    let finishUpload;
    mockedApi.uploadImage.mockReturnValue(
      new Promise((resolve) => {
        finishUpload = resolve;
      }),
    );
    const onClose = jest.fn();
    const { unmount } = await renderEditorWithCardsOpen({ onClose });
    await screen.findByDisplayValue('Photosynthesis');

    pickFile('term');
    await waitFor(() => expect(api.uploadImage).toHaveBeenCalledTimes(1));

    const saving = latestContainerProps().onSave();
    unmount();

    await act(async () => {
      finishUpload({ data: { success: true, url: '/media/x.png', file_path: 'games/x.png' } });
      expect(await saving).toMatchObject({
        persisted: false,
        error: expect.objectContaining({ message: expect.stringMatching(/closed/i) }),
      });
    });
    expect(api.saveSettings).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('a save response arriving after the editor has gone away', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue(loadedSettings);
  });

  // Regression: the request was already out when the author closed this editor
  // and opened another. The late response still ran this editor's close
  // callback, which by then closes the *other* editor and loses its edits.
  it.each([
    ['onClose', (spies) => ({ onClose: spies.onClose })],
    ['returnFunction', (spies) => ({ returnFunction: spies.returnFunction })],
    ['the return URL', () => ({})],
  ])('does not close or navigate through %s', async (_name, propsFor) => {
    let finishSave;
    mockedApi.saveSettings.mockReturnValue(
      new Promise((resolve) => {
        finishSave = resolve;
      }),
    );
    const afterSave = jest.fn();
    const spies = { onClose: jest.fn(), returnFunction: jest.fn(() => afterSave) };
    const navigateTo = jest.spyOn(editorHooks, 'navigateTo').mockImplementation(() => {});
    const { unmount } = await renderEditorWithCardsOpen({ onClose: null, ...propsFor(spies) });
    await screen.findByDisplayValue('Photosynthesis');

    const saving = latestContainerProps().onSave();
    await waitFor(() => expect(api.saveSettings).toHaveBeenCalledTimes(1));
    unmount();

    await act(async () => {
      finishSave({ data: { success: true } });
      await saving;
    });
    expect(spies.onClose).not.toHaveBeenCalled();
    expect(spies.returnFunction).not.toHaveBeenCalled();
    expect(afterSave).not.toHaveBeenCalled();
    expect(navigateTo).not.toHaveBeenCalled();
    navigateTo.mockRestore();
  });
});

describe('switching to another block without remounting', () => {
  const otherBlockId = 'block-v1:org+course+run+type@games+block@other';

  beforeEach(() => {
    initializeMocks();
    mockedApi.saveSettings.mockResolvedValue({ data: { success: true } });
  });

  // Regression: the previous block's cards stayed loaded until the new fetch
  // resolved, so a save in that window wrote them over the new block.
  it('drops the previous block state until the new block has loaded', async () => {
    mockedApi.getSettings
      .mockResolvedValueOnce(loadedSettings)
      .mockReturnValueOnce(new Promise(() => {})); // second block never loads
    await renderEditorWithCardsOpen();
    await screen.findByDisplayValue('Photosynthesis');

    reinitialize({ blockId: otherBlockId });
    await waitFor(() =>
      expect(api.getSettings).toHaveBeenLastCalledWith(expect.objectContaining({ blockId: otherBlockId }))
    );

    expect(screen.queryByDisplayValue('Photosynthesis')).not.toBeInTheDocument();
    expect(await latestContainerProps().onSave()).toMatchObject({
      persisted: false,
      error: expect.objectContaining({ message: expect.stringMatching(/not loaded/) }),
    });
    expect(api.saveSettings).not.toHaveBeenCalled();
  });
});

describe('a title changed while a save waits on an upload', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue(loadedSettings);
    mockedApi.saveSettings.mockResolvedValue({ data: { success: true } });
  });

  // Regression: the title was captured at the Save click, so one typed during
  // the wait was dropped and the editor closed on top of it.
  it('is the title that gets saved', async () => {
    let finishUpload;
    mockedApi.uploadImage.mockReturnValue(
      new Promise((resolve) => {
        finishUpload = resolve;
      }),
    );
    await renderEditorWithCardsOpen();
    await screen.findByDisplayValue('Photosynthesis');

    pickFile('term');
    await waitFor(() => expect(api.uploadImage).toHaveBeenCalledTimes(1));

    const saving = latestContainerProps().onSave();
    act(() => {
      getEditorStore().dispatch(editorActions.app.setBlockTitle('Typed during the wait'));
    });

    await act(async () => {
      finishUpload({ data: { success: true, url: '/media/x.png', file_path: 'games/x.png' } });
      await saving;
    });
    const [, content] = mockedApi.saveSettings.mock.calls[0];
    expect(content.title).toEqual('Typed during the wait');
  });
});

describe('while the save request is out', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue(loadedSettings);
  });

  // Regression: the inputs stayed editable during the request and the
  // response closed the editor regardless, so anything typed meanwhile was
  // silently lost.
  it('disables editing, and re-enables it if the save fails', async () => {
    let finishSave;
    mockedApi.saveSettings.mockReturnValue(
      new Promise((resolve) => {
        finishSave = resolve;
      }),
    );
    await renderEditorWithCardsOpen();
    const term = await screen.findByDisplayValue('Photosynthesis');
    expect(term).toBeEnabled();

    const saving = latestContainerProps().onSave();
    await waitFor(() => expect(term).toBeDisabled());
    expect(screen.getByRole('button', { name: /^add card$/i })).toBeDisabled();

    let outcome;
    await act(async () => {
      finishSave({ data: { success: false, error: 'nope' } });
      outcome = await saving;
    });
    expect(outcome).toMatchObject({ persisted: false, error: expect.objectContaining({ message: 'nope' }) });
    await waitFor(() => expect(term).toBeEnabled());
  });

  // The container only stops warning once the save has resolved, but the
  // editor navigates away (a beforeunload) before that. So it must report
  // itself clean as soon as the block has accepted the save.
  it('reports no unsaved changes once the block has accepted the save', async () => {
    mockedApi.saveSettings.mockResolvedValue({ data: { success: true } });
    let dirtyAtClose = null;
    const onClose = jest.fn(() => {
      dirtyAtClose = latestContainerProps().isDirty();
    });
    await renderEditorWithCardsOpen({ onClose });
    const term = await screen.findByDisplayValue('Photosynthesis');
    fireEvent.change(term, { target: { value: 'Edited' } });
    fireEvent.blur(term);
    await waitFor(() => expect(latestContainerProps().isDirty()).toBe(true));

    await act(async () => {
      await latestContainerProps().onSave();
    });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(dirtyAtClose).toBe(false);
  });
});

describe('an upload still in flight', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue(loadedSettings);
  });

  // Regression: the state only became dirty when the upload succeeded, so
  // picking an image and cancelling straight away closed without a prompt.
  it('counts as an unsaved change from the moment it starts', async () => {
    mockedApi.uploadImage.mockReturnValue(new Promise(() => {}));
    const { result } = renderGameState();
    await waitFor(() => expect(result.current.state.isLoaded).toBe(true));
    expect(result.current.state.isDirty).toBe(false);

    act(() => {
      void result.current.actions.uploadGameImage({
        cardId: result.current.state.list[0].id,
        imageFile: new File(['x'], 'x.png', { type: 'image/png' }),
        imageType: 'term',
      });
    });
    expect(result.current.state.isDirty).toBe(true);
  });
});

// Text goes straight into the game state on every keystroke. There is no
// second, blur-committed copy, so tabbing out has nothing left to swap in:
// that swap, one render behind, was the flicker on tab-out.
describe('typing into a card', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue({
      data: { game_type: 'matching', cards: [{ term: 'Photosynthesis', definition: 'How plants eat' }] },
    });
  });

  it('is in the game state immediately, without a blur', async () => {
    const user = userEvent.setup();
    await renderEditorWithCardsOpen();
    const term = await screen.findByLabelText('Term');
    await user.type(term, '!');
    // getContent reads the store state the view rendered from, not a local buffer.
    expect(latestContainerProps().getContent().cards[0].term).toBe('Photosynthesis!');
  });

  it('keeps the same input, with the same value, when the field is tabbed out of', async () => {
    const user = userEvent.setup();
    await renderEditorWithCardsOpen();
    const term = await screen.findByLabelText('Term');
    await user.type(term, '!');
    await user.tab();
    const after = screen.getByLabelText('Term');
    expect(after).toBe(term);
    expect(after).toHaveValue('Photosynthesis!');
  });
});

describe('settings in the sidebar', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue({
      data: { game_type: 'matching', is_shuffled: false, has_timer: false, cards: [{ term: 'a', definition: 'b' }] },
    });
  });

  it('changes shuffle, timer and game type', async () => {
    const user = userEvent.setup();
    await renderEditorWithCardsOpen();
    await screen.findByDisplayValue('a');
    const content = () => latestContainerProps().getContent();

    await user.click(screen.getByText('Shuffle'));
    await user.click(screen.getByRole('button', { name: 'On' }));
    expect(content().isShuffled).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Off' }));
    expect(content().isShuffled).toBe(false);
    await user.click(screen.getByText('Shuffle'));

    await user.click(screen.getByText('Timer'));
    await user.click(screen.getByRole('button', { name: 'On' }));
    expect(content().hasTimer).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Off' }));
    expect(content().hasTimer).toBe(false);

    await user.click(screen.getByText('Type'));
    await user.click(screen.getByRole('button', { name: 'Flashcards' }));
    expect(content().gameType).toBe('flashcards');
    await user.click(screen.getByRole('button', { name: 'Matching' }));
    expect(content().gameType).toBe('matching');
  });
});

describe('card list controls', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue({
      data: { game_type: 'matching', cards: [{ term: 'First', definition: '1' }, { term: 'Second', definition: '2' }] },
    });
  });

  const terms = () =>
    screen.getAllByPlaceholderText('Enter your term').map((input) => (input as HTMLInputElement).value);

  it('adds an empty card at the end', async () => {
    const user = userEvent.setup();
    await renderEditorWithCardsOpen();
    await screen.findByDisplayValue('First');
    await user.click(screen.getByRole('button', { name: 'Add card' }));
    expect(terms()).toEqual(['First', 'Second', '']);
  });

  // The cards' own action menus, in list order. A blank draft has no drag
  // handle, so its row is found from its menu rather than by card name.
  const cardMenus = () => screen.getAllByRole('button', { name: 'Card actions' });
  const cardAt = (index: number) => cardMenus()[index].closest('.card') as HTMLElement;
  // A menu item is an anchor with role="button": disabled, it says so with
  // aria-disabled rather than the `disabled` attribute.
  const moveItem = (index: number, label: 'Move up' | 'Move down') =>
    within(cardAt(index)).getByRole('button', { name: label });

  // A matching game's visible list is its whole list, so the first card has
  // nowhere above it and the last nowhere below: those items say so, rather
  // than accepting a click that could only fail.
  it('disables moving the first card up and the last card down', async () => {
    const user = userEvent.setup();
    await renderEditorWithCardsOpen();
    await screen.findByDisplayValue('First');

    await user.click(cardMenus()[0]);
    expect(moveItem(0, 'Move up')).toHaveAttribute('aria-disabled', 'true');
    expect(moveItem(0, 'Move down')).not.toHaveAttribute('aria-disabled', 'true');

    await user.click(cardMenus()[1]);
    expect(moveItem(1, 'Move down')).toHaveAttribute('aria-disabled', 'true');
    expect(moveItem(1, 'Move up')).not.toHaveAttribute('aria-disabled', 'true');
  });

  // The card an author adds is a blank draft, not a card to move: it has no
  // drag handle, and neither menu move offers to send it anywhere, even though
  // the cards above it can still move.
  it('disables both moves on a newly added blank draft with cards above it', async () => {
    const user = userEvent.setup();
    await renderEditorWithCardsOpen();
    await screen.findByDisplayValue('First');
    await user.click(screen.getByRole('button', { name: 'Add card' }));
    expect(terms()).toEqual(['First', 'Second', '']);

    await user.click(cardMenus()[2]);
    expect(moveItem(2, 'Move up')).toHaveAttribute('aria-disabled', 'true');
    expect(moveItem(2, 'Move down')).toHaveAttribute('aria-disabled', 'true');

    // The real card above the draft row cannot move down past it: the draft is
    // not saved, so that move would leave the saved order exactly as it is.
    await user.click(cardMenus()[1]);
    expect(moveItem(1, 'Move down')).toHaveAttribute('aria-disabled', 'true');
    // Upwards still changes the saved order, so that way stays open.
    expect(moveItem(1, 'Move up')).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('reorders cards by keyboard drag', async () => {
    await renderEditorWithCardsOpen();
    await screen.findByDisplayValue('First');
    const [firstId, secondId] = latestContainerProps().getContent().cards.map((c) => c.id);
    const collision = jest.mocked(verticalSortableListCollisionDetection);
    const real =
      jest.requireActual('@src/generic/DraggableList/verticalSortableList').verticalSortableListCollisionDetection;
    collision.mockReturnValue([{ id: secondId }]);
    try {
      const handle = screen.getAllByRole('button', { name: /^Reorder / })[0];
      fireEvent.keyDown(handle, { code: 'Space' });
      await act(() =>
        new Promise((resolve) => {
          setTimeout(resolve, 1);
        })
      );
      fireEvent.keyDown(handle, { code: 'Space' });

      // The drag collapses the card it picked up, and the drop leaves it
      // collapsed: its fields leave the DOM once Paragon's exit transition ends.
      // Reading every input would still see the exiting one, so it proves
      // nothing about the state the drop settled in.
      await waitFor(() => expect(screen.queryByDisplayValue('First')).not.toBeInTheDocument());
      expect(within(cardRoot('First')).getByRole('button', { name: 'Expand card' })).toBeInTheDocument();
      // The order the drop committed is the order the block would save.
      expect(latestContainerProps().getContent().cards.map((c) => c.id)).toEqual([secondId, firstId]);
    } finally {
      collision.mockImplementation(real);
    }
  });
});

describe('image controls on a card', () => {
  const withImages = {
    data: {
      game_type: 'flashcards',
      cards: [{
        term: 't',
        definition: 'd',
        term_image: 'http://x/t.png',
        term_image_path: 'games/abc/t.png',
        definition_image: 'http://x/d.png',
        definition_image_path: 'games/abc/d.png',
        definition_image_alt: 'old alt',
      }],
    },
  };

  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue(withImages);
  });

  it('removes an image with its button', async () => {
    const user = userEvent.setup();
    await renderEditorWithCardsOpen();
    await screen.findByDisplayValue('t');
    await user.click(screen.getAllByRole('button', { name: 'Remove image' })[0]);
    const [cardContent] = latestContainerProps().getContent().cards;
    expect(cardContent.term_image).toBe('');
    expect(cardContent.term_image_path).toBe('');
  });

  it('opens the file picker from the add-image button', async () => {
    mockedApi.getSettings.mockResolvedValue(loadedSettings);
    const user = userEvent.setup();
    const click = jest.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
    try {
      await renderEditorWithCardsOpen();
      await screen.findByDisplayValue('Photosynthesis');
      await user.click(screen.getAllByRole('button', { name: 'Add image' })[1]);
      expect(click).toHaveBeenCalledTimes(1);
      expect(click.mock.contexts[0]).toBe(fileInput('definition'));
    } finally {
      click.mockRestore();
    }
  });

  it('uploads an image to the definition side', async () => {
    mockedApi.getSettings.mockResolvedValue(loadedSettings);
    mockedApi.uploadImage.mockResolvedValue({
      data: { success: true, url: '/media/d.png', file_path: 'games/abc/new.png' },
    });
    await renderEditorWithCardsOpen();
    await screen.findByDisplayValue('Photosynthesis');
    pickFile('definition');
    await waitFor(() =>
      expect(latestContainerProps().getContent().cards[0].definition_image_path).toBe('games/abc/new.png')
    );
    // The URL is kept as the handler returned it: learner content must not
    // point at the Studio host. It is made absolute only for display.
    expect(latestContainerProps().getContent().cards[0].definition_image).toBe('/media/d.png');
    expect(screen.getByRole('button', { name: 'Image settings' }).querySelector('img'))
      .toHaveAttribute('src', 'http://studio/media/d.png');
  });

  // The alt text described the previous picture. A new one must not inherit it.
  it('clears the alt text when a new image replaces the old one', async () => {
    mockedApi.getSettings.mockResolvedValue({
      data: {
        game_type: 'flashcards',
        cards: [{
          term: 'Photosynthesis',
          definition: 'd',
          definition_image: '/media/old.png',
          definition_image_alt: 'old alt',
        }],
      },
    });
    mockedApi.uploadImage.mockResolvedValue({
      data: { success: true, url: '/media/new.png', file_path: 'games/abc/new.png' },
    });
    await renderEditorWithCardsOpen();
    await screen.findByDisplayValue('Photosynthesis');
    pickFile('definition');
    await waitFor(() => expect(latestContainerProps().getContent().cards[0].definition_image).toBe('/media/new.png'));
    expect(latestContainerProps().getContent().cards[0].definition_image_alt).toBe('');
  });

  it.each(['{Enter}', ' '])('opens image settings from the keyboard with %j', async (key) => {
    const user = userEvent.setup();
    await renderEditorWithCardsOpen();
    await screen.findByDisplayValue('t');
    screen.getAllByRole('button', { name: 'Image settings' })[0].focus();
    await user.keyboard(key);
    expect(await screen.findByRole('dialog', { name: 'Image Settings' })).toBeInTheDocument();
  });

  it('saves new alt text for the definition image', async () => {
    const user = userEvent.setup();
    await renderEditorWithCardsOpen();
    await screen.findByDisplayValue('t');
    await user.click(screen.getAllByRole('button', { name: 'Image settings' })[1]);
    const dialog = await screen.findByRole('dialog', { name: 'Image Settings' });
    const altInput = within(dialog).getByDisplayValue('old alt');
    await user.clear(altInput);
    await user.type(altInput, 'A leaf');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(latestContainerProps().getContent().cards[0].definition_image_alt).toBe('A leaf'));
  });
});

describe('validation feedback', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue({
      data: { game_type: 'matching', cards: [{ term: 'a', definition: '' }] },
    });
  });

  it('opens a collapsed card that has an error, and the alert can be dismissed', async () => {
    const user = userEvent.setup();
    await renderEditorWithCardsOpen();
    await screen.findByDisplayValue('a');
    await user.click(screen.getByRole('button', { name: 'Collapse card' }));
    await waitFor(() => expect(screen.queryByDisplayValue('a')).not.toBeInTheDocument());

    await act(async () => {
      expect(await latestContainerProps().onSave()).toMatchObject({ persisted: false });
    });
    // The invalid card is expanded again so the flagged field can be seen.
    expect(await screen.findByDisplayValue('a')).toBeInTheDocument();
    expect(screen.getByText('Enter a definition')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByText('We couldn\'t save your changes.')).not.toBeInTheDocument();
  });
});

describe('after a successful save', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue(loadedSettings);
    mockedApi.saveSettings.mockResolvedValue({ data: { success: true } });
  });

  it('hands the response to returnFunction when one is given', async () => {
    const afterSave = jest.fn();
    await renderEditorWithCardsOpen({ onClose: null, returnFunction: () => afterSave });
    await screen.findByDisplayValue('Photosynthesis');
    await act(async () => {
      await latestContainerProps().onSave();
    });
    expect(afterSave).toHaveBeenCalledWith({ success: true });
  });
});

describe('the title that gets saved', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue(loadedSettings);
    mockedApi.saveSettings.mockResolvedValue({ data: { success: true } });
  });

  // The title header commits to the store right as Save starts (on blur), so
  // the save must read the store then, not a copy taken at the last render.
  it('is the one in the store when the save starts, even before a re-render', async () => {
    await renderEditorWithCardsOpen();
    await screen.findByDisplayValue('Photosynthesis');
    const { onSave } = latestContainerProps();
    await act(async () => {
      getEditorStore().dispatch(editorActions.app.setBlockTitle('Committed as Save starts'));
      await onSave();
    });
    expect(mockedApi.saveSettings.mock.calls[0][1].title).toBe('Committed as Save starts');
  });
});

describe('save analytics', () => {
  // Only the editor save event; the platform sends its own events at start-up.
  const saveEvents = () =>
    jest.mocked(sendTrackEvent).mock.calls.filter(([name]) => name === 'edx.ui.authoring.editor.save');

  beforeEach(() => {
    initializeMocks();
    jest.mocked(sendTrackEvent).mockClear();
    mockedApi.getSettings.mockResolvedValue(loadedSettings);
  });

  // The shared save sends this event through navigateCallback; this editor's
  // own save must send it too, or Games saves vanish from tracking.
  it('sends the editor save event once the block has accepted the save', async () => {
    mockedApi.saveSettings.mockResolvedValue({ data: { success: true } });
    await renderEditorWithCardsOpen();
    await screen.findByDisplayValue('Photosynthesis');
    await act(async () => {
      await latestContainerProps().onSave();
    });
    expect(saveEvents()).toEqual([['edx.ui.authoring.editor.save', {
      blockId,
      blockType: 'games',
      learningContextId: 'course-v1:org+course+run',
    }]]);
  });

  it('sends nothing when the block rejects the save', async () => {
    mockedApi.saveSettings.mockResolvedValue({ data: { success: false, error: 'nope' } });
    await renderEditorWithCardsOpen();
    await screen.findByDisplayValue('Photosynthesis');
    await act(async () => {
      expect(await latestContainerProps().onSave()).toMatchObject({
        persisted: false,
        error: expect.objectContaining({ message: 'nope' }),
      });
    });
    expect(saveEvents()).toEqual([]);
  });
});
