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
    { initialState: { app: appState(app) } },
  );

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
    renderEditor();
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
    renderEditor();
    expect(await screen.findByDisplayValue('t')).toBeInTheDocument();
    const { onSave } = MockedEditorContainer.mock.lastCall[0];
    await onSave();
    expect(sessionStorage.getItem('courseRefreshTriggerOnComponentEditSave')).not.toBeNull();
    expect(localStorage.getItem('courseRefreshTriggerOnComponentEditSave')).toBeNull();
  });

  it('sends the card key the block loaded, so the card keeps its identity', async () => {
    renderEditor();
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

  it('passes returnFunction through to EditorContainer', () => {
    const returnFunction = () => () => {};
    renderEditor({ returnFunction });
    const props = MockedEditorContainer.mock.calls[0][0];
    expect(props.returnFunction).toBe(returnFunction);
  });

  it('saves through the block own handler, storage keys included', async () => {
    const onClose = jest.fn();
    renderEditor({ onClose });
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
    renderEditor();
    expect(await screen.findByDisplayValue('Second term')).toBeInTheDocument();

    // Save: the wrapper's own validation flags card 2.
    const { onSave } = MockedEditorContainer.mock.lastCall[0];
    await act(async () => {
      await expect(onSave()).rejects.toThrow('Game cards failed validation.');
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
    renderEditor();
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
    renderEditor();
    await screen.findByDisplayValue('A');
    expect(screen.getByRole('button', { name: 'Card actions' })).toBeInTheDocument();
  });

  it('labels the term and definition fields', async () => {
    renderEditor();
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
    renderEditor();
    await screen.findByDisplayValue('a');
    await user.click(screen.getByRole('button', { name: 'Card actions' }));
    expect(await screen.findByText('Delete')).toBeInTheDocument();
    expect(screen.getByDisplayValue('a')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Collapse card' })).toBeInTheDocument();
  });

  it('still collapses and expands the card from the chevron and from the heading', async () => {
    renderEditor();
    await screen.findByDisplayValue('a');
    // The body leaves the DOM once Paragon's exit transition ends.
    fireEvent.click(screen.getByRole('button', { name: 'Collapse card' }));
    await waitFor(() => expect(screen.queryByDisplayValue('a')).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Expand card' }));
    expect(screen.getByDisplayValue('a')).toBeInTheDocument();
    // The heading is the only control that reports the expanded state.
    fireEvent.click(screen.getByRole('button', { expanded: true }));
    await waitFor(() => expect(screen.queryByDisplayValue('a')).not.toBeInTheDocument());
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
    renderEditor();
    expect(await screen.findByDisplayValue('t')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Image settings' }).tagName).toBe('BUTTON');
  });

  // The modal sits outside the disabled fieldset. An alt-text change made
  // while the request is out is not in the payload and is lost on close.
  it('cannot be opened once Save has been clicked', async () => {
    renderEditor();
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
    renderEditor();
    expect(await screen.findByDisplayValue('t')).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Image Settings' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Image settings' }));
    const dialog = await screen.findByRole('dialog', { name: 'Image Settings' });
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Image Settings' })).not.toBeInTheDocument());
  });

  it('can be opened before Save is clicked', async () => {
    renderEditor();
    expect(await screen.findByDisplayValue('t')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Image settings' }));
    expect(await screen.findByText('Image Settings')).toBeInTheDocument();
  });

  // Save can be clicked while the modal is already open. Its own Save must
  // then be disabled, and its callback must not write into the card either.
  it('cannot save alt text from a modal that was open when Save was clicked', async () => {
    renderEditor();
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
    renderEditor({}, { studioEndpointUrl: 'http://a' });
    expect(await screen.findByDisplayValue('old server')).toBeInTheDocument();

    mockedApi.getSettings.mockReturnValueOnce(new Promise(() => {})); // new server never answers
    reinitialize({ studioEndpointUrl: 'http://b' });
    await waitFor(() => expect(mockedApi.getSettings).toHaveBeenCalledTimes(2));

    expect(screen.queryByDisplayValue('old server')).not.toBeInTheDocument();
    const { onSave } = MockedEditorContainer.mock.lastCall[0];
    await expect(onSave()).rejects.toThrow('not loaded');
    expect(mockedApi.saveSettings).not.toHaveBeenCalled();
  });
});

describe('decorative images', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue({
      data: {
        game_type: 'flashcards',
        cards: [{ term: 't', definition: 'd', term_image: 'http://x/i.png', term_image_alt: '' }],
      },
    });
  });

  // An empty alt is how the modal records "decorative". It must reach the
  // page as alt="", which screen readers skip, not be replaced by a name.
  // (querySelectorAll, not getByRole: an alt="" image is deliberately absent
  // from the accessibility tree, which is the point.)
  it('renders an image saved as decorative with an empty alt', async () => {
    renderEditor();
    expect(await screen.findByDisplayValue('t')).toBeInTheDocument();
    const images = document.querySelectorAll('img.card-image, img.img-preview');
    expect(images.length).toBeGreaterThan(0);
    images.forEach((img) => expect(img).toHaveAttribute('alt', ''));
    expect(screen.queryByAltText('Term image')).not.toBeInTheDocument();
  });

  // The image-settings trigger wraps the image, and used to take its name
  // from the image's alt. A decorative image has none, so the trigger needs
  // a name of its own.
  it('still names the image-settings trigger when the image is decorative', async () => {
    renderEditor();
    expect(await screen.findByDisplayValue('t')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Image settings' })).toBeInTheDocument();
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
    const first = renderEditor();
    expect(await screen.findByDisplayValue('Before the save')).toBeInTheDocument();
    first.unmount();

    mockedApi.getSettings.mockResolvedValueOnce(settings('After the save'));
    renderEditor();
    expect(await screen.findByDisplayValue('After the save')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Before the save')).not.toBeInTheDocument();
    expect(mockedApi.getSettings).toHaveBeenCalledTimes(2);
  });

  // Fresh server data goes through the `loaded` action, which replaces the
  // card list. Anything that refetches in the background would wipe the
  // author's unsaved work.
  it('does not refetch, or lose edits, when the window regains focus', async () => {
    mockedApi.getSettings.mockResolvedValue(settings('From the server'));
    renderEditor();
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
  const saveArgs = {
    gameType: 'flashcards' as const,
    isShuffled: true,
    hasTimer: false,
    cards: [],
    title: 'Games',
  };

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

describe('getContent', () => {
  const settings = { shuffle: true, timer: true };

  it('keeps an image-only card for flashcards and drops it for matching', () => {
    const imageOnly = { ...emptyCard(), term_image: 'http://x/i.png' };
    expect(editorViewHooks.getContent({ type: 'flashcards', settings, list: [imageOnly] }).cards).toHaveLength(1);
    expect(editorViewHooks.getContent({ type: 'matching', settings, list: [imageOnly] }).cards).toHaveLength(0);
  });

  it('drops blank cards and keeps text-only cards for both game types', () => {
    const list = [emptyCard(), { ...emptyCard(), term: 'a' }];
    expect(editorViewHooks.getContent({ type: 'flashcards', settings, list }).cards).toHaveLength(1);
    expect(editorViewHooks.getContent({ type: 'matching', settings, list }).cards).toHaveLength(1);
  });
});

describe('validateCards', () => {
  const card = (term: string, definition: string) => ({ ...emptyCard(), term, definition });

  it('flags an image-only side of a flashcard with no text on either side', () => {
    const imageOnly = { ...card('', ''), definition_image: 'http://x/d.png' };
    const { errors } = editorViewHooks.validateCards({ list: [imageOnly], type: 'flashcards' });
    expect(errors).toEqual({ [`${imageOnly.id}_definition`]: 'imageWithoutText' });
  });

  it('flags a missing term when only the definition is filled', () => {
    const onlyDefinition = card('', 'b');
    const { errors } = editorViewHooks.validateCards({ list: [onlyDefinition], type: 'matching' });
    expect(errors).toEqual({ [`${onlyDefinition.id}_term`]: true });
  });

  it('asks for text beside a flashcard image on the side that has none', () => {
    const termImage = { ...card('', 'b'), term_image: 'http://x/t.png' };
    const definitionImage = { ...card('a', ''), definition_image: 'http://x/d.png' };
    const { errors } = editorViewHooks.validateCards({ list: [termImage, definitionImage], type: 'flashcards' });
    expect(errors).toEqual({
      [`${termImage.id}_term`]: 'imageWithoutText',
      [`${definitionImage.id}_definition`]: 'imageWithoutText',
    });
  });

  it('reports validity purely from the collected errors', () => {
    const { errors, isValid } = editorViewHooks.validateCards({ list: [card('a', '')], type: 'matching' });
    expect(Object.keys(errors)).toHaveLength(1);
    expect(isValid).toBe(false);
  });

  // A blank placeholder card already saves as an empty game (getContent drops
  // it). Deleting the last card must reach the same outcome, not a Save that
  // is refused with nothing to point at.
  it('accepts an empty card list', () => {
    expect(editorViewHooks.validateCards({ type: 'matching', list: [] }).isValid).toBe(true);
  });

  it('still rejects a card with a term but no definition', () => {
    const { isValid, errors } = editorViewHooks.validateCards({ type: 'matching', list: [card('t', '')] });
    expect(isValid).toBe(false);
    expect(Object.keys(errors)).toHaveLength(1);
  });

  // Deleting the last card, then Save: the block receives an empty list.
  it('lets the author delete the last card and save', async () => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue({
      data: { game_type: 'matching', cards: [{ term: 'only', definition: 'card' }] },
    });
    mockedApi.saveSettings.mockResolvedValue({ data: { success: true } });
    renderEditor();
    expect(await screen.findByDisplayValue('only')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Card actions' }));
    fireEvent.click(await screen.findByText('Delete'));
    expect(screen.queryByDisplayValue('only')).not.toBeInTheDocument();

    const { onSave } = MockedEditorContainer.mock.lastCall[0];
    await onSave();
    const [, content] = mockedApi.saveSettings.mock.calls[0];
    expect(content.cards).toEqual([]);
  });
});

describe('game state reducer', () => {
  const { reducer, initialState, emptyCard } = jest.requireActual('./data/useGameState');

  it('marks state dirty on a card edit', () => {
    const next = reducer(initialState, {
      type: 'updateCardField',
      index: 0,
      field: 'term',
      value: 'x',
    });
    expect(next.list[0].term).toEqual('x');
    expect(next.isDirty).toBe(true);
  });

  it('ignores an edit to a card that does not exist', () => {
    const next = reducer(initialState, {
      type: 'updateCardField',
      index: 99,
      field: 'term',
      value: 'x',
    });
    expect(next).toBe(initialState);
  });

  it('adds and removes cards', () => {
    const added = reducer(initialState, { type: 'addCard', card: emptyCard() });
    expect(added.list).toHaveLength(2);
    const removed = reducer(added, { type: 'removeCard', index: 0 });
    expect(removed.list).toHaveLength(1);
  });

  it('ignores an out-of-range removal', () => {
    expect(reducer(initialState, { type: 'removeCard', index: 5 })).toBe(initialState);
    expect(reducer(initialState, { type: 'removeCard', index: -1 })).toBe(initialState);
  });

  it('gives every new card the image-path fields the block persists', () => {
    expect(emptyCard()).toHaveProperty('term_image_path', '');
    expect(emptyCard()).toHaveProperty('definition_image_path', '');
  });

  it('clears the dirty flag when settings load', () => {
    const dirty = reducer(initialState, { type: 'updateType', value: 'matching' });
    expect(dirty.isDirty).toBe(true);
    const loaded = reducer(dirty, { type: 'loaded', value: initialState });
    expect(loaded.isDirty).toBe(false);
    expect(loaded.isLoaded).toBe(true);
  });

  // editorOpen is UI state: it is not saved, so changing it is not a change
  // to the game. It must not arm the discard prompt or enable a no-op save.
  it('does not mark the game dirty when a card is expanded or collapsed', () => {
    const state = { ...initialState, list: [emptyCard()], isDirty: false };
    const collapsed = reducer(state, { type: 'setCardOpen', index: 0, isOpen: false });
    expect(collapsed.list[0].editorOpen).toBe(false);
    expect(collapsed.isDirty).toBe(false);
    const dirty = reducer({ ...state, isDirty: true }, { type: 'setCardOpen', index: 0, isOpen: true });
    expect(dirty.isDirty).toBe(true); // and it does not clear an existing dirty flag either
  });

  it('ignores expanding or collapsing a card that does not exist', () => {
    expect(reducer(initialState, { type: 'setCardOpen', index: 5, isOpen: true })).toBe(initialState);
  });

  // Nothing ever dispatched `setClean`; only a load clears the dirty flag.
  it('has no setClean action', () => {
    const state = { ...initialState, isDirty: true };
    expect(reducer(state, { type: 'setClean' })).toBe(state);
  });
});

describe('buildSavePayload', () => {
  const { buildSavePayload } = jest.requireActual('./data/api');

  it('sends the image storage keys, so a card stays linked to its stored file', () => {
    const payload = buildSavePayload({
      gameType: 'flashcards',
      isShuffled: true,
      hasTimer: false,
      title: 'Games',
      cards: [{
        term: 't',
        definition: 'd',
        term_image: 'http://x/i.png',
        term_image_path: 'gamesxblock/abc/hash.png',
      }],
    });
    expect(payload.cards[0].term_image_path).toEqual('gamesxblock/abc/hash.png');
    expect(payload.cards[0]).toHaveProperty('definition_image_path');
  });

  it('omits image fields and sends has_timer for matching games', () => {
    const payload = buildSavePayload({
      gameType: 'matching',
      isShuffled: false,
      hasTimer: true,
      title: 'Games',
      cards: [{ term: 't', definition: 'd', term_image: 'http://x/i.png' }],
    });
    expect(payload.cards[0]).not.toHaveProperty('term_image');
    expect(payload.has_timer).toBe(true);
  });

  // The setting is hidden for flashcards but still stored by the block, whose
  // save handler treats a missing value as true. Sending it keeps a timer the
  // author turned off from switching itself back on.
  it('sends has_timer for flashcards too', () => {
    const payload = buildSavePayload({
      gameType: 'flashcards',
      isShuffled: true,
      hasTimer: false,
      title: 'G',
      cards: [],
    });
    expect(payload.has_timer).toBe(false);
  });
});

describe('saving before the settings have loaded', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockReturnValue(new Promise(() => {})); // never resolves
    mockedApi.saveSettings.mockResolvedValue({ data: { success: true } });
  });

  // The pre-load list is a single blank placeholder card. It validates clean,
  // so without a gate a Save click would overwrite the block's real content.
  it('fails validation and refuses to save', async () => {
    renderEditor();
    const { validateEntry, onSave } = MockedEditorContainer.mock.calls[0][0];
    expect(validateEntry()).toBe(false);
    await expect(onSave()).rejects.toThrow(/not loaded/);
    expect(api.saveSettings).not.toHaveBeenCalled();
  });
});

describe('async card updates target the card, not its position', () => {
  const { reducer, initialState, emptyCard } = jest.requireActual('./data/useGameState');

  it('updates by card id even after the list has been reordered', () => {
    const a = { ...emptyCard(), term: 'a' };
    const b = { ...emptyCard(), term: 'b' };
    const state = { ...initialState, list: [a, b] };
    // Request was issued for card "a" at index 0; by the time it settles the
    // list has been reversed, so index 0 is now "b".
    const reordered = reducer(state, { type: 'setList', value: [b, a] });
    const next = reducer(reordered, {
      type: 'updateCardField',
      cardId: a.id,
      field: 'term_image',
      value: 'u',
    });
    expect(next.list[1].term).toEqual('a');
    expect(next.list[1].term_image).toEqual('u');
    expect(next.list[0].term_image).toBeFalsy();
  });

  it('drops an update for a card that no longer exists', () => {
    const next = reducer(initialState, {
      type: 'updateCardField',
      cardId: 'gone',
      field: 'term_image',
      value: 'u',
    });
    expect(next).toBe(initialState);
  });
});

// The last real render's props. React's development build also calls a
// component with no arguments to locate it for a warning's component stack;
// those probe calls are skipped.
const latestContainerProps = () => MockedEditorContainer.mock.calls.filter(([props]) => props).at(-1)[0];
const loadedSettings = {
  data: { game_type: 'flashcards', cards: [{ term: 'Photosynthesis', definition: 'How plants eat' }] },
};
const pickFile = (inputId: string) => {
  const input = document.getElementById(inputId);
  if (!input) { throw new Error(`No file input #${inputId}`); }
  fireEvent.change(input, { target: { files: [new File(['x'], 'x.png', { type: 'image/png' })] } });
};

describe('image requests after the settings have loaded', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue(loadedSettings);
    mockedApi.saveSettings.mockResolvedValue({ data: { success: true } });
  });

  // Regression: the upload handler once closed over the pre-load placeholder
  // list, so it looked up a card id that no longer existed and the reducer
  // dropped the update. Proven here by saving: only an update that reached the
  // loaded card puts the storage path in the payload.
  it('attaches an uploaded image to the loaded card, not the placeholder', async () => {
    mockedApi.uploadImage.mockResolvedValue({ data: { success: true, url: '/media/x.png', file_path: 'games/x.png' } });
    renderEditor();
    await screen.findByDisplayValue('Photosynthesis');

    pickFile('term_image_upload|0');
    await waitFor(() => expect(api.uploadImage).toHaveBeenCalledTimes(1));

    await waitFor(async () => {
      await latestContainerProps().onSave();
      const [, content] = mockedApi.saveSettings.mock.calls[mockedApi.saveSettings.mock.calls.length - 1];
      expect(content.cards[0].term_image_path).toEqual('games/x.png');
    });
  });

  it('shows a dismissible error when an image upload fails', async () => {
    mockedApi.uploadImage.mockResolvedValue({ data: { success: false, error: 'too large' } });
    renderEditor();
    await screen.findByDisplayValue('Photosynthesis');

    pickFile('term_image_upload|0');
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
    renderEditor();
    await screen.findByDisplayValue('Photosynthesis');
    const input = document.getElementById('term_image_upload|0') as HTMLInputElement;
    const setValue = jest.spyOn(input, 'value', 'set');

    pickFile('term_image_upload|0');
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
    renderEditor();
    const input = await screen.findByDisplayValue('Photosynthesis');
    expect(latestContainerProps().isDirty()).toBe(false);

    fireEvent.change(input, { target: { value: 'Photo' } });
    await waitFor(() => expect(latestContainerProps().isDirty()).toBe(true));
  });

  it('does not arm the discard prompt just because a card was collapsed', async () => {
    renderEditor();
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
    renderEditor();
    await screen.findByDisplayValue('Photosynthesis');

    pickFile('term_image_upload|0');
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
  it('rejects, without saving or closing, when the pending upload fails', async () => {
    let finishUpload;
    mockedApi.uploadImage.mockReturnValue(
      new Promise((resolve) => {
        finishUpload = resolve;
      }),
    );
    const onClose = jest.fn();
    renderEditor({ onClose });
    await screen.findByDisplayValue('Photosynthesis');

    pickFile('term_image_upload|0');
    await waitFor(() => expect(api.uploadImage).toHaveBeenCalledTimes(1));

    const saving = latestContainerProps().onSave();
    await act(async () => {
      finishUpload({ data: { success: false, error: 'too large' } });
      await expect(saving).rejects.toThrow('too large');
    });
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
  it('rejects with the block error and keeps the editor open', async () => {
    mockedApi.saveSettings.mockResolvedValue({ data: { success: false, error: 'Each card must be an object' } });
    const onClose = jest.fn();
    renderEditor({ onClose });
    await screen.findByDisplayValue('Photosynthesis');

    await act(async () => {
      await expect(latestContainerProps().onSave()).rejects.toThrow('Each card must be an object');
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
  it('heads a failed upload with a translated message and shows no English fallback', async () => {
    mockedApi.uploadImage.mockResolvedValue({ data: { success: false } });
    renderEditor();
    await screen.findByDisplayValue('Photosynthesis');

    pickFile('term_image_upload|0');
    expect(await screen.findByText('The last image change could not be saved.')).toBeInTheDocument();
    expect(screen.queryByText('Upload failed')).not.toBeInTheDocument();
  });

  it('heads a failed save as a save failure, not an image one, and shows no English fallback', async () => {
    mockedApi.saveSettings.mockResolvedValue({ data: { success: false } });
    renderEditor();
    await screen.findByDisplayValue('Photosynthesis');

    await act(async () => {
      // No server detail, so the error carries only its code.
      await expect(latestContainerProps().onSave()).rejects.toMatchObject({ code: 'saveFailed', message: '' });
    });
    expect(await screen.findByText('The game could not be saved.')).toBeInTheDocument();
    expect(screen.queryByText('Save failed')).not.toBeInTheDocument();
    expect(screen.queryByText(/image change/)).not.toBeInTheDocument();
  });

  it('keeps the server detail under the save heading when there is one', async () => {
    mockedApi.saveSettings.mockResolvedValue({ data: { success: false, error: 'Each card must be an object' } });
    renderEditor();
    await screen.findByDisplayValue('Photosynthesis');

    await act(async () => {
      await expect(latestContainerProps().onSave()).rejects.toThrow('Each card must be an object');
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

  // Regression: validateEntry runs at the Save click, before the upload lands.
  // A blank card validates clean then, and is image-only by the time it saves.
  it('refuses to save an image-only card the upload produced', async () => {
    let finishUpload;
    mockedApi.uploadImage.mockReturnValue(
      new Promise((resolve) => {
        finishUpload = resolve;
      }),
    );
    const onClose = jest.fn();
    renderEditor({ onClose });
    await waitFor(() => expect(latestContainerProps().validateEntry()).toBe(true));

    pickFile('term_image_upload|0');
    await waitFor(() => expect(api.uploadImage).toHaveBeenCalledTimes(1));
    expect(latestContainerProps().validateEntry()).toBe(true);

    const saving = latestContainerProps().onSave();
    await act(async () => {
      finishUpload({ data: { success: true, url: '/media/x.png', file_path: 'games/x.png' } });
      await expect(saving).rejects.toThrow(/validation/i);
    });
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
  // clicked, so the click-time check can run before the field is left. It
  // must validate what the author sees.
  it('accepts a field the author has filled in but not left', async () => {
    renderEditor();
    await screen.findByDisplayValue('a');
    expect(latestContainerProps().validateEntry()).toBe(false);
    fireEvent.change(screen.getByLabelText('Definition'), { target: { value: 'b' } });
    expect(latestContainerProps().validateEntry()).toBe(true);
  });

  it('rejects a field the author has just cleared but not left', async () => {
    mockedApi.getSettings.mockResolvedValue({
      data: { game_type: 'matching', cards: [{ term: 'a', definition: 'b' }] },
    });
    renderEditor();
    await screen.findByDisplayValue('a');
    expect(latestContainerProps().validateEntry()).toBe(true);
    fireEvent.change(screen.getByLabelText('Definition'), { target: { value: '' } });
    expect(latestContainerProps().validateEntry()).toBe(false);
  });
});

describe('unsaved title changes', () => {
  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockResolvedValue(loadedSettings);
  });

  it('counts a title-only edit as dirty', async () => {
    renderEditor();
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
      await result.current.actions.save({
        gameType: 'flashcards',
        isShuffled: true,
        hasTimer: false,
        cards: result.current.state.list,
        title: 'Games',
      });
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
    renderEditor();
    const term = await screen.findByDisplayValue('Photosynthesis');

    pickFile('term_image_upload|0');
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
    renderEditor({ onClose: null });
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
    renderEditor({ onClose: null }, { studioEndpointUrl: null });
    await waitFor(() => expect(mockedApi.getSettings).toHaveBeenCalled());
    expect(mockedApi.getSettings).toHaveBeenCalledWith(
      expect.objectContaining({ studioEndpointUrl: getConfig().STUDIO_BASE_URL }),
    );
  });

  it('does not navigate when the page supplied a way to close', async () => {
    const navigateTo = jest.spyOn(editorHooks, 'navigateTo').mockImplementation(() => {});
    const onClose = jest.fn();
    renderEditor({ onClose });
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
    const { unmount } = renderEditor({ onClose });
    await screen.findByDisplayValue('Photosynthesis');

    pickFile('term_image_upload|0');
    await waitFor(() => expect(api.uploadImage).toHaveBeenCalledTimes(1));

    const saving = latestContainerProps().onSave();
    unmount();

    await act(async () => {
      finishUpload({ data: { success: true, url: '/media/x.png', file_path: 'games/x.png' } });
      await expect(saving).rejects.toThrow(/closed/i);
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
    const { unmount } = renderEditor({ onClose: null, ...propsFor(spies) });
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
    renderEditor();
    await screen.findByDisplayValue('Photosynthesis');

    reinitialize({ blockId: otherBlockId });
    await waitFor(() =>
      expect(api.getSettings).toHaveBeenLastCalledWith(expect.objectContaining({ blockId: otherBlockId }))
    );

    expect(screen.queryByDisplayValue('Photosynthesis')).not.toBeInTheDocument();
    expect(latestContainerProps().validateEntry()).toBe(false);
    await expect(latestContainerProps().onSave()).rejects.toThrow(/not loaded/);
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
    renderEditor();
    await screen.findByDisplayValue('Photosynthesis');

    pickFile('term_image_upload|0');
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
    renderEditor();
    const term = await screen.findByDisplayValue('Photosynthesis');
    expect(term).toBeEnabled();

    const saving = latestContainerProps().onSave();
    await waitFor(() => expect(term).toBeDisabled());
    expect(screen.getByRole('button', { name: /^add$/i })).toBeDisabled();

    await act(async () => {
      finishSave({ data: { success: false, error: 'nope' } });
      await expect(saving).rejects.toThrow('nope');
    });
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
    renderEditor({ onClose });
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
    renderEditor();
    const term = await screen.findByLabelText('Term');
    await user.type(term, '!');
    // getContent reads the reducer state the view rendered from, not a local buffer.
    expect(latestContainerProps().getContent().cards[0].term).toBe('Photosynthesis!');
  });

  it('keeps the same input, with the same value, when the field is tabbed out of', async () => {
    const user = userEvent.setup();
    renderEditor();
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
    renderEditor();
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
    renderEditor();
    await screen.findByDisplayValue('First');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(terms()).toEqual(['First', 'Second', '']);
  });

  it('leaves the order alone when the first card is moved up or the last moved down', async () => {
    const user = userEvent.setup();
    renderEditor();
    await screen.findByDisplayValue('First');
    const menus = () => screen.getAllByRole('button', { name: 'Card actions' });

    const menuItem = (index: number, label: string) =>
      within(menus()[index].closest('.dropdown') as HTMLElement).findByText(label);
    await user.click(menus()[0]);
    await user.click(await menuItem(0, 'Move up'));
    await user.click(menus()[1]);
    await user.click(await menuItem(1, 'Move down'));
    expect(terms()).toEqual(['First', 'Second']);
  });

  it('reorders cards by keyboard drag', async () => {
    renderEditor();
    await screen.findByDisplayValue('First');
    const [firstId, secondId] = latestContainerProps().getContent().cards.map((c) => c.id);
    const collision = jest.mocked(verticalSortableListCollisionDetection);
    const real =
      jest.requireActual('@src/generic/DraggableList/verticalSortableList').verticalSortableListCollisionDetection;
    collision.mockReturnValue([{ id: secondId }]);
    try {
      const handle = screen.getAllByRole('button', { name: 'Drag to reorder' })[0];
      fireEvent.keyDown(handle, { code: 'Space' });
      await act(() =>
        new Promise((resolve) => {
          setTimeout(resolve, 1);
        })
      );
      fireEvent.keyDown(handle, { code: 'Space' });
      await waitFor(() => expect(terms()).toEqual(['Second', 'First']));
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
    renderEditor();
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
      renderEditor();
      await screen.findByDisplayValue('Photosynthesis');
      await user.click(screen.getAllByRole('button', { name: 'Add image' })[1]);
      expect(click).toHaveBeenCalledTimes(1);
      expect(click.mock.contexts[0]).toBe(document.getElementById('definition_image_upload|0'));
    } finally {
      click.mockRestore();
    }
  });

  it('uploads an image to the definition side', async () => {
    mockedApi.getSettings.mockResolvedValue(loadedSettings);
    mockedApi.uploadImage.mockResolvedValue({
      data: { success: true, url: '/media/d.png', file_path: 'games/abc/new.png' },
    });
    renderEditor();
    await screen.findByDisplayValue('Photosynthesis');
    pickFile('definition_image_upload|0');
    await waitFor(() =>
      expect(latestContainerProps().getContent().cards[0].definition_image_path).toBe('games/abc/new.png')
    );
    expect(latestContainerProps().getContent().cards[0].definition_image).toBe('http://studio/media/d.png');
  });

  it.each(['{Enter}', ' '])('opens image settings from the keyboard with %j', async (key) => {
    const user = userEvent.setup();
    renderEditor();
    await screen.findByDisplayValue('t');
    screen.getAllByRole('button', { name: 'Image settings' })[0].focus();
    await user.keyboard(key);
    expect(await screen.findByRole('dialog', { name: 'Image Settings' })).toBeInTheDocument();
  });

  it('saves new alt text for the definition image', async () => {
    const user = userEvent.setup();
    renderEditor();
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
    renderEditor();
    await screen.findByDisplayValue('a');
    await user.click(screen.getByRole('button', { name: 'Collapse card' }));
    await waitFor(() => expect(screen.queryByDisplayValue('a')).not.toBeInTheDocument());

    act(() => {
      expect(latestContainerProps().validateEntry()).toBe(false);
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
    renderEditor({ onClose: null, returnFunction: () => afterSave });
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
    renderEditor();
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
    renderEditor();
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
    renderEditor();
    await screen.findByDisplayValue('Photosynthesis');
    await act(async () => {
      await expect(latestContainerProps().onSave()).rejects.toThrow('nope');
    });
    expect(saveEvents()).toEqual([]);
  });
});
