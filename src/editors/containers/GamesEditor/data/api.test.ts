import { getConfig } from '@edx/frontend-platform';
import { initializeMocks } from '@src/testUtils';

import * as api from './api';

const courseBlockId = 'block-v1:org+course+run+type@games+block@abc';
const libraryBlockId = 'lb:org:lib:games:abc';

describe('games block handler URLs', () => {
  let axiosMock: ReturnType<typeof initializeMocks>['axiosMock'];
  const studio = () => getConfig().STUDIO_BASE_URL;
  const resolverUrl = (handlerName: string) =>
    `${studio()}/api/xblock/v2/xblocks/${libraryBlockId}/handler_url/${handlerName}/`;

  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  it('posts straight to the handler for a course block', async () => {
    axiosMock.onPost(`${studio()}/xblock/${courseBlockId}/handler/get_settings`).reply(200, { cards: [] });
    const { data } = await api.getSettings({ blockId: courseBlockId, studioEndpointUrl: studio(), isLibrary: false });
    expect(data).toEqual({ cards: [] });
    expect(axiosMock.history.get).toHaveLength(0);
  });

  // v2 library blocks have no /xblock/<id>/handler/ route. Their handler URLs
  // are issued by the server, so they have to be asked for.
  it('resolves the handler URL first for a v2 library block', async () => {
    axiosMock.onGet(resolverUrl('save_settings')).reply(200, { handler_url: 'http://studio/secure/save_settings' });
    axiosMock.onPost('http://studio/secure/save_settings').reply(200, { success: true });

    const { data } = await api.saveSettings({ blockId: libraryBlockId, studioEndpointUrl: studio(), isLibrary: true }, {
      gameType: 'matching',
      isShuffled: true,
      hasTimer: true,
      cards: [],
      title: 'Games',
    });
    expect(data).toEqual({ success: true });
  });

  it('resolves the upload handler for a library block too', async () => {
    axiosMock.onGet(resolverUrl('upload_image')).reply(200, { handler_url: 'http://studio/secure/upload' });
    axiosMock.onPost('http://studio/secure/upload').reply(200, { success: true });

    const { data } = await api.uploadImage(
      { blockId: libraryBlockId, studioEndpointUrl: studio(), isLibrary: true },
      new File(['x'], 'x.png'),
    );
    expect(data).toEqual({ success: true });
  });
});

describe('buildSavePayload', () => {
  const base = {
    gameType: 'matching' as const,
    isShuffled: true,
    hasTimer: true,
    title: 'T',
  };

  // The block keeps a stable key per card and assigns a fresh one to any card
  // saved without it. Dropping the key on save would give every card a new
  // identity on every save.
  it('keeps each card\'s key, and sends none for a new card', () => {
    const { cards } = api.buildSavePayload({
      ...base,
      cards: [{ term: 'a', definition: 'b', card_key: 'k-1' }, { term: 'c', definition: 'd' }],
    });
    expect(cards[0].card_key).toEqual('k-1');
    expect(cards[1]).not.toHaveProperty('card_key');
  });

  // save_settings accepts the image fields for every game type. Dropping them
  // for a matching game would wipe the images of an author who tries Matching
  // and switches back to Flashcards.
  it('keeps the image fields for a matching game', () => {
    const { cards } = api.buildSavePayload({
      ...base,
      gameType: 'matching',
      cards: [{
        term: 'a',
        definition: 'b',
        term_image: '/media/a.png',
        term_image_path: 'games/a.png',
        term_image_alt: 'A',
      }],
    });
    expect(cards[0]).toMatchObject({ term_image: '/media/a.png', term_image_path: 'games/a.png', term_image_alt: 'A' });
  });

  // The block's save handler stores what it is given, and this editor owns the
  // payload builder precisely because the shared one drops these keys. A card
  // whose image the author removed must still carry an empty path, or the block
  // keeps the file it already had; a card that never had one must not be saved
  // with the key missing either.
  it('sends all six image fields empty for a card with no image', () => {
    const { cards } = api.buildSavePayload({ ...base, cards: [{ term: 'a', definition: 'b' }] });

    expect(cards[0]).toMatchObject({
      term_image: '',
      term_image_path: '',
      term_image_alt: '',
      definition_image: '',
      definition_image_path: '',
      definition_image_alt: '',
    });
  });

  // The block's save handler defaults a missing has_timer to true, so a
  // flashcards save that omits it would switch a disabled timer back on.
  it('sends has_timer for every game type', () => {
    const flash = api.buildSavePayload({ ...base, gameType: 'flashcards', hasTimer: false, cards: [] });
    expect(flash.has_timer).toBe(false);
    const match = api.buildSavePayload({ ...base, gameType: 'matching', hasTimer: false, cards: [] });
    expect(match.has_timer).toBe(false);
  });
});

describe('the Studio endpoint', () => {
  // The editors' store says which Studio to talk to. It must not be assumed
  // to be the global one.
  it('builds the handler URL from the endpoint it is given', async () => {
    const { axiosMock } = initializeMocks();
    axiosMock.onPost(`http://other-studio/xblock/${courseBlockId}/handler/get_settings`).reply(200, { cards: [] });
    const { data } = await api.getSettings({
      blockId: courseBlockId,
      studioEndpointUrl: 'http://other-studio',
      isLibrary: false,
    });
    expect(data).toEqual({ cards: [] });
  });
});

describe('buildSavePayload decks', () => {
  const base = {
    gameType: 'flashcards' as const,
    isShuffled: true,
    hasTimer: false,
    title: 'T',
  };

  // The block replaces its whole deck list with what it receives, and keeps
  // `cards` as the primary deck's mirror for older clients and learners.
  it('sends every deck in order, and mirrors the first one in cards', () => {
    const payload = api.buildSavePayload({
      ...base,
      cards: [],
      decks: [
        { deckKey: 'dk-1', name: '  Basics  ', cards: [{ term: 'a', definition: 'b', card_key: 'k1' }] },
        { name: 'Advanced', cards: [{ term: 'c', definition: 'd', term_image_path: 'games/abc/c.png' }] },
      ],
    });

    const { decks } = payload;
    expect(decks).toHaveLength(2);
    expect(decks![0]).toMatchObject({ deck_key: 'dk-1', name: 'Basics' });
    expect(decks![1]).toMatchObject({ name: 'Advanced' });
    expect(decks![1]).not.toHaveProperty('deck_key');
    expect(decks![1].cards[0].term_image_path).toEqual('games/abc/c.png');
    // Card order restarts in each deck: position inside its deck is what counts.
    expect(decks![0].cards[0].order).toEqual(1);
    expect(decks![1].cards[0].order).toEqual(1);
    expect(payload.cards).toEqual(decks![0].cards);
    expect(payload.cards[0].card_key).toEqual('k1');
  });

  // A backend that predates decks must not be sent the field: it declares no
  // such thing, and the block keeps `cards` as the whole game.
  it('omits decks for a backend the caller knows nothing about', () => {
    const payload = api.buildSavePayload({ ...base, cards: [{ term: 'a', definition: 'b' }] });

    expect(payload).not.toHaveProperty('decks');
    expect(payload.cards).toHaveLength(1);
    expect(payload.cards[0].term).toEqual('a');
  });

  // Saving before the editors' store has the block title must not send a name
  // that would reset the block's own.
  it('omits display_name when there is no title yet', () => {
    const untitled = api.buildSavePayload({ ...base, title: null, cards: [] });
    expect(untitled).not.toHaveProperty('display_name');

    const titled = api.buildSavePayload({ ...base, cards: [] });
    expect(titled.display_name).toEqual('T');
  });
});
