import React from 'react';
import userEvent from '@testing-library/user-event';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { initializeMocks, render } from '@src/testUtils';

import { emptyCard } from '../data/gameTransitions';
import type { Card } from '../types';
import GameCard from './GameCard';

const card = (over: Partial<Card> = {}): Card => ({
  ...emptyCard(),
  id: 'c1',
  term: 'One',
  definition: 'first',
  card_key: 'key-c1',
  editorOpen: false,
  ...over,
});

/** GameCard drags through dnd-kit, so it needs the context the editor gives it. */
const renderCard = (props: Partial<React.ComponentProps<typeof GameCard>> = {}) => {
  const handlers = {
    onToggle: jest.fn(),
    onChange: jest.fn(),
    onMoveUp: jest.fn(),
    onMoveDown: jest.fn(),
    onDelete: jest.fn(),
    onImagePicked: jest.fn(),
    onImageRemoved: jest.fn(),
    onOpenImageSettings: jest.fn(),
  };
  const { container } = render(
    <DndContext>
      <SortableContext items={['c1']}>
        <GameCard
          card={card()}
          index={0}
          type="flashcards"
          studioEndpointUrl="http://studio.example"
          errors={{}}
          isSaving={false}
          canMoveUp={false}
          canMoveDown={false}
          {...handlers}
          {...props}
        />
      </SortableContext>
    </DndContext>,
  );
  // The dropdown toggle carries aria-expanded too, so the heading is named by
  // the class its own styles use.
  const heading = container.querySelector('.card-heading-wrapper') as HTMLElement;
  return { ...handlers, heading };
};

describe('GameCard', () => {
  beforeEach(() => {
    initializeMocks();
  });

  // The heading is a role="button" div, out of the disabled fieldset's reach and
  // without a name a journey could pick it out by, so the save-in-flight lock is
  // asserted here: neither a click nor Enter may toggle the card.
  it('refuses to open or close the card while a save is in flight', async () => {
    const user = userEvent.setup();
    const { onToggle, heading } = renderCard({ isSaving: true });

    expect(heading).toHaveAttribute('aria-disabled', 'true');

    await user.click(heading);
    heading.focus();
    await user.keyboard('{Enter}');

    expect(onToggle).not.toHaveBeenCalled();
  });
});
