import MockAdapter from 'axios-mock-adapter';
import { initializeMocks } from '@src/testUtils';
import FlashcardsEditor from '@src/editors/containers/FlashcardsEditor/index';
import { editorRender } from '@src/editors/editorTestRender';
import { initialFlashcardsState, FlashcardsState } from '@src/editors/containers/FlashcardsEditor/types';
import messages from '@src/editors/containers/FlashcardsEditor/messages';
import editorMessages from '@src/editors/containers/EditorContainer/messages';
import { waitFor } from '@testing-library/react';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

const render = () =>
  editorRender(
    <FlashcardsEditor onClose={() => undefined} returnFunction={() => () => undefined} />,
    {
      initialState: {
        app: {
          blockValue: {
            data: {
              id: 'flashcards-block-id',
              display_name: 'Flashcards',
              category: 'flashcards',
              has_children: false,
              has_changes: null,
              explanatory_message: null,
              group_access: {},
              data: '',
              metadata: {
                display_name: 'Flashcards',
              },
            },
          },
          unitUrl: {
            data: {
              ancestors: [
                {
                  id: 'block-v1:Test+TS102+2026+type@vertical+block@29f73003508e47e0af00b495ecdc66f1',
                  display_name: 'Unit',
                  category: 'vertical',
                  has_children: true,
                },
                {
                  id: 'block-v1:Test+TS102+2026+type@sequential+block@a9f3bc6ad94a4e108449b5c84a46f7ba',
                  display_name: 'Subsection',
                  category: 'sequential',
                  has_children: true,
                },
                {
                  id: 'block-v1:Test+TS102+2026+type@chapter+block@606d3cab05a94551b71c5abbd0009baf',
                  display_name: 'Section',
                  category: 'chapter',
                  has_children: true,
                },
                {
                  id: 'block-v1:Test+TS102+2026+type@course+block@course',
                  display_name: 'New Test Course',
                  category: 'course',
                  has_children: true,
                  unit_level_discussions: true,
                },
              ],
            },
          },
          blockId: 'flashcards-block-id',
          blockTitle: 'Flashcards',
          blockType: 'openedx_flashcards',
          learningContextId: 'course-v1:Test+TS102+2026',
          editorInitialized: false,
          studioEndpointUrl: 'https://studio.local',
          lmsEndpointUrl: 'http://local.openedx.io:8000',
          images: {},
          imageCount: 0,
          videos: {},
          courseDetails: {},
          showRawEditor: false,
        },
      },
    },
  );

describe('FlashcardsEditor', () => {
  let axiosMock: MockAdapter;
  beforeEach(() => {
    axiosMock = initializeMocks().axiosMock;
  });

  const setBlock = (state?: Partial<FlashcardsState>) => {
    axiosMock.onGet(
      'https://studio.local/xblock/flashcards-block-id/handler/load_data',
    ).reply(200, { ...initialFlashcardsState(), ...state });
  };

  it('fetches a block and renders.', async () => {
    // Slightly different loader to show spinner.
    axiosMock.onGet(
      'https://studio.local/xblock/flashcards-block-id/handler/load_data',
    ).withDelayInMs(200).reply(200, initialFlashcardsState());
    const screen = render();
    screen.getByText(messages.loadingSpinner.defaultMessage);

    // And then should show the block.
    await waitFor(() => screen.getByText(messages.descriptionHeaderFlashcard.defaultMessage));
  });

  it('submits changes to the cms', async () => {
    axiosMock.onPost('https://studio.local/xblock/flashcards-block-id').reply(200, {
      data: {
        id: 'flashcards-block-id',
        data: null,
        metadata: {
          display_name: 'Flashcards',
        },
      },
    });
    const user = userEvent.setup();
    setBlock();
    const screen = render();
    await waitFor(() => screen.getByText(messages.descriptionHeaderFlashcard.defaultMessage));

    // turn off shuffle (it's on by default)
    const isShuffled = await waitFor(() => screen.getByText('Shuffle'));
    await user.click(isShuffled);

    // add a new card
    const addBtn = await waitFor(() => screen.getByText('Add'));
    await user.click(addBtn);

    // enter text on the card
    const frontContainer = await waitFor(() => screen.getByText('Front of card').parentElement);
    const frontText = await waitFor(() => within(frontContainer!).getByLabelText('Text'));
    await user.type(frontText, 'my front text');
    const backContainer = await waitFor(() => screen.getByText('Back of card').parentElement);
    const backText = await waitFor(() => within(backContainer!).getByLabelText('Text'));
    await user.type(backText, 'my back text');

    const saveButton = screen.getByLabelText(editorMessages.saveButtonAriaLabel.defaultMessage);
    await user.click(saveButton);

    await waitFor(() =>
      expect(axiosMock.history.post[0].url).toEqual('https://studio.local/xblock/flashcards-block-id')
    );
    const request = axiosMock.history.post[0];
    const data = JSON.parse(request.data).metadata;
    expect(data.is_shuffled).toBe(false);
    expect(data.display_name).toBe('Flashcards');
    expect(data.cards).toHaveLength(1);
    expect(data.cards[0].front.text).toBe('my front text');
    expect(data.cards[0].back.text).toBe('my back text');
  });

  it('collapses and previews cards', async () => {
    const user = userEvent.setup();
    setBlock();
    const screen = render();
    await waitFor(() => screen.getByText(messages.descriptionHeaderFlashcard.defaultMessage));

    // add a new pair
    const addBtn = await waitFor(() => screen.getByText('Add'));
    await user.click(addBtn);

    // enter text on the initial empty card pair
    const frontContainer = await waitFor(() => screen.getByText('Front of card').parentElement);
    const frontText = await waitFor(() => within(frontContainer!).getByLabelText('Text'));
    await user.type(frontText, 'my front text');

    const collapseBtn = await waitFor(() => screen.getByLabelText('Collapse card'));
    await user.click(collapseBtn);

    // new the preview text should be visible, and the text inputs hidden
    await waitFor(() => screen.getByText('my front text'));
    await waitFor(() => screen.getByText('No text'));
    expect(screen.queryByText('Front of card')).toBeNull();
    await waitFor(() => screen.getByLabelText('Expand card'));
  });
});
