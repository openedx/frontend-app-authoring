import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { QueryClient, focusManager, onlineManager } from '@tanstack/react-query';
import {
  fireEvent,
  initializeMocks,
  makeQueryClientWrapper,
  render,
  screen,
  waitFor,
  within,
} from '@src/testUtils';

import editorStore from 'CourseAuthoring/editors/data/store';
import { actions as editorActions } from 'CourseAuthoring/editors/data/redux';
import { EditorContextProvider } from 'CourseAuthoring/editors/EditorContext';

import EditorContainer from 'CourseAuthoring/editors/containers/EditorContainer';
import * as editorHooks from 'CourseAuthoring/editors/hooks';

import GamesEditorPlugin, { hooks as editorViewHooks } from './GamesEditor';
import * as api from './data/api';
import { emptyCard, useGameState } from './data/useGameState';

/**
 * In production the plugin renders inside EditorPage, which supplies the
 * editors Redux store and EditorContext. EditorContainer reads from both, so a
 * plugin that uses it is not renderable standalone -- the same wrappers are
 * needed here.
 */
const pluginTree = (props) => (
  <Provider store={editorStore}>
    <EditorContextProvider learningContextId="course-v1:org+course+run">
      <GamesEditorPlugin {...props} />
    </EditorContextProvider>
  </Provider>
);
const renderPlugin = (props) => render(pluginTree(props));

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
// children on the host app's block-fetch state, which only Editor.tsx primes.
// Keeping it a jest.fn also lets us assert the props the plugin hands it.
jest.mock('CourseAuthoring/editors/containers/EditorContainer', () => ({
  __esModule: true,
  default: jest.fn(({ children }) => children),
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

const blockId = 'block-v1:org+course+run+type@games+block@abc';

describe('GamesEditor plugin', () => {
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
    renderPlugin({ blockId, onClose: () => {} });
    await waitFor(() => expect(api.getSettings).toHaveBeenCalledWith(expect.objectContaining({ blockId })));
  });

  it('renders the saved cards', async () => {
    renderPlugin({ blockId, onClose: () => {} });
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

  // Regression guard: the plugin must save through its OWN handler. If it falls
  // back to the host app's saveBlock thunk, the host's payload builder silently
  // drops the *_image_path storage keys, losing the link from card to file.
  // The host's own save signals the unit page the same way. Session storage
  // keeps the signal to this tab; local storage would fire it in every other
  // Studio tab on the origin too.
  it('signals the course refresh through sessionStorage, like the host does', async () => {
    sessionStorage.removeItem('courseRefreshTriggerOnComponentEditSave');
    localStorage.removeItem('courseRefreshTriggerOnComponentEditSave');
    renderPlugin({ blockId, onClose: () => {} });
    expect(await screen.findByDisplayValue('t')).toBeInTheDocument();
    const { onSave } = MockedEditorContainer.mock.lastCall[0];
    await onSave();
    expect(sessionStorage.getItem('courseRefreshTriggerOnComponentEditSave')).not.toBeNull();
    expect(localStorage.getItem('courseRefreshTriggerOnComponentEditSave')).toBeNull();
  });

  it('sends the card key the block loaded, so the card keeps its identity', async () => {
    renderPlugin({ blockId, onClose: () => {} });
    expect(await screen.findByDisplayValue('t')).toBeInTheDocument();
    const { onSave } = MockedEditorContainer.mock.lastCall[0];
    await onSave();
    const [, content] = mockedApi.saveSettings.mock.calls[0];
    expect(content.cards[0].card_key).toEqual('saved-key');
  });

  it('passes an onSave to EditorContainer so the host thunk is bypassed', () => {
    renderPlugin({ blockId, onClose: () => {} });
    const props = MockedEditorContainer.mock.calls[0][0];
    expect(typeof props.onSave).toBe('function');
  });

  // The container's cancel and discard flows call the host's returnFunction
  // when there is no onClose. The plugin's save already honours it; cancel
  // must reach it too.
  // The host tells the editor which Studio to talk to, and which learning
  // context the block is in. Both must reach the API layer.
  it('passes the host-supplied Studio endpoint to the API', async () => {
    renderPlugin({ blockId, onClose: () => {}, studioEndpointUrl: 'http://other-studio' });
    await waitFor(() => expect(mockedApi.getSettings).toHaveBeenCalled());
    expect(mockedApi.getSettings).toHaveBeenCalledWith(
      expect.objectContaining({ blockId, studioEndpointUrl: 'http://other-studio' }),
    );
  });

  // The host treats a block as a library block by its learning context too,
  // not only by an `lb:` id. A library-context block must use the handler-URL
  // resolver, as the host's own editors do.
  it('treats a block in a library learning context as a library block', async () => {
    renderPlugin({ blockId, onClose: () => {}, learningContextId: 'lib:Org:lib1' });
    await waitFor(() => expect(mockedApi.getSettings).toHaveBeenCalled());
    expect(mockedApi.getSettings).toHaveBeenCalledWith(expect.objectContaining({ isLibrary: true }));
  });

  // Only v2 libraries have server-issued handler URLs. A legacy (v1) library
  // block has a legacy usage key, which the v2 resolver rejects; it takes the
  // fixed handler route like a course block.
  it('does not treat a legacy (v1) library context as a v2 library block', async () => {
    renderPlugin({ blockId, onClose: () => {}, learningContextId: 'library-v1:Org+lib1' });
    await waitFor(() => expect(mockedApi.getSettings).toHaveBeenCalled());
    expect(mockedApi.getSettings).toHaveBeenCalledWith(expect.objectContaining({ isLibrary: false }));
  });

  it('passes returnFunction through to EditorContainer', () => {
    const returnFunction = () => () => {};
    renderPlugin({ blockId, returnFunction });
    const props = MockedEditorContainer.mock.calls[0][0];
    expect(props.returnFunction).toBe(returnFunction);
  });

  it('saves through the block own handler, storage keys included', async () => {
    const onClose = jest.fn();
    renderPlugin({ blockId, onClose });
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
    renderPlugin({ blockId, onClose: () => {} });
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

  it('keeps text typed into a card with that card when it is moved before blur', async () => {
    renderPlugin({ blockId, onClose: () => {} });
    const first = await screen.findByDisplayValue('First term');
    // Type without blurring: the text is pending, held locally.
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
    renderPlugin({ blockId, onClose: () => {} });
    await screen.findByDisplayValue('A');
    expect(screen.getByRole('button', { name: 'Card actions' })).toBeInTheDocument();
  });

  it('labels the term and definition fields', async () => {
    renderPlugin({ blockId, onClose: () => {} });
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

  // A button inside a button is invalid and confuses assistive tech. The
  // card's menu and its expand/collapse control must not sit inside the
  // heading that toggles the card.
  it('does not nest the card menu or the chevron inside the collapsible trigger', async () => {
    renderPlugin({ blockId, onClose: () => {} });
    await screen.findByDisplayValue('a');
    const menu = screen.getByRole('button', { name: 'Card actions' });
    const chevron = screen.getByRole('button', { name: 'Collapse card' });
    [menu, chevron].forEach((control) => {
      // No ancestor of the control may itself be a button.
      let el = control.parentElement;
      while (el) {
        expect(el.getAttribute('role')).not.toBe('button');
        expect(el.tagName).not.toBe('BUTTON');
        el = el.parentElement;
      }
    });
  });

  it('still collapses and expands the card from the chevron and from the heading', async () => {
    renderPlugin({ blockId, onClose: () => {} });
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

  // The modal sits outside the disabled fieldset. An alt-text change made
  // while the request is out is not in the payload and is lost on close.
  it('cannot be opened once Save has been clicked', async () => {
    renderPlugin({ blockId, onClose: () => {} });
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

  it('can be opened before Save is clicked', async () => {
    renderPlugin({ blockId, onClose: () => {} });
    expect(await screen.findByDisplayValue('t')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Image settings' }));
    expect(await screen.findByText('Image Settings')).toBeInTheDocument();
  });

  // Save can be clicked while the modal is already open. Its own Save must
  // then be disabled, and its callback must not write into the card either.
  it('cannot save alt text from a modal that was open when Save was clicked', async () => {
    renderPlugin({ blockId, onClose: () => {} });
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
    const { rerender } = renderPlugin({ blockId, onClose: () => {}, studioEndpointUrl: 'http://a' });
    expect(await screen.findByDisplayValue('old server')).toBeInTheDocument();

    mockedApi.getSettings.mockReturnValueOnce(new Promise(() => {})); // new server never answers
    rerender(pluginTree({ blockId, onClose: () => {}, studioEndpointUrl: 'http://b' }));
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
    renderPlugin({ blockId, onClose: () => {} });
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
    renderPlugin({ blockId, onClose: () => {} });
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
    const first = renderPlugin({ blockId, onClose: () => {} });
    expect(await screen.findByDisplayValue('Before the save')).toBeInTheDocument();
    first.unmount();

    mockedApi.getSettings.mockResolvedValueOnce(settings('After the save'));
    renderPlugin({ blockId, onClose: () => {} });
    expect(await screen.findByDisplayValue('After the save')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Before the save')).not.toBeInTheDocument();
    expect(mockedApi.getSettings).toHaveBeenCalledTimes(2);
  });

  // Fresh server data goes through the `loaded` action, which replaces the
  // card list. Anything that refetches in the background would wipe the
  // author's unsaved work.
  it('does not refetch, or lose edits, when the window regains focus', async () => {
    mockedApi.getSettings.mockResolvedValue(settings('From the server'));
    renderPlugin({ blockId, onClose: () => {} });
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

describe('validateCards', () => {
  const card = (term: string, definition: string) => ({ ...emptyCard(), term, definition });

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
    renderPlugin({ blockId, onClose: () => {} });
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
    renderPlugin({ blockId, onClose: () => {} });
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

const latestContainerProps = () => MockedEditorContainer.mock.calls[MockedEditorContainer.mock.calls.length - 1][0];
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
    renderPlugin({ blockId, onClose: () => {} });
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
    renderPlugin({ blockId, onClose: () => {} });
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
    renderPlugin({ blockId, onClose: () => {} });
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

  it('counts an edit that has not been blurred yet', async () => {
    renderPlugin({ blockId, onClose: () => {} });
    const input = await screen.findByDisplayValue('Photosynthesis');
    expect(latestContainerProps().isDirty()).toBe(false);

    fireEvent.change(input, { target: { value: 'Photo' } });
    await waitFor(() => expect(latestContainerProps().isDirty()).toBe(true));
  });

  it('does not arm the discard prompt just because a card was collapsed', async () => {
    renderPlugin({ blockId, onClose: () => {} });
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
    renderPlugin({ blockId, onClose: () => {} });

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
    renderPlugin({ blockId, onClose: () => {} });
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
    renderPlugin({ blockId, onClose });
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
    renderPlugin({ blockId, onClose });
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
    renderPlugin({ blockId, onClose: () => {} });
    await screen.findByDisplayValue('Photosynthesis');

    pickFile('term_image_upload|0');
    expect(await screen.findByText('The last image change could not be saved.')).toBeInTheDocument();
    expect(screen.queryByText('Upload failed')).not.toBeInTheDocument();
  });

  it('heads a failed save as a save failure, not an image one, and shows no English fallback', async () => {
    mockedApi.saveSettings.mockResolvedValue({ data: { success: false } });
    renderPlugin({ blockId, onClose: () => {} });
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
    renderPlugin({ blockId, onClose: () => {} });
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
    renderPlugin({ blockId, onClose });
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
  // clicked, so the click-time check can run while the last edit is still
  // local. It must validate what the author sees.
  it('accepts a field the author has filled in but not left', async () => {
    renderPlugin({ blockId, onClose: () => {} });
    await screen.findByDisplayValue('a');
    expect(latestContainerProps().validateEntry()).toBe(false);
    fireEvent.change(screen.getByLabelText('Definition'), { target: { value: 'b' } });
    expect(latestContainerProps().validateEntry()).toBe(true);
  });

  it('rejects a field the author has just cleared but not left', async () => {
    mockedApi.getSettings.mockResolvedValue({
      data: { game_type: 'matching', cards: [{ term: 'a', definition: 'b' }] },
    });
    renderPlugin({ blockId, onClose: () => {} });
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
    editorStore.dispatch(editorActions.app.setBlockValue({ data: { display_name: 'Old title' } }));
  });

  it('counts a title-only edit as dirty', async () => {
    renderPlugin({ blockId, onClose: () => {} });
    await screen.findByDisplayValue('Photosynthesis');
    expect(latestContainerProps().isDirty()).toBe(false);

    act(() => {
      editorStore.dispatch(editorActions.app.setBlockTitle('New title'));
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
        filePath: 'games/abc/hash.png',
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
      result.current.actions.deleteGameImage({ cardId, imageType: 'term', filePath: '' });
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

  // Regression: typed text lives in the component until blur. The save read
  // only the reducer state once the upload settled, so anything typed during
  // the wait was dropped and the editor closed on top of it.
  it('is included in what gets saved', async () => {
    let finishUpload;
    mockedApi.uploadImage.mockReturnValue(
      new Promise((resolve) => {
        finishUpload = resolve;
      }),
    );
    renderPlugin({ blockId, onClose: () => {} });
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
    editorStore.dispatch(editorActions.app.initialize({
      studioEndpointUrl: 'http://studio',
      lmsEndpointUrl: 'http://lms',
      blockId,
      learningContextId: 'course-v1:org+course+run',
      blockType: 'games',
    }));
    editorStore.dispatch(editorActions.app.setUnitUrl({ data: { ancestors: [{ id: 'unit-1' }] } }));
  });

  // That route passes neither `returnFunction` nor `onClose`. The built-in
  // save falls back to the return URL there, and so must this one.
  it('navigates to the return URL after a save', async () => {
    const navigateTo = jest.spyOn(editorHooks, 'navigateTo').mockImplementation(() => {});
    renderPlugin({ blockId });
    await screen.findByDisplayValue('Photosynthesis');

    await act(async () => {
      await latestContainerProps().onSave();
    });
    expect(navigateTo).toHaveBeenCalledTimes(1);
    expect(navigateTo).toHaveBeenCalledWith(`http://studio/container/unit-1#${blockId}`);
    navigateTo.mockRestore();
  });

  it('does not navigate when the host supplied a way to close', async () => {
    const navigateTo = jest.spyOn(editorHooks, 'navigateTo').mockImplementation(() => {});
    const onClose = jest.fn();
    renderPlugin({ blockId, onClose });
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
    const { unmount } = renderPlugin({ blockId, onClose });
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
    const { unmount } = renderPlugin({ blockId, ...propsFor(spies) });
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
    const { rerender } = renderPlugin({ blockId, onClose: () => {} });
    await screen.findByDisplayValue('Photosynthesis');

    rerender(pluginTree({ blockId: otherBlockId, onClose: () => {} }));
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
    editorStore.dispatch(editorActions.app.setBlockValue({ data: { display_name: 'Old title' } }));
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
    renderPlugin({ blockId, onClose: () => {} });
    await screen.findByDisplayValue('Photosynthesis');

    pickFile('term_image_upload|0');
    await waitFor(() => expect(api.uploadImage).toHaveBeenCalledTimes(1));

    const saving = latestContainerProps().onSave();
    act(() => {
      editorStore.dispatch(editorActions.app.setBlockTitle('Typed during the wait'));
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
    renderPlugin({ blockId, onClose: () => {} });
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
  // plugin navigates away (a beforeunload) before that. So it must report
  // itself clean as soon as the block has accepted the save.
  it('reports no unsaved changes once the block has accepted the save', async () => {
    mockedApi.saveSettings.mockResolvedValue({ data: { success: true } });
    let dirtyAtClose = null;
    const onClose = jest.fn(() => {
      dirtyAtClose = latestContainerProps().isDirty();
    });
    renderPlugin({ blockId, onClose });
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
