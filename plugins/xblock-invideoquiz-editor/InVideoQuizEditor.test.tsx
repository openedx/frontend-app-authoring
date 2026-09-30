import type { ComponentProps } from 'react';
import MockAdapter from 'axios-mock-adapter';
import { act } from '@testing-library/react';
import { screen, fireEvent, waitFor, within, initializeMocks } from '@src/testUtils';
import { editorRender } from '@src/editors/editorTestRender';
// eslint-disable-next-line import/no-unresolved
import { getCourseVerticalChildrenApiUrl } from 'CourseAuthoring/course-unit/data/api';
// Import through the package's own barrel (index.tsx), the same way a
// plugin config (env.config.js) resolves it, so the barrel's re-exports
// aren't left uninstrumented.
import InVideoQuizEditor, { messages } from '.';

const blockId = 'block-v1:org+course+run+type@invideoquiz+block@quiz-1';
const studioEndpointUrl = 'https://studio.local';
const studioViewUrl = `${studioEndpointUrl}/xblock/${blockId}/studio_view`;
const ancestorUrl = `${studioEndpointUrl}/xblock/${blockId}?fields=ancestorInfo`;
const unitId = 'block-v1:Test+TS102+2026+type@vertical+block@29f73003508e47e0af00b495ecdc66f1';
const containerChildrenUrl = getCourseVerticalChildrenApiUrl(unitId);
const saveUrl = `${studioEndpointUrl}/xblock/${blockId}/handler/submit_studio_edits`;
const saveButtonMatcher = { name: /save changes/i };

const baseAppState = {
  blockValue: {
    data: {
      id: blockId,
      display_name: 'In-video quiz',
      category: 'invideoquiz',
      has_children: false,
      has_changes: null,
      explanatory_message: null,
      group_access: {},
      data: '',
      metadata: { display_name: 'In-video quiz' },
    },
  },
  unitUrl: {
    data: {
      ancestors: [
        { id: unitId, display_name: 'Unit', category: 'vertical' as const, has_children: true },
      ],
    },
  },
  blockId,
  blockTitle: 'In-video quiz',
  blockType: 'invideoquiz',
  learningContextId: 'course-v1:Test+TS102+2026',
  editorInitialized: false,
  studioEndpointUrl,
  lmsEndpointUrl: 'http://local.openedx.io:8000',
  images: {},
  imageCount: 0,
  videos: {},
  courseDetails: {},
  showRawEditor: false,
};

const render = (onClose = jest.fn()) =>
  editorRender(
    <InVideoQuizEditor
      blockType="invideoquiz"
      blockId={blockId}
      learningContextId={baseAppState.learningContextId}
      lmsEndpointUrl={baseAppState.lmsEndpointUrl}
      studioEndpointUrl={studioEndpointUrl}
      onClose={onClose}
      returnFunction={() => () => undefined}
    />,
    { initialState: { app: baseAppState } },
  );

// For the handful of tests that need to override an individual prop (e.g. a
// host that hasn't supplied blockId/returnFunction yet) or the redux app
// state, rather than every caller of `render` needing to thread them through.
const renderWithProps = (
  propOverrides: Partial<ComponentProps<typeof InVideoQuizEditor>> = {},
  appStateOverrides: Partial<typeof baseAppState> = {},
) =>
  editorRender(
    <InVideoQuizEditor
      blockType="invideoquiz"
      blockId={blockId}
      learningContextId={baseAppState.learningContextId}
      lmsEndpointUrl={baseAppState.lmsEndpointUrl}
      studioEndpointUrl={studioEndpointUrl}
      onClose={jest.fn()}
      returnFunction={() => () => undefined}
      {...propOverrides}
    />,
    { initialState: { app: { ...baseAppState, ...appStateOverrides } } },
  );

const emptyStudioView = '<div></div>';
const oneVideoOneProblemChildren = {
  children: [
    { id: 'block-v1:org+course+run+type@video+block@video-1', blockType: 'video', name: 'Intro Video' },
    { id: 'block-v1:org+course+run+type@problem+block@problem-1', blockType: 'problem', name: 'Problem 1' },
  ],
};

