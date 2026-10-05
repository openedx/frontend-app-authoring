import { emptyCard } from './useGameState';

describe('emptyCard', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Card ids key image uploads and validation errors to a card, so two cards
  // must never share one, however close together they are created.
  it('gives two cards created in the same instant different ids', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1700000000000);
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(emptyCard().id).not.toEqual(emptyCard().id);
  });
});
