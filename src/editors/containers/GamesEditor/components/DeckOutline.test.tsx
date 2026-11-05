import React from 'react';
import userEvent from '@testing-library/user-event';
import {
  initializeMocks,
  render,
  screen,
  waitFor,
} from '@src/testUtils';

import DeckOutline, { type DeckOutlineSummary } from './DeckOutline';

const decks: DeckOutlineSummary[] = [
  { id: 'deck-1', name: 'Deck 1', cardCount: 2 },
  { id: 'deck-2', name: 'Deck 2', cardCount: 0 },
  { id: 'deck-3', name: 'Ecology', cardCount: 1 },
];

const renderOutline = ({
  deckList = decks,
  activeDeckId = 'deck-1',
  nameErrors = {},
  cardErrorDeckIds = [],
  focusRequest = 0,
  isSaving = false,
  onAdd = jest.fn(),
}: {
  deckList?: DeckOutlineSummary[];
  activeDeckId?: string;
  nameErrors?: Record<string, 'required' | 'duplicate' | undefined>;
  cardErrorDeckIds?: string[];
  focusRequest?: number;
  isSaving?: boolean;
  onAdd?: () => void;
} = {}) => {
  const onSelect = jest.fn();
  const onRename = jest.fn();
  const onDelete = jest.fn();
  const outlineElement = (saving: boolean) => (
    <DeckOutline
      decks={deckList}
      activeDeckId={activeDeckId}
      nameErrors={nameErrors}
      cardErrorDeckIds={cardErrorDeckIds}
      focusRequest={focusRequest}
      isSaving={saving}
      onSelect={onSelect}
      onRename={onRename}
      onDelete={onDelete}
      onAdd={onAdd}
      renderDeck={(deckId) => <div>{`Cards of ${deckId}`}</div>}
    />
  );
  const { rerender } = render(outlineElement(isSaving));
  return {
    onSelect,
    onRename,
    onDelete,
    onAdd,
    /** Re-renders the same outline with the save state settled. */
    rerender: (savingNext: boolean) => rerender(outlineElement(savingNext)),
  };
};

const toggle = (name: string) => screen.getByRole('button', { name });

