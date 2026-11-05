import userEvent from '@testing-library/user-event';
import { getConfig } from '@edx/frontend-platform';
import { act, fireEvent, initializeMocks, screen, waitFor, within } from '@src/testUtils';
import { editorRender } from '@src/editors/editorTestRender';
import type { PartialEditorState } from '@src/editors/data/redux';

import GamesEditor from '.';
import { stubRects, type StubbedRect } from './testUtils/stubRects';

// The editor through the real EditorContainer and the real API layer, with
// only HTTP mocked, the way a course author meets it inside the editor modal.
const blockId = 'block-v1:org+course+run+type@games+block@abc';
const handlerUrl = (name: string) => `${getConfig().STUDIO_BASE_URL}/xblock/${blockId}/handler/${name}`;

const appState = (): NonNullable<PartialEditorState['app']> => ({
  blockId,
  blockType: 'games',
  blockTitle: 'Games',
  learningContextId: 'course-v1:org+course+run',
  studioEndpointUrl: getConfig().STUDIO_BASE_URL,
  lmsEndpointUrl: getConfig().LMS_BASE_URL,
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
});

const renderEditor = (onClose = jest.fn()) => {
  editorRender(<GamesEditor onClose={onClose} />, { initialState: { app: appState() } });
  return onClose;
};

const saveButton = () => screen.getByRole('button', { name: 'Save changes and return to learning context' });
const savePosts = (axiosMock: ReturnType<typeof initializeMocks>['axiosMock']) =>
  axiosMock.history.post.filter((request) => request.url === handlerUrl('save_settings'));

type User = ReturnType<typeof userEvent.setup>;

// The handle, the card menu and the expand chevron all live in the card's own
// chrome, in the deck list and the flat list alike.
const cardRoot = (cardName: string) =>
  screen.getByRole('button', { name: `Reorder ${cardName}` }).closest('.card') as HTMLElement;

/** Opens a card through its chevron, the way an author does. */
const openCard = async (user: User, cardName: string) => {
  await screen.findByRole('button', { name: `Reorder ${cardName}` });
  await user.click(within(cardRoot(cardName)).getByRole('button', { name: 'Expand card' }));
};