describe('InVideoQuizEditor', () => {
  let axiosMock: MockAdapter;

  beforeEach(() => {
    axiosMock = initializeMocks().axiosMock;
  });

  const setUpUnitWithVideoAndProblem = (studioViewHtml = emptyStudioView) => {
    axiosMock.onGet(studioViewUrl).reply(200, { html: studioViewHtml });
    axiosMock.onGet(ancestorUrl).reply(200, { ancestors: baseAppState.unitUrl.data.ancestors });
    axiosMock.onGet(containerChildrenUrl).reply(200, oneVideoOneProblemChildren);
  };

  it('shows a loading spinner while unit content is loading', async () => {
    axiosMock.onGet(studioViewUrl).withDelayInMs(200).reply(200, { html: emptyStudioView });
    render();
    expect(screen.getByText(messages.loadingSpinner.defaultMessage)).toBeInTheDocument();
  });

  it('falls back safely when optional host props and the block title are missing', () => {
    // A host may render the slot before it has a blockId/studioEndpointUrl
    // ready, and a plugin config may omit returnFunction entirely (both are
    // typed nullable/optional on the props XBlockEditorSlot passes in).
    renderWithProps({ returnFunction: undefined, blockId: null, studioEndpointUrl: null }, { blockTitle: '' });
    // With no blockId, the data query stays disabled, so the editor never
    // leaves its loading state - which is enough to prove it didn't crash.
    expect(screen.getByText(messages.loadingSpinner.defaultMessage)).toBeInTheDocument();
  });

  it('shows a load-error alert when fetching the unit contents fails', async () => {
    axiosMock.onGet(studioViewUrl).reply(200, { html: emptyStudioView });
    axiosMock.onGet(ancestorUrl).reply(500);
    render();
    expect(await screen.findByText(messages.loadError.defaultMessage)).toBeInTheDocument();
    expect(screen.queryByText(messages.loadingSpinner.defaultMessage)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(messages.videoLabel.defaultMessage)).not.toBeInTheDocument();
  });

  it('renders video options in the dropdown once loaded', async () => {
    setUpUnitWithVideoAndProblem();
    render();
    await waitFor(() => screen.getByText('Intro Video'));
    expect(screen.getByText('Problem 1')).toBeInTheDocument();
  });

  it('shows a "Content not found" alert when the unit has no videos or problems', async () => {
    axiosMock.onGet(studioViewUrl).reply(200, { html: emptyStudioView });
    axiosMock.onGet(ancestorUrl).reply(200, { ancestors: baseAppState.unitUrl.data.ancestors });
    axiosMock.onGet(containerChildrenUrl).reply(200, { children: [] });
    render();
    await waitFor(() => screen.getByText(messages.contentNotFoundTitle.defaultMessage));
    expect(screen.getByText(messages.noVideoFoundInUnit.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.noProblemFoundInUnit.defaultMessage)).toBeInTheDocument();
  });

  it('dismisses the content-not-found alert when its close button is clicked', async () => {
    axiosMock.onGet(studioViewUrl).reply(200, { html: emptyStudioView });
    axiosMock.onGet(ancestorUrl).reply(200, { ancestors: baseAppState.unitUrl.data.ancestors });
    axiosMock.onGet(containerChildrenUrl).reply(200, { children: [] });
    render();
    await waitFor(() => screen.getByText(messages.contentNotFoundTitle.defaultMessage));
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(screen.queryByText(messages.contentNotFoundTitle.defaultMessage)).not.toBeInTheDocument();
  });

  it('blocks save and shows an error for an invalid time format', async () => {
    setUpUnitWithVideoAndProblem();
    render();
    await waitFor(() => screen.getByText('Intro Video'));

    // A video and problem are both selected so isVideoMissing/isProblemMissing
    // don't short-circuit validateEntry before it reaches the time-format check.
    fireEvent.change(screen.getByLabelText(messages.videoLabel.defaultMessage), {
      target: { value: 'video-1' },
    });
    fireEvent.change(screen.getByLabelText(messages.problemLabel.defaultMessage), {
      target: { value: 'problem-1' },
    });
    const timeInput = screen.getByLabelText(messages.timeLabel.defaultMessage);
    // A single digit isn't reformatted into MM:SS, so it stays an invalid value.
    fireEvent.change(timeInput, { target: { value: '5' } });
    expect(timeInput).toHaveValue('5');

    fireEvent.click(screen.getByRole('button', saveButtonMatcher));
    await waitFor(() => screen.getByText(messages.saveErrorTitle.defaultMessage));
    expect(screen.getAllByText(messages.timeFormatError.defaultMessage).length).toBeGreaterThan(0);
    // Blocked by validateEntry before EditorContainer ever calls the save override.
    expect(axiosMock.history.post.length).toBe(0);
  });

  it('blocks save and shows an error for an invalid jump-back format', async () => {
    setUpUnitWithVideoAndProblem();
    render();
    await waitFor(() => screen.getByText('Intro Video'));

    fireEvent.change(screen.getByLabelText(messages.videoLabel.defaultMessage), {
      target: { value: 'video-1' },
    });
    fireEvent.change(screen.getByLabelText(messages.problemLabel.defaultMessage), {
      target: { value: 'problem-1' },
    });
    fireEvent.change(screen.getByLabelText(messages.timeLabel.defaultMessage), { target: { value: '130' } });
    // A single digit isn't reformatted into MM:SS, so it stays an invalid value.
    const jumpBackInput = screen.getByLabelText(messages.jumpBackLabel.defaultMessage);
    fireEvent.change(jumpBackInput, { target: { value: '5' } });

    // Shown inline as soon as it's malformed, same as the time input, before
    // Save is even clicked. Scoped to the jump-back field's own container,
    // since timeFormatError and timeHelperText share the same displayed
    // text, and the (valid, unrelated) time field's helper text is also on
    // screen at this point.
    expect(jumpBackInput).toHaveClass('is-invalid');
    const jumpBackGroup = jumpBackInput.closest('.jump-back-input') as HTMLElement;
    expect(within(jumpBackGroup).getByText(messages.timeFormatError.defaultMessage)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', saveButtonMatcher));
    await waitFor(() => screen.getByText(messages.saveErrorTitle.defaultMessage));
    // Still shown inline after Save, in addition to the save-error banner.
    expect(within(jumpBackGroup).getByText(messages.timeFormatError.defaultMessage)).toBeInTheDocument();
    expect(axiosMock.history.post.length).toBe(0);
  });

  it('blocks save and shows an error when time is entered without a problem selected', async () => {
    setUpUnitWithVideoAndProblem();
    render();
    await waitFor(() => screen.getByText('Intro Video'));

    fireEvent.change(screen.getByLabelText(messages.timeLabel.defaultMessage), { target: { value: '130' } });

    fireEvent.click(screen.getByRole('button', saveButtonMatcher));
    await waitFor(() => screen.getByText(messages.saveErrorTitle.defaultMessage));
    // Shown both in the save-error alert and as inline feedback on the problem dropdown.
    expect(screen.getAllByText(messages.problemRequiredError.defaultMessage).length).toBeGreaterThan(0);
    expect(axiosMock.history.post.length).toBe(0);
  });

  it('dismisses the save-error alert when its close button is clicked', async () => {
    setUpUnitWithVideoAndProblem();
    render();
    await waitFor(() => screen.getByText('Intro Video'));

    fireEvent.change(screen.getByLabelText(messages.timeLabel.defaultMessage), { target: { value: '130' } });
    fireEvent.click(screen.getByRole('button', saveButtonMatcher));
    await waitFor(() => screen.getByText(messages.saveErrorTitle.defaultMessage));

    fireEvent.click(screen.getAllByRole('button', { name: /dismiss/i })[0]);
    expect(screen.queryByText(messages.saveErrorTitle.defaultMessage)).not.toBeInTheDocument();
  });

  it('updates the jump-back value for a quiz item', async () => {
    setUpUnitWithVideoAndProblem();
    render();
    await waitFor(() => screen.getByText('Intro Video'));

    const jumpBackInput = screen.getByLabelText(messages.jumpBackLabel.defaultMessage);
    // 2 digits: too short to reformat into MM:SS, so it stays as typed.
    fireEvent.change(jumpBackInput, { target: { value: '12' } });
    expect(jumpBackInput).toHaveValue('12');

    fireEvent.change(jumpBackInput, { target: { value: '100' } });
    expect(jumpBackInput).toHaveValue('1:00');

    // 4+ digits: minutes can run past a single digit, e.g. "1234" -> "12:34".
    fireEvent.change(jumpBackInput, { target: { value: '1234' } });
    expect(jumpBackInput).toHaveValue('12:34');

    // Clearing the field back out returns it to empty, not a stale format.
    fireEvent.change(jumpBackInput, { target: { value: '' } });
    expect(jumpBackInput).toHaveValue('');
  });

  it('clamps a typed seconds value above 59 down to 59', async () => {
    setUpUnitWithVideoAndProblem();
    render();
    await waitFor(() => screen.getByText('Intro Video'));

    const jumpBackInput = screen.getByLabelText(messages.jumpBackLabel.defaultMessage);
    // 3 digits: "199" -> minutes "1", seconds "99" clamped to "59".
    fireEvent.change(jumpBackInput, { target: { value: '199' } });
    expect(jumpBackInput).toHaveValue('1:59');

    // 4+ digits: "1299" -> minutes "12", seconds "99" clamped to "59".
    fireEvent.change(jumpBackInput, { target: { value: '1299' } });
    expect(jumpBackInput).toHaveValue('12:59');
  });

  it('ignores a duplicate remove click landing before the row list updates', async () => {
    setUpUnitWithVideoAndProblem();
    render();
    await waitFor(() => screen.getByText('Intro Video'));

    fireEvent.click(screen.getByText(messages.addProblem.defaultMessage));
    const deleteButtons = screen.getAllByLabelText(messages.deleteProblem.defaultMessage);
    const lastDelete = deleteButtons[deleteButtons.length - 1] as HTMLElement;
    // Both clicks land before React re-renders, as a double-click delivers them.
    act(() => {
      lastDelete.click();
      lastDelete.click();
    });
    expect(screen.getAllByLabelText(messages.timeLabel.defaultMessage).length).toBe(1);
  });

  it('ignores a field edit for a row removed in the same update batch', async () => {
    setUpUnitWithVideoAndProblem();
    render();
    await waitFor(() => screen.getByText('Intro Video'));

    fireEvent.click(screen.getByText(messages.addProblem.defaultMessage));
    const deleteButtons = screen.getAllByLabelText(messages.deleteProblem.defaultMessage);
    const timeInputs = screen.getAllByLabelText(messages.timeLabel.defaultMessage);
    const lastDelete = deleteButtons[deleteButtons.length - 1] as HTMLElement;
    const lastTimeInput = timeInputs[timeInputs.length - 1];
    // The remove and the edit both land before React re-renders, so the edit
    // targets a row index that the batched removal has already dropped.
    act(() => {
      lastDelete.click();
      fireEvent.change(lastTimeInput, { target: { value: '130' } });
    });
    expect(screen.getAllByLabelText(messages.timeLabel.defaultMessage).length).toBe(1);
  });

  it('blocks save when a problem is selected with no time entered', async () => {
    setUpUnitWithVideoAndProblem();
    render();
    await waitFor(() => screen.getByText('Intro Video'));

    fireEvent.change(screen.getByLabelText(messages.problemLabel.defaultMessage), {
      target: { value: 'problem-1' },
    });
    fireEvent.click(screen.getByRole('button', saveButtonMatcher));
    await waitFor(() => screen.getByText(messages.saveErrorTitle.defaultMessage));
  });

  it('saves settings and POSTs the timemap/jump_back through submit_studio_edits', async () => {
    setUpUnitWithVideoAndProblem();
    axiosMock.onPost(saveUrl).reply(200, { data: {} });
    render();
    await waitFor(() => screen.getByText('Intro Video'));

    fireEvent.change(screen.getByLabelText(messages.videoLabel.defaultMessage), {
      target: { value: 'video-1' },
    });
    fireEvent.change(screen.getByLabelText(messages.problemLabel.defaultMessage), {
      target: { value: 'problem-1' },
    });
    fireEvent.change(screen.getByLabelText(messages.timeLabel.defaultMessage), { target: { value: '130' } });

    fireEvent.click(screen.getByRole('button', saveButtonMatcher));

    await waitFor(() => expect(axiosMock.history.post.length).toBeGreaterThan(0));
    const request = axiosMock.history.post[0];
    expect(request.url).toEqual(saveUrl);
    const body = JSON.parse(request.data);
    expect(body.values.video_id).toEqual('video-1');
    expect(JSON.parse(body.values.timemap)).toEqual({ '1:30': 'problem-1' });
  });

  // The container only disables its own Save/Cancel/close controls while the
  // save is pending; without this, an edit made mid-request would never be
  // sent (the payload above is already built) and its dirty flag would be
  // silently cleared once the unrelated request resolves.
  it('disables the editor fields while a save is in flight', async () => {
    setUpUnitWithVideoAndProblem();
    let resolvePost: () => void;
    axiosMock.onPost(saveUrl).reply(() =>
      new Promise((resolve) => {
        resolvePost = () => resolve([200, { data: {} }]);
      })
    );
    render();
    await waitFor(() => screen.getByText('Intro Video'));

    fireEvent.change(screen.getByLabelText(messages.videoLabel.defaultMessage), {
      target: { value: 'video-1' },
    });
    fireEvent.change(screen.getByLabelText(messages.problemLabel.defaultMessage), {
      target: { value: 'problem-1' },
    });
    fireEvent.change(screen.getByLabelText(messages.timeLabel.defaultMessage), { target: { value: '130' } });
    fireEvent.click(screen.getByRole('button', saveButtonMatcher));

    await waitFor(() => expect(screen.getByLabelText(messages.timeLabel.defaultMessage)).toBeDisabled());
    expect(screen.getByLabelText(messages.videoLabel.defaultMessage)).toBeDisabled();
    expect(screen.getByLabelText(messages.problemLabel.defaultMessage)).toBeDisabled();
    expect(screen.getByLabelText(messages.jumpBackLabel.defaultMessage)).toBeDisabled();
    expect(screen.getByLabelText(messages.deleteProblem.defaultMessage)).toBeDisabled();
    expect(screen.getByText(messages.addProblem.defaultMessage)).toBeDisabled();

    await act(async () => {
      resolvePost();
    });
    await waitFor(() => expect(screen.getByLabelText(messages.timeLabel.defaultMessage)).not.toBeDisabled());
  });

  it('saves via the redux returnUrl when no returnFunction is provided', async () => {
    setUpUnitWithVideoAndProblem();
    axiosMock.onPost(saveUrl).reply(200, { data: {} });
    renderWithProps({ returnFunction: undefined });
    await waitFor(() => screen.getByText('Intro Video'));

    fireEvent.change(screen.getByLabelText(messages.videoLabel.defaultMessage), {
      target: { value: 'video-1' },
    });
    fireEvent.change(screen.getByLabelText(messages.problemLabel.defaultMessage), {
      target: { value: 'problem-1' },
    });
    fireEvent.change(screen.getByLabelText(messages.timeLabel.defaultMessage), { target: { value: '130' } });
    fireEvent.click(screen.getByRole('button', saveButtonMatcher));

    await waitFor(() => expect(axiosMock.history.post.length).toBeGreaterThan(0));
  });

  it('shows the generic save-failed toast when the save API call fails', async () => {
    setUpUnitWithVideoAndProblem();
    axiosMock.onPost(saveUrl).reply(400, { error: 'Server exploded' });
    render();
    await waitFor(() => screen.getByText('Intro Video'));

    fireEvent.change(screen.getByLabelText(messages.videoLabel.defaultMessage), {
      target: { value: 'video-1' },
    });
    fireEvent.change(screen.getByLabelText(messages.problemLabel.defaultMessage), {
      target: { value: 'problem-1' },
    });
    fireEvent.change(screen.getByLabelText(messages.timeLabel.defaultMessage), { target: { value: '130' } });
    fireEvent.click(screen.getByRole('button', saveButtonMatcher));

    // An actual API/network failure is handled by EditorContainer itself
    // (the onSave override's promise rejects), not by this editor's own
    // validation alert.
    expect(await screen.findByText(/Content save failed/)).toBeInTheDocument();
  });

  it('loads a legacy plain-seconds timemap key as MM:SS without a validation error', async () => {
    const html = `
      <textarea id="xb-field-edit-timemap">{"90": "problem-1"}</textarea>
    `;
    axiosMock.onGet(studioViewUrl).reply(200, { html });
    axiosMock.onGet(ancestorUrl).reply(200, { ancestors: baseAppState.unitUrl.data.ancestors });
    axiosMock.onGet(containerChildrenUrl).reply(200, oneVideoOneProblemChildren);
    render();
    await waitFor(() => screen.getByText('Intro Video'));

    const timeInput = screen.getByLabelText(messages.timeLabel.defaultMessage);
    expect(timeInput).toHaveValue('1:30');
    expect(timeInput).not.toHaveClass('is-invalid');
  });

  it('adds and removes quiz item rows', async () => {
    setUpUnitWithVideoAndProblem();
    render();
    await waitFor(() => screen.getByText('Intro Video'));

    const initialRows = screen.getAllByLabelText(messages.timeLabel.defaultMessage).length;
    fireEvent.click(screen.getByText(messages.addProblem.defaultMessage));
    expect(screen.getAllByLabelText(messages.timeLabel.defaultMessage).length).toBe(initialRows + 1);

    fireEvent.click(screen.getAllByLabelText(messages.deleteProblem.defaultMessage)[0]);
    expect(screen.getAllByLabelText(messages.timeLabel.defaultMessage).length).toBe(initialRows);
  });

  it('calls onClose when the editor is closed without unsaved changes', async () => {
    setUpUnitWithVideoAndProblem();
    const onClose = jest.fn();
    render(onClose);
    await waitFor(() => screen.getByText('Intro Video'));

    fireEvent.click(screen.getByRole('button', { name: 'Exit the editor' }));
    expect(onClose).toHaveBeenCalled();
  });

  describe('Video validation', () => {
    it('shows inline error and blocks save when a row is configured but no video is selected', async () => {
      setUpUnitWithVideoAndProblem();
      render();
      await waitFor(() => screen.getByText('Intro Video'));

      fireEvent.change(screen.getByLabelText(messages.problemLabel.defaultMessage), {
        target: { value: 'problem-1' },
      });
      fireEvent.change(screen.getByLabelText(messages.timeLabel.defaultMessage), { target: { value: '130' } });

      expect(screen.getByText(messages.videoRequiredError.defaultMessage)).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', saveButtonMatcher));
      await waitFor(() => screen.getByText(messages.saveErrorTitle.defaultMessage));
      expect(screen.getAllByText(messages.videoRequiredError.defaultMessage)).toHaveLength(2);
      expect(axiosMock.history.post.length).toBe(0);
    });

    it('does not show the video error when no row is fully configured', async () => {
      setUpUnitWithVideoAndProblem();
      render();
      await waitFor(() => screen.getByText('Intro Video'));

      expect(screen.queryByText(messages.videoRequiredError.defaultMessage)).not.toBeInTheDocument();
    });

    it('clears the video error once a video is selected', async () => {
      setUpUnitWithVideoAndProblem();
      render();
      await waitFor(() => screen.getByText('Intro Video'));

      fireEvent.change(screen.getByLabelText(messages.problemLabel.defaultMessage), {
        target: { value: 'problem-1' },
      });
      fireEvent.change(screen.getByLabelText(messages.timeLabel.defaultMessage), { target: { value: '130' } });
      expect(screen.getByText(messages.videoRequiredError.defaultMessage)).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText(messages.videoLabel.defaultMessage), {
        target: { value: 'video-1' },
      });
      expect(screen.queryByText(messages.videoRequiredError.defaultMessage)).not.toBeInTheDocument();
    });

    it('flags a saved video id that no longer exists in the unit', async () => {
      const html = `
        <input id="xb-field-edit-video_id" value="deleted-video" />
        <textarea id="xb-field-edit-timemap">{"1:30": "problem-1"}</textarea>
      `;
      axiosMock.onGet(studioViewUrl).reply(200, { html });
      axiosMock.onGet(ancestorUrl).reply(200, { ancestors: baseAppState.unitUrl.data.ancestors });
      axiosMock.onGet(containerChildrenUrl).reply(200, oneVideoOneProblemChildren);
      render();
      await waitFor(() => screen.getByText('Intro Video'));

      fireEvent.click(screen.getByRole('button', saveButtonMatcher));
      await waitFor(() => screen.getByText(messages.saveErrorTitle.defaultMessage));
      expect(screen.getAllByText(messages.videoRequiredError.defaultMessage)).toHaveLength(2);
      expect(axiosMock.history.post.length).toBe(0);
    });

    it('blocks save when nothing is configured', async () => {
      setUpUnitWithVideoAndProblem();
      render();
      await waitFor(() => screen.getByText('Intro Video'));

      fireEvent.click(screen.getByRole('button', saveButtonMatcher));
      await waitFor(() => screen.getByText(messages.saveErrorTitle.defaultMessage));
      expect(screen.getByText(messages.videoAndProblemRequiredError.defaultMessage)).toBeInTheDocument();
      expect(axiosMock.history.post.length).toBe(0);
    });

    it('blocks save when a video is selected but no problem has been added', async () => {
      setUpUnitWithVideoAndProblem();
      render();
      await waitFor(() => screen.getByText('Intro Video'));

      fireEvent.change(screen.getByLabelText(messages.videoLabel.defaultMessage), {
        target: { value: 'video-1' },
      });
      fireEvent.click(screen.getByRole('button', saveButtonMatcher));
      await waitFor(() => screen.getByText(messages.saveErrorTitle.defaultMessage));
      expect(screen.getByText(messages.noProblemsAddedError.defaultMessage)).toBeInTheDocument();
      expect(axiosMock.history.post.length).toBe(0);
    });

    it('does not block as entirely-empty once a problem or time has been entered', async () => {
      setUpUnitWithVideoAndProblem();
      render();
      await waitFor(() => screen.getByText('Intro Video'));

      fireEvent.change(screen.getByLabelText(messages.problemLabel.defaultMessage), {
        target: { value: 'problem-1' },
      });
      fireEvent.click(screen.getByRole('button', saveButtonMatcher));
      await waitFor(() => screen.getByText(messages.saveErrorTitle.defaultMessage));

      expect(screen.queryByText(messages.videoAndProblemRequiredError.defaultMessage)).not.toBeInTheDocument();
      expect(screen.getAllByText(messages.timerRequiredError.defaultMessage).length).toBeGreaterThan(0);
    });

    it('reports the video error before per-row errors when both are present', async () => {
      setUpUnitWithVideoAndProblem();
      render();
      await waitFor(() => screen.getByText('Intro Video'));

      fireEvent.change(screen.getByLabelText(messages.problemLabel.defaultMessage), {
        target: { value: 'problem-1' },
      });
      fireEvent.change(screen.getByLabelText(messages.timeLabel.defaultMessage), { target: { value: '130' } });

      fireEvent.click(screen.getByText(messages.addProblem.defaultMessage));
      const problemSelects = screen.getAllByLabelText(messages.problemLabel.defaultMessage);
      fireEvent.change(problemSelects[1], { target: { value: 'problem-1' } });

      fireEvent.click(screen.getByRole('button', saveButtonMatcher));
      await waitFor(() => screen.getByText(messages.saveErrorTitle.defaultMessage));

      // The per-row inline feedback for the second row's missing time is
      // independently always-live, so it may still render alongside the
      // banner. What this verifies is that the *banner* - which validateEntry
      // only ever puts one message in - reports the video error first.
      const banner = screen.getByRole('alert');
      expect(within(banner).getByText(messages.videoRequiredError.defaultMessage)).toBeInTheDocument();
      expect(within(banner).queryByText(messages.timerRequiredError.defaultMessage)).not.toBeInTheDocument();
      expect(axiosMock.history.post.length).toBe(0);
    });
  });
});
