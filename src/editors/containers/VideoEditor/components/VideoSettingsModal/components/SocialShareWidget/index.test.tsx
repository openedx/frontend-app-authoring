import React from 'react';
import { screen, initializeMocks } from '@src/testUtils';
import userEvent from '@testing-library/user-event';
import { editorRender, type PartialEditorState } from '@src/editors/editorTestRender';
import { initialState as editorInitialState } from '@src/editors/data/redux/video/reducer';
import * as hooks from './hooks';
import SocialShareWidget from './index';

describe('SocialShareWidget', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    initializeMocks();
    jest.spyOn(hooks, 'useTrackSocialSharingChange').mockReturnValue(mockOnChange);
    jest.clearAllMocks();
  });

  // ✅ helper to create a realistic Redux initial state
  const makeInitialState = (overrides: PartialEditorState = {}): PartialEditorState => ({
    ...editorInitialState,
    app: {
      ...editorInitialState.app,
      blockId: 'block-v1:Org+TST101+2025+type@video+block@12345',
      learningContextId: 'course-v1:Org+TST101+2025',
      studioEndpointUrl: '',
      lmsEndpointUrl: '',
      editorInitialized: true,
      ...(overrides.app ?? {}),
    },
    video: {
      ...editorInitialState.video,
      allowVideoSharing: { level: 'block', value: false },
      videoSharingEnabledForAll: false,
      videoSharingEnabledForCourse: false,
      videoSharingLearnMoreLink: 'https://example.com',
      transcripts: [],
      ...(overrides.video ?? {}),
    },
    ...overrides,
  });

  it('renders null when video sharing is disabled for course and globally', () => {
    const initialState = makeInitialState({
      video: {
        allowVideoSharing: { level: 'block', value: false },
        videoSharingEnabledForCourse: false,
        videoSharingEnabledForAll: false,
      },
    });

    editorRender(<SocialShareWidget />, { initialState });
    const { queryByText } = screen;
    expect(queryByText(/Social sharing/i)).not.toBeInTheDocument();
  });

  it('renders correctly when video sharing is enabled for course', () => {
    const initialState = makeInitialState({
      video: {
        allowVideoSharing: { level: 'block', value: true },
        videoSharingEnabledForCourse: true,
      },
    });

    editorRender(<SocialShareWidget />, { initialState });
    const elements = screen.getAllByText(/Social sharing/i);
    expect(elements.length).toBeGreaterThan(0);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('renders correctly for library context (isLibrary = true)', () => {
    const initialState = makeInitialState({
      app: {
        learningContextId: 'library-v1:abcd1234',
      },
      video: {
        allowVideoSharing: { level: 'block', value: false },
        videoSharingEnabledForAll: true,
      },
    });

    editorRender(<SocialShareWidget />, { initialState });
    const elements = screen.getAllByText(/Social sharing/i);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('triggers updateField when checkbox is toggled', async () => {
    const user = userEvent.setup();
    const initialState = makeInitialState({
      video: {
        allowVideoSharing: { level: 'block', value: false },
        videoSharingEnabledForAll: false,
        videoSharingEnabledForCourse: true,
        videoSharingLearnMoreLink: '', // triggers fallback
        transcripts: [],
      },
    });

    editorRender(<SocialShareWidget />, { initialState });
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('renders "Learn more" link with default docs URL if none provided', () => {
    const initialState = makeInitialState({
      video: {
        allowVideoSharing: { level: 'block', value: false },
        videoSharingEnabledForAll: false,
        videoSharingEnabledForCourse: true,
        videoSharingLearnMoreLink: '', // triggers fallback
        transcripts: [],
      },
    });

    editorRender(<SocialShareWidget />, { initialState });
    const link = screen.getByRole('link', { name: /Learn more/i });
    expect(link).toHaveAttribute(
      'href',
      'https://docs.openedx.org/en/latest/educators/how-tos/course_development/social_sharing.html',
    );
  });
});