describe('GamesEditor in the editor modal', () => {
  let axiosMock: ReturnType<typeof initializeMocks>['axiosMock'];

  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
    axiosMock.onPost(handlerUrl('get_settings')).reply(200, {
      game_type: 'matching',
      is_shuffled: true,
      has_timer: false,
      cards: [{ term: 'Photosynthesis', definition: 'How plants eat', card_key: 'k1' }],
    });
    axiosMock.onPost(handlerUrl('save_settings')).reply(200, { success: true });
  });

  it('saves an edit with the Save button, through the block handler, and closes', async () => {
    const user = userEvent.setup();
    const onClose = renderEditor();
    // Cards arrive collapsed: the author opens the one they mean to edit.
    await openCard(user, 'Photosynthesis');
    const term = await screen.findByDisplayValue('Photosynthesis');
    await user.type(term, ' now');
    await user.click(saveButton());

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    const [request] = savePosts(axiosMock);
    expect(JSON.parse(request.data)).toMatchObject({
      display_name: 'Games',
      game_type: 'matching',
      is_shuffled: true,
      has_timer: false,
      cards: [{ term: 'Photosynthesis now', definition: 'How plants eat', card_key: 'k1', order: 1 }],
    });
  });

  it('asks before discarding unsaved changes, and discards without saving', async () => {
    const user = userEvent.setup();
    const onClose = renderEditor();
    await openCard(user, 'Photosynthesis');
    await user.type(await screen.findByDisplayValue('Photosynthesis'), '!');
    await user.click(screen.getByRole('button', { name: 'Discard changes and return to learning context' }));

    expect(await screen.findByText('Exit the editor?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Discard Changes and Exit' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(savePosts(axiosMock)).toHaveLength(0);
  });

  it('keeps the editor open, and sends nothing, while a card is incomplete', async () => {
    const user = userEvent.setup();
    const onClose = renderEditor();
    await openCard(user, 'Photosynthesis');
    await user.clear(await screen.findByDisplayValue('How plants eat'));
    await user.click(saveButton());

    expect(await screen.findByText('We couldn\'t save your changes.')).toBeInTheDocument();
    expect(screen.getByText('Enter a definition')).toBeInTheDocument();
    expect(savePosts(axiosMock)).toHaveLength(0);
    expect(onClose).not.toHaveBeenCalled();
  });

  // The author may empty the game: the draft the Add button makes is dropped
  // from the payload, and deleting the last real card leaves the save with
  // nothing left to point at.
  it('deletes the last card and saves an empty game', async () => {
    const user = userEvent.setup();
    const onClose = renderEditor();
    await screen.findByRole('button', { name: 'Reorder Photosynthesis' });

    await user.click(within(cardRoot('Photosynthesis')).getByRole('button', { name: 'Card actions' }));
    await user.click(await screen.findByText('Delete'));
    expect(screen.queryByRole('button', { name: 'Reorder Photosynthesis' })).not.toBeInTheDocument();

    await user.click(saveButton());

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(JSON.parse(savePosts(axiosMock)[0].data).cards).toEqual([]);
  });

  // The sidebar reads as a list of current values until the author opens one
  // card, and the trigger answers Enter as well as a click.
  it('shows a setting summary while closed, and opens the card with Enter', async () => {
    const user = userEvent.setup();
    renderEditor();
    await screen.findByRole('button', { name: 'Reorder Photosynthesis' });

    const trigger = screen.getByRole('button', { name: 'Shuffle' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    // Closed: the value, and none of the controls that would change it.
    expect(screen.getByText('On')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Off' })).not.toBeInTheDocument();

    trigger.focus();
    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Off' })).toBeInTheDocument();

    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('On')).toBeInTheDocument();
    // Closed again: the controls are gone, not merely hidden behind the summary.
    expect(screen.queryByRole('button', { name: 'Off' })).not.toBeInTheDocument();
  });

  // The menu is a react-overlays dropdown: Escape closes it and leaves focus on
  // the toggle that opened it, never on the page body.
  it('closes the card menu on Escape, keeping focus on its toggle', async () => {
    const user = userEvent.setup();
    renderEditor();
    await screen.findByRole('button', { name: 'Reorder Photosynthesis' });

    const toggle = within(cardRoot('Photosynthesis')).getByRole('button', { name: 'Card actions' });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');

    await waitFor(() => expect(toggle).toHaveAttribute('aria-expanded', 'false'));
    expect(toggle).toHaveFocus();
  });
});

describe('GamesEditor decks', () => {
  let axiosMock: ReturnType<typeof initializeMocks>['axiosMock'];

  const deckSettings = {
    game_type: 'flashcards',
    is_shuffled: true,
    has_timer: false,
    cards: [{ term: 'One', definition: 'first', card_key: 'c1' }],
    decks: [
      { deck_key: 'dk-1', name: 'Deck 1', cards: [{ term: 'One', definition: 'first', card_key: 'c1' }] },
      { deck_key: 'dk-2', name: 'Deck 2', cards: [{ term: 'Two', definition: 'second', card_key: 'c2' }] },
    ],
  };

  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
    axiosMock.onPost(handlerUrl('get_settings')).reply(200, deckSettings);
    axiosMock.onPost(handlerUrl('save_settings')).reply(200, { success: true });
  });

  const savedPayload = () => JSON.parse(savePosts(axiosMock)[0].data);
  const deckToggle = (name: string) => screen.getByRole('button', { name });
  /** Opens a deck row through its toggle: every row starts collapsed. */
  const openDeck = async (user: User, deckName: string) => {
    await user.click(await screen.findByRole('button', { name: `Expand ${deckName}` }));
  };
  /** The two clicks an author makes to reach a card's fields. */
  const openDeckAndCard = async (user: User, deckName: string, cardName: string) => {
    await openDeck(user, deckName);
    await openCard(user, cardName);
  };

  // jsdom has no layout: give every droppable currently on screen a distinct,
  // strictly ascending rect in DOM order (Deck 1's header, its card row, then
  // Deck 2's collapsed header) so the stock keyboard coordinate getter can step
  // down into the next deck. Restored after each test.
  let restoreRects: (() => void) | undefined;
  afterEach(() => {
    // A failed assertion can leave a keyboard drag mid-flight; Escape ends it so
    // its document key listener cannot leak into the next test.
    if (document.querySelector('[data-dnd-dragging="true"]')) {
      fireEvent.keyDown(document, { code: 'Escape' });
    }
    restoreRects?.();
    restoreRects = undefined;
  });
  const stubRenderedRects = () => {
    const ids = Array.from(document.querySelectorAll<HTMLElement>('[data-dnd-id]'))
      .map((element) => element.dataset.dndId)
      .filter((id): id is string => id != null);
    const rects = Object.fromEntries(
      ids.map((id, index) => [id, [index * 60, index * 60 + 40] as StubbedRect]),
    );
    // A collapsed deck row is exactly its header: the row's draggable box and the
    // row droppable are one box here, as they are in the real outline.
    ids.filter((id) => id.startsWith('deck-row:')).forEach((id) => {
      const header = rects['deck:' + id.slice('deck-row:'.length)];
      if (header) { rects[id] = header; }
    });
    restoreRects = stubRects(rects);
  };
  const rowOf = (deckName: string) => screen.getByDisplayValue(deckName).closest('.deck-outline-row') as HTMLElement;
  // dnd-kit attaches its document key listener on a timer; let it settle before
  // the first arrow, which jsdom would otherwise drop.
  const settleSensor = () =>
    act(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
    });

  // Every deck is a visible row of its own, all of them collapsed at first,
  // and they open independently. The cards inside come collapsed too.
  it('lists a row per deck, all collapsed, and opens rows independently', async () => {
    const user = userEvent.setup();
    renderEditor();

    expect(await screen.findByRole('button', { name: 'Expand Deck 1' })).toHaveAttribute('aria-expanded', 'false');
    expect(deckToggle('Expand Deck 2')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: 'Reorder One' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reorder Two' })).not.toBeInTheDocument();

    await user.click(deckToggle('Expand Deck 1'));
    await user.click(deckToggle('Expand Deck 2'));

    // Both rows stay open; Deck 1 was not closed by opening Deck 2.
    expect(deckToggle('Collapse Deck 1')).toHaveAttribute('aria-expanded', 'true');
    expect(deckToggle('Collapse Deck 2')).toHaveAttribute('aria-expanded', 'true');

    // Opening a row shows its cards, still collapsed: one at a time, on demand.
    expect(screen.queryByDisplayValue('One')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('Two')).not.toBeInTheDocument();
    await openCard(user, 'One');
    expect(await screen.findByDisplayValue('One')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Two')).not.toBeInTheDocument();
    // Each open deck's Add control names its deck, so they are distinguishable.
    expect(screen.getByRole('button', { name: 'Add card to Deck 1' })).toHaveTextContent('Add card');
    expect(screen.getByRole('button', { name: 'Add card to Deck 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add card to Deck 2' })).toBeInTheDocument();
    // Each drag handle names its card, so a screen reader can tell them apart.
    expect(screen.getByRole('button', { name: 'Reorder One' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reorder Two' })).toBeInTheDocument();
  });

  // A loaded empty deck's own Add button makes the deck's first card.
  it('adds the first card to a loaded empty deck through its Add button', async () => {
    const user = userEvent.setup();
    axiosMock.onPost(handlerUrl('get_settings')).reply(200, {
      game_type: 'flashcards',
      is_shuffled: true,
      has_timer: false,
      cards: [{ term: 'One', definition: 'first', card_key: 'c1' }],
      decks: [
        { deck_key: 'dk-1', name: 'Deck 1', cards: [{ term: 'One', definition: 'first', card_key: 'c1' }] },
        { deck_key: 'dk-2', name: 'Deck 2', cards: [] },
      ],
    });
    const onClose = renderEditor();
    await openDeck(user, 'Deck 2');

    const emptyDeck = rowOf('Deck 2');

    await user.click(within(emptyDeck).getByRole('button', { name: 'Add card to Deck 2' }));

    // The card is created open, in the deck whose button made it.
    await user.type(await within(emptyDeck).findByPlaceholderText('Enter your term'), 'Two');
    await user.type(within(emptyDeck).getByPlaceholderText('Enter your definition'), 'second');
    await user.click(saveButton());

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    const payload = savedPayload();
    expect(payload.decks.map((deck: { deck_key?: string; }) => deck.deck_key)).toEqual(['dk-1', 'dk-2']);
    expect(payload.decks.map((deck: { cards: { term: string; }[]; }) => deck.cards.map((card) => card.term)))
      .toEqual([['One'], ['Two']]);
  });

  it('adds a deck, focuses its name, renames it, and saves every deck with cards mirroring the first', async () => {
    const user = userEvent.setup();
    const onClose = renderEditor();
    await screen.findByRole('button', { name: 'Expand Deck 1' });

    await user.click(screen.getByRole('button', { name: 'Add deck' }));
    const nameInput = await screen.findByDisplayValue('Deck 3');
    // A new deck opens and its name is ready to type over.
    expect(deckToggle('Collapse Deck 3')).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(nameInput).toHaveFocus());
    await user.clear(nameInput);
    await user.type(nameInput, 'Extras');

    await user.click(saveButton());

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    const payload = savedPayload();
    expect(payload.decks.map((deck: { name: string; }) => deck.name)).toEqual(['Deck 1', 'Deck 2', 'Extras']);
    expect(payload.decks.map((deck: { deck_key?: string; }) => deck.deck_key)).toEqual(['dk-1', 'dk-2', undefined]);
    // The block's legacy cards field is the primary deck, not the active one.
    expect(payload.cards).toEqual(payload.decks[0].cards);
    expect(payload.cards).toEqual([expect.objectContaining({ term: 'One', card_key: 'c1' })]);
  });

  // The save carries the order the author left the deck in, and the block's
  // legacy `cards` field stays an exact copy of the primary deck.
  it('saves the reordered cards of a deck, with cards mirroring Deck 1', async () => {
    const user = userEvent.setup();
    axiosMock.onPost(handlerUrl('get_settings')).reply(200, {
      game_type: 'flashcards',
      is_shuffled: true,
      has_timer: false,
      cards: [{ term: 'One', definition: 'first', card_key: 'c1' }],
      decks: [{
        deck_key: 'dk-1',
        name: 'Deck 1',
        cards: [
          { term: 'One', definition: 'first', card_key: 'c1' },
          { term: 'Two', definition: 'second', card_key: 'c2' },
        ],
      }],
    });
    const onClose = renderEditor();
    await openDeck(user, 'Deck 1');

    // The menu sits on the collapsed card, so no field has to be opened first.
    // Move the first card below the second through it.
    await user.click(screen.getAllByRole('button', { name: 'Card actions' })[0]);
    await user.click(await screen.findByText('Move down'));
    await user.click(saveButton());

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    const payload = savedPayload();
    expect(payload.decks).toHaveLength(1);
    expect(payload.decks[0].cards.map((card: { term: string; }) => card.term)).toEqual(['Two', 'One']);
    expect(payload.decks[0].cards.map((card: { order: number; }) => card.order)).toEqual([1, 2]);
    expect(payload.cards).toEqual(payload.decks[0].cards);
  });

  /** Opens the menu of one card row, found by the card's term. */
  const openCardMenu = async (user: User, cardName: string) => {
    await user.click(within(cardRoot(cardName)).getByRole('button', { name: 'Card actions' }));
  };
  /** One item of the card menu that is open. */
  const cardMenuItem = (label: 'Move up' | 'Move down') => screen.findByText(label);
  /**
   * The cards of one deck row, in the order the row draws them. The deck's own
   * handle is in the row too, but it is not inside a card.
   */
  const cardHandlesIn = (deckName: string) =>
    within(rowOf(deckName))
      .queryAllByRole('button', { name: /^Reorder / })
      .filter((handle) => handle.closest('.card') != null);
  const savedTerms = (payload: { decks: { cards: { term: string; }[]; }[]; }) =>
    payload.decks.map((deck) => deck.cards.map((card) => card.term));

  // A deck boundary is a destination, not a stop: the first card of a later
  // deck moves up into the end of the deck above it, through the same
  // transition a drop uses.
  it('moves the first card of a deck up to the end of the previous deck', async () => {
    const user = userEvent.setup();
    const onClose = renderEditor();
    await openDeck(user, 'Deck 1');
    await openDeck(user, 'Deck 2');

    await openCardMenu(user, 'Two');
    // Nothing below the last deck, but a deck above: only that way is offered.
    expect(await cardMenuItem('Move down')).toHaveAttribute('aria-disabled', 'true');
    expect(await cardMenuItem('Move up')).not.toHaveAttribute('aria-disabled', 'true');
    await user.click(await cardMenuItem('Move up'));

    // Deck 1 kept its card and took Deck 2's, which is now empty.
    const deckOne = cardHandlesIn('Deck 1');
    expect(deckOne).toHaveLength(2);
    expect(deckOne[0]).toHaveAccessibleName('Reorder One');
    expect(deckOne[1]).toHaveAccessibleName('Reorder Two');
    expect(cardHandlesIn('Deck 2')).toHaveLength(0);
    // Focus follows the card into the deck it landed in, so the author can keep
    // working from where the card went.
    await waitFor(() => expect(screen.getByRole('button', { name: 'Reorder Two' })).toHaveFocus());

    await user.click(saveButton());
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    const payload = savedPayload();
    expect(savedTerms(payload)).toEqual([['One', 'Two'], []]);
    // The block's legacy mirror is the primary deck.
    expect(payload.cards.map((card: { term: string; }) => card.term)).toEqual(['One', 'Two']);
  });

  // The mirror image: the last card of a deck moves down to the start of the
  // deck below it.
  it('moves the last card of a deck down to the start of the next deck', async () => {
    const user = userEvent.setup();
    const onClose = renderEditor();
    await openDeck(user, 'Deck 1');
    await openDeck(user, 'Deck 2');

    await openCardMenu(user, 'One');
    // Nothing above the first deck, but a deck below: only that way is offered.
    expect(await cardMenuItem('Move up')).toHaveAttribute('aria-disabled', 'true');
    expect(await cardMenuItem('Move down')).not.toHaveAttribute('aria-disabled', 'true');
    await user.click(await cardMenuItem('Move down'));

    // Deck 2 took the card in front of its own, and Deck 1 is empty.
    expect(cardHandlesIn('Deck 1')).toHaveLength(0);
    const deckTwo = cardHandlesIn('Deck 2');
    expect(deckTwo).toHaveLength(2);
    expect(deckTwo[0]).toHaveAccessibleName('Reorder One');
    expect(deckTwo[1]).toHaveAccessibleName('Reorder Two');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Reorder One' })).toHaveFocus());

    await user.click(saveButton());
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    const payload = savedPayload();
    expect(savedTerms(payload)).toEqual([[], ['One', 'Two']]);
    expect(payload.cards).toEqual([]);
  });

  // A real card beside its deck's blank draft sits at that deck's edge: a drop
  // past the draft leaves the draft last, so Move up moves the card above its
  // deck-mate instead of stepping over the draft into Deck 1.
  it('keeps Move up inside a deck whose last row is the blank draft Add made', async () => {
    axiosMock.onPost(handlerUrl('get_settings')).reply(200, {
      game_type: 'flashcards',
      is_shuffled: true,
      has_timer: false,
      // The block's legacy cards field is the primary deck.
      cards: [{ term: 'One', definition: 'first', card_key: 'c1' }],
      decks: [
        { deck_key: 'dk-1', name: 'Deck 1', cards: [{ term: 'One', definition: 'first', card_key: 'c1' }] },
        {
          deck_key: 'dk-2',
          name: 'Deck 2',
          cards: [
            { term: 'Two', definition: 'second', card_key: 'c2' },
            { term: 'Three', definition: 'third', card_key: 'c3' },
          ],
        },
      ],
    });
    const user = userEvent.setup();
    const onClose = renderEditor();
    await openDeck(user, 'Deck 1');
    await openDeck(user, 'Deck 2');

    // The Add button's draft is the deck's trailing blank card. It is editor
    // state, not content, so it has no handle to drag.
    await user.click(within(rowOf('Deck 2')).getByRole('button', { name: 'Add card to Deck 2' }));
    expect(await screen.findByPlaceholderText('Enter your term')).toBeInTheDocument();
    expect(cardHandlesIn('Deck 2')).toHaveLength(2);

    stubRenderedRects();
    screen.getByRole('button', { name: 'Reorder Two' }).focus();
    await user.keyboard(' ');
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Picked up Two in Deck 2'));
    await settleSensor();

    // Down over Three, then over the draft the drop must leave last.
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Two moved over position 2 of Deck 2'));
    await user.keyboard('{ArrowDown}');
    await user.keyboard(' ');
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/Dropped Two .*Deck 2/));

    const dropped = cardHandlesIn('Deck 2');
    expect(dropped).toHaveLength(2);
    expect(dropped[0]).toHaveAccessibleName('Reorder Three');
    expect(dropped[1]).toHaveAccessibleName('Reorder Two');

    // At that edge, Move up still goes somewhere: up within its own deck only.
    await openCardMenu(user, 'Two');
    expect(await cardMenuItem('Move up')).not.toHaveAttribute('aria-disabled', 'true');
    await user.click(await cardMenuItem('Move up'));

    const deckTwo = cardHandlesIn('Deck 2');
    expect(deckTwo).toHaveLength(2);
    expect(deckTwo[0]).toHaveAccessibleName('Reorder Two');
    expect(deckTwo[1]).toHaveAccessibleName('Reorder Three');
    // Nothing crossed the deck boundary: Deck 1 kept its one card.
    const deckOne = cardHandlesIn('Deck 1');
    expect(deckOne).toHaveLength(1);
    expect(deckOne[0]).toHaveAccessibleName('Reorder One');

    await user.click(saveButton());
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    // The draft was never content: the save drops it.
    expect(savedTerms(savedPayload())).toEqual([['One'], ['Two', 'Three']]);
  });

  // A card with no term still gets a readable handle name instead of the
  // composed "Reorder No text".
  it('names the drag handle of a card that has no term', async () => {
    axiosMock.onPost(handlerUrl('get_settings')).reply(200, {
      game_type: 'flashcards',
      is_shuffled: true,
      has_timer: false,
      cards: [{ term: '', definition: 'only a definition', card_key: 'c1' }],
      decks: [{
        deck_key: 'dk-1',
        name: 'Deck 1',
        cards: [{ term: '', definition: 'only a definition', card_key: 'c1' }],
      }],
    });
    const user = userEvent.setup();
    renderEditor();
    await openDeck(user, 'Deck 1');

    expect(await screen.findByRole('button', { name: 'Reorder card with no text' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Reorder No text/ })).not.toBeInTheDocument();
  });

  // The whole keyboard path through the real editor: the card is opened first,
  // the drag collapses it for real - no copy follows the pointer - the hovered
  // deck opens itself, and the save carries the new deck.
  it('moves a card into another deck with the keyboard and saves both decks', async () => {
    const user = userEvent.setup();
    const onClose = renderEditor();
    await openDeckAndCard(user, 'Deck 1', 'One');
    expect(await screen.findByDisplayValue('One')).toBeInTheDocument();

    stubRenderedRects();
    screen.getByRole('button', { name: 'Reorder One' }).focus();
    await user.keyboard(' ');
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Picked up One in Deck 1'));

    // The real card collapses as the drag starts: what moves is the compact
    // card, not the form that was open a moment ago.
    await waitFor(() => expect(screen.queryByDisplayValue('One')).not.toBeInTheDocument());
    expect(within(cardRoot('One')).getByRole('button', { name: 'Expand card' })).toBeInTheDocument();

    await settleSensor();

    // One step down reaches the collapsed Deck 2 header, which opens on hover
    // and previews the card at the end of its cards.
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('moved over the end of Deck 2'));
    expect(deckToggle('Collapse Deck 2')).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard(' ');
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('at the end of Deck 2'));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Reorder One' })).toHaveFocus());

    // Dropped, the card is still the collapsed one, now in Deck 2.
    expect(within(rowOf('Deck 2')).getByText('One')).toBeInTheDocument();
    expect(within(rowOf('Deck 1')).queryByText('One')).not.toBeInTheDocument();
    expect(within(cardRoot('One')).getByRole('button', { name: 'Expand card' })).toBeInTheDocument();
    expect(screen.queryByDisplayValue('One')).not.toBeInTheDocument();

    await user.click(saveButton());
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));

    const payload = savedPayload();
    expect(payload.decks.map((deck: { name: string; }) => deck.name)).toEqual(['Deck 1', 'Deck 2']);
    expect(payload.decks[0]).toEqual(expect.objectContaining({ deck_key: 'dk-1', cards: [] }));
    expect(payload.decks[1]).toEqual(expect.objectContaining({ deck_key: 'dk-2' }));
    expect(payload.decks[1].cards).toEqual([
      expect.objectContaining({ term: 'Two', card_key: 'c2', order: 1 }),
      expect.objectContaining({ term: 'One', card_key: 'c1', order: 2 }),
    ]);
    // The legacy mirror is the primary deck, which the drag emptied.
    expect(payload.cards).toEqual([]);
  });

  // A deck reorder is the stored order: the deck moved first becomes the block's
  // primary deck, and the legacy `cards` field mirrors it. A deck that is
  // open when it is picked up closes, so the row that travels is compact.
  it('collapses the deck it picks up, reorders with the keyboard, and saves the new primary deck first', async () => {
    const user = userEvent.setup();
    const onClose = renderEditor();
    await screen.findByRole('button', { name: 'Reorder Deck 2' });
    await openDeck(user, 'Deck 2');
    expect(deckToggle('Collapse Deck 2')).toHaveAttribute('aria-expanded', 'true');

    stubRenderedRects();
    screen.getByRole('button', { name: 'Reorder Deck 2' }).focus();
    await user.keyboard(' ');
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Picked up Deck 2 at position 2 of the deck list.')
    );
    // Picked up, the open deck is already closed: the drag collapses it.
    expect(await screen.findByRole('button', { name: 'Expand Deck 2' })).toHaveAttribute('aria-expanded', 'false');
    await settleSensor();

    await user.keyboard('{ArrowUp}');
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Deck 2 moved over position 1 of the deck list.')
    );

    // Enter drops as well as Space.
    await user.keyboard('{Enter}');
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Dropped Deck 2 at position 1 of the deck list.')
    );
    // Focus follows the deck to the row it landed in.
    await waitFor(() => expect(screen.getByRole('button', { name: 'Reorder Deck 2' })).toHaveFocus());

    // The rows are drawn in the order the author left them in.
    const names = screen.getAllByDisplayValue(/^Deck [12]$/).map((input) => (input as HTMLInputElement).value);
    expect(names).toEqual(['Deck 2', 'Deck 1']);
    // The drop leaves the moved deck as closed as the pickup did.
    expect(deckToggle('Expand Deck 2')).toHaveAttribute('aria-expanded', 'false');

    await user.click(saveButton());
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));

    const payload = savedPayload();
    expect(payload.decks.map((deck: { name: string; }) => deck.name)).toEqual(['Deck 2', 'Deck 1']);
    expect(payload.decks.map((deck: { deck_key?: string; }) => deck.deck_key)).toEqual(['dk-2', 'dk-1']);
    // Saved order is authoritative: the deck moved first is the primary one, and
    // the block's legacy cards field copies it.
    expect(payload.cards).toEqual(payload.decks[0].cards);
    expect(payload.cards.map((card: { term: string; }) => card.term)).toEqual(['Two']);
  });

  // Escape a deck drag: nothing reached the store either, so leaving the editor
  // asks nothing and no request goes out.
  it('cancels a keyboard deck drag without dirtying the editor', async () => {
    const user = userEvent.setup();
    const onClose = renderEditor();
    await screen.findByRole('button', { name: 'Reorder Deck 2' });

    stubRenderedRects();
    screen.getByRole('button', { name: 'Reorder Deck 2' }).focus();
    await user.keyboard(' ');
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Picked up Deck 2 at position 2 of the deck list.')
    );
    await settleSensor();

    await user.keyboard('{ArrowUp}');
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Deck 2 moved over position 1 of the deck list.')
    );
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Drag cancelled.'));

    // The stored order is untouched, so leaving is not "discarding changes".
    expect(screen.getAllByDisplayValue(/^Deck [12]$/).map((input) => (input as HTMLInputElement).value))
      .toEqual(['Deck 1', 'Deck 2']);
    await user.click(screen.getByRole('button', { name: 'Discard changes and return to learning context' }));
    expect(screen.queryByText('Exit the editor?')).not.toBeInTheDocument();
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(savePosts(axiosMock)).toHaveLength(0);
  });

  // Escape after the preview: nothing reached the store, so closing the editor
  // is not "discarding changes" and no request goes out.
  it('cancels a keyboard drag without dirtying the editor', async () => {
    const user = userEvent.setup();
    const onClose = renderEditor();
    await openDeckAndCard(user, 'Deck 1', 'One');

    stubRenderedRects();
    screen.getByRole('button', { name: 'Reorder One' }).focus();
    await user.keyboard(' ');
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Picked up One in Deck 1'));
    await settleSensor();

    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('moved over the end of Deck 2'));

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Drag cancelled.'));
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('One stayed in Deck 1');
    // Human labels only: card and deck ids are uuids, never announced.
    expect(status).not.toHaveTextContent(/[0-9a-f]{8}-[0-9a-f]{4}/);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Reorder One' })).toHaveFocus());

    // Cancelled, the card is back in Deck 1, still collapsed by the drag.
    expect(within(rowOf('Deck 1')).getByText('One')).toBeInTheDocument();
    expect(within(rowOf('Deck 2')).queryByText('One')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Discard changes and return to learning context' }));
    expect(screen.queryByText('Exit the editor?')).not.toBeInTheDocument();
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(savePosts(axiosMock)).toHaveLength(0);
  });

  // A deck whose name is broken opens itself, so the message is never hidden
  // behind a collapsed row.
  it('opens the rows with invalid names and blocks the save', async () => {
    const user = userEvent.setup();
    const onClose = renderEditor();
    await screen.findByDisplayValue('Deck 1');

    const secondName = screen.getByDisplayValue('Deck 2');
    await user.clear(secondName);
    await user.type(secondName, 'deck 1');

    // Both rows opened, so neither deck's message is hidden. What is inside a
    // row is untouched: opening a deck is not opening its cards.
    expect(await screen.findByRole('button', { name: 'Reorder One' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reorder Two' })).toBeInTheDocument();
    expect(screen.queryByDisplayValue('One')).not.toBeInTheDocument();
    // Both sides of the clash are flagged, each beside its own name field.
    expect(await screen.findAllByText('Deck names must be unique')).toHaveLength(2);

    await user.click(saveButton());

    expect(await screen.findByText('Deck names need fixing')).toBeInTheDocument();
    expect(screen.getByText('Every deck needs a name and no two decks can share one.')).toBeInTheDocument();
    expect(savePosts(axiosMock)).toHaveLength(0);
    expect(onClose).not.toHaveBeenCalled();

    // The blocked save hands the caret to the first invalid name: the rows are
    // open, so the author lands where the repair starts.
    await waitFor(() => expect(screen.getByDisplayValue('Deck 1')).toHaveFocus());
  });

  // Deck controls belong to Flashcards. Matching renders one flat list, so a
  // name broken there is hidden, blocked at save, and repaired after switching back.
  it('hides deck authoring in Matching, blocks its save, and repairs the names in Flashcards', async () => {
    const user = userEvent.setup();
    const onClose = renderEditor();
    await screen.findByDisplayValue('Deck 1');

    // Two decks share a name after editing in Flashcards.
    const secondName = screen.getByDisplayValue('Deck 2');
    await user.clear(secondName);
    await user.type(secondName, 'deck 1');
    expect(await screen.findAllByText('Deck names must be unique')).toHaveLength(2);

    await user.click(screen.getByText('Type'));
    await user.click(screen.getByRole('button', { name: 'Matching' }));

    // Matching keeps the primary deck's cards but none of the deck controls:
    // no deck list, name field, add or delete.
    expect(screen.getByRole('button', { name: 'Reorder One' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Decks' })).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('Deck 1')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('deck 1')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add deck' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Delete Deck/ })).not.toBeInTheDocument();

    await user.click(saveButton());

    // The page-level alert says what is wrong without pointing at hidden fields,
    // and nothing is sent.
    expect(await screen.findByText('Deck names need fixing')).toBeInTheDocument();
    expect(screen.getByText('Every deck needs a name and no two decks can share one.')).toBeInTheDocument();
    expect(savePosts(axiosMock)).toHaveLength(0);
    expect(onClose).not.toHaveBeenCalled();

    // Flashcards brings the invalid rows back, opened and focused to be repaired.
    await user.click(screen.getByRole('button', { name: 'Flashcards' }));
    expect(await screen.findByDisplayValue('deck 1')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByDisplayValue('Deck 1')).toHaveFocus());

    const duplicate = screen.getByDisplayValue('deck 1');
    await user.clear(duplicate);
    await user.type(duplicate, 'Deck 2');
    await waitFor(() => expect(screen.queryByText('Deck names need fixing')).not.toBeInTheDocument());

    await user.click(saveButton());
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(savedPayload().game_type).toEqual('flashcards');
    expect(savedPayload().decks.map((deck: { name: string; }) => deck.name)).toEqual(['Deck 1', 'Deck 2']);
  });

  // The rows flag a bad name as it is typed, before the author tries to save.
  it('flags an empty and a duplicate name while the author types', async () => {
    const user = userEvent.setup();
    renderEditor();
    await screen.findByDisplayValue('Deck 1');

    const secondName = screen.getByDisplayValue('Deck 2');
    await user.clear(secondName);
    expect(await screen.findByText('Enter a deck name')).toBeInTheDocument();
    expect(secondName).toHaveFocus();
    // The row opened itself so the message is visible: its body is rendered.
    expect(await screen.findByRole('button', { name: 'Reorder Two' })).toBeInTheDocument();

    await user.type(secondName, 'deck 1');
    // Both decks are flagged: the clash is not the second deck's fault alone.
    expect(await screen.findAllByText('Deck names must be unique')).toHaveLength(2);
  });

  // A name that is briefly a duplicate on the way to a unique one must not move
  // the caret: 'deck 10' passes through 'deck 1' for one keystroke.
  it('keeps the caret in the deck being renamed through a transient duplicate', async () => {
    const user = userEvent.setup();
    renderEditor();
    await screen.findByDisplayValue('Deck 1');

    const secondName = screen.getByDisplayValue('Deck 2');
    await user.clear(secondName);
    await user.type(secondName, 'deck 10');

    // Every keystroke stayed in the second deck's field, and the first is intact.
    expect(secondName).toHaveValue('deck 10');
    expect(screen.getByDisplayValue('Deck 1')).toHaveValue('Deck 1');
    expect(secondName).toHaveFocus();
    expect(screen.queryByText('Deck names must be unique')).not.toBeInTheDocument();
  });

  // A card error inside a collapsed deck and a collapsed card must not be
  // invisible: the save opens both, so it has a visible cause.
  it('opens a collapsed deck and card that failed validation', async () => {
    const user = userEvent.setup();
    const onClose = renderEditor();
    await openDeckAndCard(user, 'Deck 2', 'Two');
    // The term is left alone: the card's drag handle is named after it.
    await user.clear(await screen.findByDisplayValue('second'));

    // Close both again: the author is looking at a collapsed outline when they
    // press Save.
    await user.click(within(cardRoot('Two')).getByRole('button', { name: 'Collapse card' }));
    await user.click(deckToggle('Collapse Deck 2'));
    expect(deckToggle('Expand Deck 2')).toHaveAttribute('aria-expanded', 'false');

    await user.click(saveButton());

    expect(await screen.findByText('Enter a definition')).toBeInTheDocument();
    expect(deckToggle('Collapse Deck 2')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByDisplayValue('Two')).toBeInTheDocument();
    expect(savePosts(axiosMock)).toHaveLength(0);
    expect(onClose).not.toHaveBeenCalled();
  });

  // An empty deck holds nothing to lose, so it goes without a prompt.
  it('deletes an empty deck without asking', async () => {
    const user = userEvent.setup();
    renderEditor();
    await screen.findByDisplayValue('Deck 1');

    await user.click(screen.getByRole('button', { name: 'Add deck' }));
    expect(await screen.findByDisplayValue('Deck 3')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete Deck 3' }));

    expect(screen.queryByText('Delete deck?')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('Deck 3')).not.toBeInTheDocument();
  });

  it('deletes a deck with cards after confirmation, and cannot delete the last one', async () => {
    const user = userEvent.setup();
    renderEditor();
    await screen.findByDisplayValue('Deck 1');

    await user.click(deckToggle('Expand Deck 2'));
    expect(await screen.findByRole('button', { name: 'Reorder Two' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete Deck 2' }));
    expect(await screen.findByText('Delete deck?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete deck' }));

    // The deck that takes over opens and takes the caret; its card stays as
    // the author left it.
    await waitFor(() => expect(deckToggle('Collapse Deck 1')).toHaveAttribute('aria-expanded', 'true'));
    await waitFor(() => expect(screen.getByDisplayValue('Deck 1')).toHaveFocus());
    expect(screen.queryByDisplayValue('Deck 2')).not.toBeInTheDocument();
    // The last deck cannot be deleted.
    expect(screen.getByRole('button', { name: 'Delete Deck 1' })).toBeDisabled();
  });
});

describe('GamesEditor deck authoring availability', () => {
  let axiosMock: ReturnType<typeof initializeMocks>['axiosMock'];

  const card = { term: 'One', definition: 'first', card_key: 'c1' };

  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
    axiosMock.onPost(handlerUrl('save_settings')).reply(200, { success: true });
  });

  const mockSettings = (body: unknown) => axiosMock.onPost(handlerUrl('get_settings')).reply(200, body);

  // A backend that predates decks answers with cards only; offering deck
  // authoring there would let an author create decks the block cannot keep.
  it('hides deck authoring when the block returns only cards', async () => {
    mockSettings({ game_type: 'flashcards', is_shuffled: true, has_timer: false, cards: [card] });
    renderEditor();

    expect(await screen.findByRole('button', { name: 'Reorder One' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add deck' })).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('Deck 1')).not.toBeInTheDocument();

    // The card menu keeps its own actions; moving between decks is a drag now.
    await userEvent.setup().click(screen.getByRole('button', { name: 'Card actions' }));
    expect(screen.getByText('Move up')).toBeInTheDocument();
    expect(screen.getByText('Move down')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.queryByText(/^Move to /)).not.toBeInTheDocument();
  });

  it('offers deck authoring when the block returns decks', async () => {
    mockSettings({
      game_type: 'flashcards',
      is_shuffled: true,
      has_timer: false,
      cards: [card],
      decks: [{ deck_key: 'dk-1', name: 'Deck 1', cards: [card] }],
    });
    renderEditor();

    expect(await screen.findByDisplayValue('Deck 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add deck' })).toBeInTheDocument();
  });

  // Matching renders the block's primary deck only, so deck authoring would
  // offer edits the game type cannot use.
  it('hides deck authoring for a matching game', async () => {
    mockSettings({
      game_type: 'matching',
      is_shuffled: true,
      has_timer: true,
      cards: [card],
      decks: [{ deck_key: 'dk-1', name: 'Deck 1', cards: [card] }],
    });
    renderEditor();

    expect(await screen.findByRole('button', { name: 'Reorder One' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add deck' })).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('Deck 1')).not.toBeInTheDocument();
  });
});

// The settings fetch decides what a save would write, so Save waits for it
// rather than accepting a click that could only fail.
describe('before the game settings arrive', () => {
  it('keeps Save disabled until they load', async () => {
    const { axiosMock } = initializeMocks();
    let resolveLoad: (body: unknown) => void = () => {};
    const load = new Promise<[number, unknown]>((resolve) => {
      resolveLoad = (body) => resolve([200, body]);
    });
    axiosMock.onPost(handlerUrl('get_settings')).reply(() => load);
    axiosMock.onPost(handlerUrl('save_settings')).reply(200, { success: true });
    const onClose = renderEditor();

    expect(saveButton()).toBeDisabled();

    await act(async () => resolveLoad({ game_type: 'flashcards', cards: [] }));
    await waitFor(() => expect(saveButton()).toBeEnabled());
    expect(savePosts(axiosMock)).toHaveLength(0);
    expect(onClose).not.toHaveBeenCalled();
  });
});

// Offline, a lost session or a 5xx never produces the block's `success: false`
// body: the request itself fails. The author must see it, keep the work, and be
// able to try again.
describe('a save the network never delivered', () => {
  let axiosMock: ReturnType<typeof initializeMocks>['axiosMock'];

  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
    axiosMock.onPost(handlerUrl('get_settings')).reply(200, {
      game_type: 'flashcards',
      is_shuffled: true,
      has_timer: false,
      cards: [{ term: 'Photosynthesis', definition: 'How plants eat', card_key: 'k1' }],
    });
    axiosMock.onPost(handlerUrl('save_settings')).networkError();
  });

  // The click, as the author makes it: edit a card, press Save.
  const saveFailing = async () => {
    const user = userEvent.setup();
    const onClose = renderEditor();
    await openCard(user, 'Photosynthesis');
    await user.type(await screen.findByDisplayValue('Photosynthesis'), ' now');
    await user.click(saveButton());
    return { user, onClose };
  };

  it('shows the failure and keeps the unsaved work', async () => {
    const { user, onClose } = await saveFailing();

    expect(await screen.findByText('The game could not be saved.')).toBeInTheDocument();
    expect(screen.getByText('Network Error')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue('Photosynthesis now')).toBeInTheDocument();

    // Save is offered again, and leaving still asks: nothing was persisted.
    await waitFor(() => expect(saveButton()).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Discard changes and return to learning context' }));
    expect(await screen.findByText('Exit the editor?')).toBeInTheDocument();
  });

  it('saves when a later attempt lands', async () => {
    const { user, onClose } = await saveFailing();
    await waitFor(() => expect(saveButton()).toBeEnabled());

    axiosMock.resetHandlers();
    axiosMock.onPost(handlerUrl('save_settings')).reply(200, { success: true });
    await user.click(saveButton());

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });
});

// Matching renders the primary deck and no deck rows, so a card error in another
// deck has no row to open. The author must be told which deck to repair, and
// where.
describe('a card error hidden by Matching', () => {
  let axiosMock: ReturnType<typeof initializeMocks>['axiosMock'];

  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
    axiosMock.onPost(handlerUrl('get_settings')).reply(200, {
      game_type: 'matching',
      is_shuffled: true,
      has_timer: true,
      cards: [{ term: 'One', definition: 'first', card_key: 'c1' }],
      decks: [
        { deck_key: 'dk-1', name: 'Deck 1', cards: [{ term: 'One', definition: 'first', card_key: 'c1' }] },
        { deck_key: 'dk-2', name: 'Ecology', cards: [{ term: 'Two', definition: '', card_key: 'c2' }] },
      ],
    });
    axiosMock.onPost(handlerUrl('save_settings')).reply(200, { success: true });
  });

  it('names the deck to repair in Flashcards, and saves once it is fixed', async () => {
    const user = userEvent.setup();
    const onClose = renderEditor();
    await screen.findByRole('button', { name: 'Reorder One' });

    await user.click(saveButton());

    // The blocked save names the deck Matching cannot show, and the way out.
    expect(
      await screen.findByText(
        'Cards in Ecology need fixing before this game can be saved. Switch to Flashcards to repair them.',
      ),
    ).toBeInTheDocument();
    expect(savePosts(axiosMock)).toHaveLength(0);
    expect(onClose).not.toHaveBeenCalled();

    // Flashcards brings that deck's rows back, opened on the failed card.
    await user.click(screen.getByText('Type'));
    await user.click(screen.getByRole('button', { name: 'Flashcards' }));
    const term = await screen.findByDisplayValue('Two');
    expect(await screen.findByDisplayValue('Ecology')).toBeInTheDocument();
    expect(screen.queryByText(/Switch to Flashcards/)).not.toBeInTheDocument();

    await user.type(within(term.closest('.card') as HTMLElement).getByLabelText('Definition'), 'second');
    await user.click(saveButton());

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    const payload = JSON.parse(savePosts(axiosMock)[0].data);
    expect(payload.decks.map((deck: { name: string; }) => deck.name)).toEqual(['Deck 1', 'Ecology']);
    expect(payload.decks[1].cards[0].definition).toEqual('second');
  });
});

// The settings triggers are role="button" divs, out of the disabled fieldset's
// reach, so a save that is out has to be refused by the trigger itself.
describe('a save that is still out', () => {
  let axiosMock: ReturnType<typeof initializeMocks>['axiosMock'];
  let finishSave: (body: unknown) => void = () => {};

  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
    axiosMock.onPost(handlerUrl('get_settings')).reply(200, {
      game_type: 'flashcards',
      is_shuffled: true,
      has_timer: false,
      cards: [{ term: 'One', definition: 'first', card_key: 'c1' }],
      decks: [{ deck_key: 'dk-1', name: 'Deck 1', cards: [{ term: 'One', definition: 'first', card_key: 'c1' }] }],
    });
    const pending = new Promise<[number, unknown]>((resolve) => {
      finishSave = (body) => resolve([200, body]);
    });
    axiosMock.onPost(handlerUrl('save_settings')).reply(() => pending);
  });

  it('refuses the settings trigger while it waits, and reopens it once the save fails', async () => {
    const user = userEvent.setup();
    const onClose = renderEditor();
    await screen.findByDisplayValue('Deck 1');
    const trigger = screen.getByRole('button', { name: 'Shuffle' });

    await user.click(saveButton());

    await waitFor(() => expect(trigger).toHaveAttribute('aria-disabled', 'true'));
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    trigger.focus();
    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: 'Off' })).not.toBeInTheDocument();

    // The rejected save leaves the author where they were, with the card usable
    // again.
    await act(async () => finishSave({ success: false, error: 'nope' }));
    await waitFor(() => expect(trigger).toHaveAttribute('aria-disabled', 'false'));
    expect(onClose).not.toHaveBeenCalled();

    // Unlocked means usable, not just unmarked: the author opens the card again.
    await user.click(screen.getByRole('button', { name: 'Shuffle' }));
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Off' })).toBeInTheDocument();
  });
});