describe('DeckOutline', () => {
  beforeEach(() => {
    initializeMocks();
  });

  // Each row drags by its own handle, named after the deck so several rows are
  // distinguishable, and the handle sits in the header before the toggle.
  it('names every deck drag handle after its deck', () => {
    renderOutline();

    expect(screen.getByRole('button', { name: 'Reorder Deck 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reorder Deck 2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reorder Ecology' })).toBeInTheDocument();
  });

  // A blank name has nothing to be read as: the handle names the row's position.
  it('names the handle of a deck with no name by its position', () => {
    renderOutline({
      deckList: [
        { id: 'deck-1', name: '   ', cardCount: 0 },
        { id: 'deck-2', name: 'Deck 2', cardCount: 0 },
      ],
    });

    expect(screen.getByRole('button', { name: 'Reorder deck 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reorder Deck 2' })).toBeInTheDocument();
  });

  // One deck has no order to change, so its handle is there but inert.
  it('disables the drag handle when there is only one deck', () => {
    renderOutline({ deckList: [decks[0]] });

    expect(screen.getByRole('button', { name: 'Reorder Deck 1' })).toBeDisabled();
  });

  // A save in flight is a disabled fieldset: a reorder typed now could not be
  // carried, so the handles are inert for the wait.
  it('locks the drag handles while a save is in flight', () => {
    const { rerender } = renderOutline();
    expect(screen.getByRole('button', { name: 'Reorder Deck 1' })).toBeEnabled();

    rerender(true);
    expect(screen.getByRole('button', { name: 'Reorder Deck 1' })).toBeDisabled();

    rerender(false);
    expect(screen.getByRole('button', { name: 'Reorder Deck 1' })).toBeEnabled();
  });

  it('collapses the deck when its reorder handle is pressed', async () => {
    const user = userEvent.setup();
    renderOutline();

    await user.click(toggle('Expand Deck 1'));
    expect(toggle('Collapse Deck 1')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Cards of deck-1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reorder Deck 1' }));

    expect(toggle('Expand Deck 1')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Cards of deck-1')).not.toBeInTheDocument();
  });

  // A live name error opens its row without stealing the caret; a save that
  // found bad names asks once, and only then is the caret moved.
  it('opens the invalid rows and focuses the first invalid name on request', () => {
    renderOutline({ nameErrors: { 'deck-2': 'duplicate', 'deck-3': 'required' }, focusRequest: 1 });

    expect(toggle('Collapse Deck 2')).toHaveAttribute('aria-expanded', 'true');
    expect(toggle('Collapse Ecology')).toHaveAttribute('aria-expanded', 'true');
    // Each message stays attached to the field it is about.
    expect(screen.getByLabelText('Deck 2 name')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Deck 2 name')).toHaveAttribute(
      'aria-describedby',
      'deck-outline-name-error-deck-2',
    );
    expect(screen.getByText('Deck names must be unique')).toBeInTheDocument();
    expect(screen.getByText('Enter a deck name')).toBeInTheDocument();
    expect(screen.getByLabelText('Deck 2 name')).toHaveFocus();
  });

  it('opens a deck that holds a card with an error', () => {
    renderOutline({ cardErrorDeckIds: ['deck-2'] });

    expect(toggle('Collapse Deck 2')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Cards of deck-2')).toBeInTheDocument();
  });

  // Deleting the deck the author was working in must leave them somewhere:
  // the deck that takes over opens and takes the focus.
  it('opens and focuses the replacement deck after deleting the active one', async () => {
    const user = userEvent.setup();
    const Harness = () => {
      const [deckList, setDeckList] = React.useState([
        { id: 'deck-1', name: 'Deck 1', cardCount: 2 },
        { id: 'deck-2', name: 'Deck 2', cardCount: 2 },
      ]);
      const [active, setActive] = React.useState('deck-2');
      return (
        <DeckOutline
          decks={deckList}
          activeDeckId={active}
          nameErrors={{}}
          onSelect={setActive}
          onRename={() => undefined}
          onDelete={(deckId) => {
            setDeckList((current) => current.filter((deck) => deck.id !== deckId));
            if (deckId === active) { setActive('deck-1'); }
          }}
          onAdd={() => undefined}
          renderDeck={(deckId) => <div>{`Cards of ${deckId}`}</div>}
        />
      );
    };
    render(<Harness />);

    // Both rows start collapsed; deleting the active deck opens its replacement.
    expect(toggle('Expand Deck 1')).toHaveAttribute('aria-expanded', 'false');
    await user.click(screen.getByRole('button', { name: 'Delete Deck 2' }));
    await user.click(screen.getByRole('button', { name: 'Delete deck' }));

    expect(toggle('Collapse Deck 1')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Cards of deck-1')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText('Deck 1 name')).toHaveFocus());
  });

  // The toggle is a role="button" div, so it has to answer Space as well as
  // Enter, and name the body it controls — but only while that body exists,
  // because a collapsed row unmounts it.
  it('toggles a row with Space and Enter, pointing at the body only while it exists', async () => {
    const user = userEvent.setup();
    const { onSelect } = renderOutline();

    const trigger = toggle('Expand Deck 2');
    // Collapsed: the body is not in the DOM, so the trigger must not name it.
    expect(trigger).not.toHaveAttribute('aria-controls');

    trigger.focus();
    await user.keyboard(' ');
    const expanded = toggle('Collapse Deck 2');
    expect(expanded).toHaveAttribute('aria-expanded', 'true');
    expect(expanded).toHaveAttribute('aria-controls', 'deck-outline-body-deck-2');
    expect(screen.getByText('Cards of deck-2')).toBeInTheDocument();
    expect(document.getElementById('deck-outline-body-deck-2')).toBeInTheDocument();
    // Opening a row is what makes its deck the one being edited.
    expect(onSelect).toHaveBeenCalledWith('deck-2');

    await user.keyboard('{Enter}');
    const collapsed = toggle('Expand Deck 2');
    expect(collapsed).toHaveAttribute('aria-expanded', 'false');
    expect(collapsed).not.toHaveAttribute('aria-controls');
    // Closing is navigation, not a selection: the deck stays the active one.
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  // A save in flight wraps the whole form in a disabled fieldset, where focus()
  // is a no-op: the request must stay unhandled until the save settles.
  it('waits for the save to settle before focusing the first invalid name', async () => {
    const { rerender } = renderOutline({
      nameErrors: { 'deck-2': 'duplicate' },
      focusRequest: 1,
      isSaving: true,
    });

    expect(screen.getByLabelText('Deck 2 name')).not.toHaveFocus();

    rerender(false);

    await waitFor(() => expect(screen.getByLabelText('Deck 2 name')).toHaveFocus());
  });

  // The trigger is a role="button" div, so the disabled fieldset never reaches
  // it: it has to refuse the toggle itself.
  it('locks the deck triggers while a save is in flight', async () => {
    const user = userEvent.setup();
    const { onSelect } = renderOutline({ isSaving: true });

    expect(toggle('Expand Deck 2')).toHaveAttribute('aria-disabled', 'true');

    await user.click(toggle('Expand Deck 2'));
    expect(toggle('Expand Deck 2')).toHaveAttribute('aria-expanded', 'false');

    // Space is our own handler; Enter is Paragon's trigger. Both must be refused.
    toggle('Expand Deck 2').focus();
    await user.keyboard(' ');
    expect(toggle('Expand Deck 2')).toHaveAttribute('aria-expanded', 'false');

    await user.keyboard('{Enter}');

    expect(toggle('Expand Deck 2')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Cards of deck-2')).not.toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();
  });
});
