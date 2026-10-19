import userEvent from '@testing-library/user-event';
import { getConfig } from '@edx/frontend-platform';
import { initializeMocks, screen, waitFor } from '@src/testUtils';
import { editorRender } from '@src/editors/editorTestRender';
import type { PartialEditorState } from '@src/editors/data/redux';

import GamesEditor from '.';

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
    await user.clear(await screen.findByDisplayValue('How plants eat'));
    await user.click(saveButton());

    expect(await screen.findByText('We couldn\'t save your changes.')).toBeInTheDocument();
    expect(screen.getByText('Enter a definition')).toBeInTheDocument();
    expect(savePosts(axiosMock)).toHaveLength(0);
    expect(onClose).not.toHaveBeenCalled();
  });
});
