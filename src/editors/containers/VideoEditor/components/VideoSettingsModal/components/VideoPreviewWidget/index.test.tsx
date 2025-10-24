import { editorRender, type PartialEditorState } from '@src/editors/editorTestRender';
import { screen } from '@testing-library/react';
import { initializeMocks } from '@src/testUtils';
import { VideoPreviewWidget } from '.';

describe('VideoPreviewWidget', () => {
  const makeInitialState = (overrides: PartialEditorState = {}): PartialEditorState => ({
    app: {
      blockTitle: 'Test Video',
      studioEndpointUrl: 'http://localhost:8000',
      ...overrides.app,
    },
    video: {
      transcripts: [],
      videoSource: '',
      thumbnail: undefined, // ✅ match actual reducer type (string was wrong)
      ...overrides.video,
    },
    ...overrides,
  });

  beforeEach(() => {
    initializeMocks();
  });

  describe('render', () => {
    test('renders transcripts section in preview for courses', () => {
      editorRender(<VideoPreviewWidget />, {
        initialState: makeInitialState({
          video: { transcripts: [], videoSource: '', thumbnail: undefined },
          app: { blockTitle: 'some title' },
        }),
      });

      expect(screen.queryByText('No transcripts added')).toBeInTheDocument();
    });

    test('renders hyperlink when videoSource is provided', () => {
      editorRender(<VideoPreviewWidget />, {
        initialState: makeInitialState({
          video: { videoSource: 'https://example.com/video.mp4' },
          app: { blockTitle: 'Test Video' },
        }),
      });

      const hyperlink = screen.getByRole('link');
      expect(hyperlink).toBeInTheDocument();
      expect(hyperlink).toHaveAttribute('href', 'https://example.com/video.mp4');
    });

    test('renders YouTube video type as hyperlink when videoSource is YouTube URL', () => {
      editorRender(<VideoPreviewWidget />, {
        initialState: makeInitialState({
          video: { videoSource: 'https://youtu.be/dQw4w9WgXcQ' },
          app: { blockTitle: 'YouTube Video' },
        }),
      });

      const hyperlink = screen.getByRole('link');
      expect(hyperlink).toBeInTheDocument();
      expect(hyperlink).toHaveAttribute('href', 'https://youtu.be/dQw4w9WgXcQ');
    });
  });
});
