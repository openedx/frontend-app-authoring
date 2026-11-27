import MockAdapter from 'axios-mock-adapter';
import { initializeMocks } from '@src/testUtils';
import MatchingEditor from '@src/editors/containers/MatchingEditor/index';
import { editorRender } from '@src/editors/editorTestRender';
import { initialMatchingState, MatchingState } from '@src/editors/containers/MatchingEditor/types';
import messages from '@src/editors/containers/MatchingEditor/messages';
import editorMessages from '@src/editors/containers/EditorContainer/messages';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const render = () =>
  editorRender(
    <MatchingEditor onClose={() => undefined} returnFunction={() => () => undefined} />,
    {
      initialState: {
        app: {
          blockValue: {
            data: {
              id: 'matching-block-id',
              display_name: 'Matching',
              category: 'matching',
              has_children: false,
              has_changes: null,
              explanatory_message: null,
              group_access: {},
              data: '',
              metadata: {
                display_name: 'Matching',
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
          blockId: 'matching-block-id',
          blockTitle: 'Matching',
          blockType: 'openedx_matching',
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

describe('MatchingEditor', () => {
  let axiosMock: MockAdapter;
  beforeEach(() => {
    axiosMock = initializeMocks().axiosMock;
  });

  const setBlock = (state?: Partial<MatchingState>) => {
    axiosMock.onGet(
      'https://studio.local/xblock/matching-block-id/handler/load_data',
    ).reply(200, { ...initialMatchingState(), ...state });
  };

  it('fetches a block and renders.', async () => {
    // Slightly different loader to show spinner.
    axiosMock.onGet(
      'https://studio.local/xblock/matching-block-id/handler/load_data',
    ).withDelayInMs(200).reply(200, initialMatchingState());
    const screen = render();
    screen.getByText(messages.loadingSpinner.defaultMessage);

    // And then should show the block.
    await waitFor(() => screen.getByText(messages.descriptionHeaderMatching.defaultMessage));
  });

  it('submits changes to the cms', async () => {
    axiosMock.onPost('https://studio.local/xblock/matching-block-id').reply(200, {
      data: {
        id: 'matching-block-id',
        data: null,
        metadata: {
          display_name: 'Matching',
        },
      },
    });
    const user = userEvent.setup();
    setBlock();
    const screen = render();
    await waitFor(() => screen.getByText(messages.descriptionHeaderMatching.defaultMessage));

    // turn off the timer (it's on by default)
    const hasTimer = await waitFor(() => screen.getByText('Timer'));
    await user.click(hasTimer);

    // add a new pair
    const addBtn = await waitFor(() => screen.getByText('Add'));
    await user.click(addBtn);

    // enter text on the empty card pair
    const leftText = await waitFor(() => screen.getByLabelText('Left'));
    await user.type(leftText, 'my left text');
    const rightText = await waitFor(() => screen.getByLabelText('Right'));
    await user.type(rightText, 'my right text');

    const saveButton = screen.getByLabelText(editorMessages.saveButtonAriaLabel.defaultMessage);
    await user.click(saveButton);

    await waitFor(() => expect(axiosMock.history.post[0].url).toEqual('https://studio.local/xblock/matching-block-id'));
    const request = axiosMock.history.post[0];
    const data = JSON.parse(request.data).metadata;
    expect(data.has_timer).toBe(false);
    expect(data.is_shuffled).toBe(true);
    expect(data.display_name).toBe('Matching');
    expect(data.pairs).toHaveLength(1);
    expect(data.pairs[0].left.text).toBe('my left text');
    expect(data.pairs[0].right.text).toBe('my right text');
  });

  it('collapses and previews cards', async () => {
    const user = userEvent.setup();
    setBlock();
    const screen = render();
    await waitFor(() => screen.getByText(messages.descriptionHeaderMatching.defaultMessage));

    // add a new pair
    const addBtn = await waitFor(() => screen.getByText('Add'));
    await user.click(addBtn);

    // enter text on the initial empty card pair
    const leftText = await waitFor(() => screen.getByLabelText('Left'));
    await user.type(leftText, 'my left text');

    const collapseBtn = await waitFor(() => screen.getByLabelText('Collapse card'));
    await user.click(collapseBtn);

    // new the preview text should be visible, and the text inputs hidden
    await waitFor(() => screen.getByText('my left text'));
    await waitFor(() => screen.getByText('No text'));
    expect(screen.queryByLabelText('Left')).toBeNull();
    await waitFor(() => screen.getByLabelText('Expand card'));
  });
});
