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
  // The host tells the editor which Studio to talk to. It must not be assumed
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
