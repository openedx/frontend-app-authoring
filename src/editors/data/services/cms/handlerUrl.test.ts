import { getConfig } from '@edx/frontend-platform';
import { initializeMocks } from '@src/testUtils';

import { resolveHandlerUrl } from './handlerUrl';

const courseBlockId = 'block-v1:org+course+run+type@games+block@abc';
const libraryBlockId = 'lb:org:lib:games:abc';

describe('resolveHandlerUrl', () => {
  let axiosMock: ReturnType<typeof initializeMocks>['axiosMock'];
  const studio = () => getConfig().STUDIO_BASE_URL;

  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  it('builds the fixed handler route for a course block without a request', async () => {
    const url = await resolveHandlerUrl({
      studioEndpointUrl: studio(),
      blockId: courseBlockId,
      handlerName: 'get_settings',
      isLibrary: false,
    });
    expect(url).toEqual(`${studio()}/xblock/${courseBlockId}/handler/get_settings`);
    expect(axiosMock.history.get).toHaveLength(0);
  });

  // v2 library blocks have no /xblock/<id>/handler/ route. Their handler URLs
  // are issued by the server, so they have to be asked for.
  it('asks the server for a library block\'s handler URL', async () => {
    axiosMock
      .onGet(`${studio()}/api/xblock/v2/xblocks/${libraryBlockId}/handler_url/get_settings/`)
      .reply(200, { handler_url: 'http://studio/secure/get_settings' });
    const url = await resolveHandlerUrl({
      studioEndpointUrl: studio(),
      blockId: libraryBlockId,
      handlerName: 'get_settings',
      isLibrary: true,
    });
    expect(url).toEqual('http://studio/secure/get_settings');
  });
});
