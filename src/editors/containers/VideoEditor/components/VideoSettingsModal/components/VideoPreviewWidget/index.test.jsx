import {
  initializeMocks,
  render,
  screen,
} from '../../../../../../../testUtils';

import { VideoPreviewWidget } from '.';

describe('VideoPreviewWidget', () => {
  const mockIntl = {
    formatMessage: (message) => message.defaultMessage,
  };

  beforeEach(() => {
    initializeMocks();
  });

  describe('render', () => {
    test('renders transcripts section in preview for courses', () => {
      render(
        <VideoPreviewWidget
          videoSource="some-source"
          isLibrary={false}
          intl={mockIntl}
          transcripts={[]}
          blockTitle="some title"
          thumbnail=""
        />,
      );
      expect(screen.queryByText('No transcripts added')).toBeInTheDocument();
    });

    test('renders transcripts section in preview for libraries', () => {
      render(
        <VideoPreviewWidget
          videoSource="some-source"
          isLibrary
          intl={mockIntl}
          transcripts={[]}
          blockTitle="some title"
          thumbnail=""
        />,
      );
      expect(screen.queryByText('No transcripts added')).toBeInTheDocument();
    });

    test('renders hyperlink when videoSource is provided', () => {
      render(
        <VideoPreviewWidget
          videoSource="https://example.com/video.mp4"
          intl={mockIntl}
          transcripts={[]}
          blockTitle="Test Video"
          thumbnail=""
        />,
      );

      const hyperlink = screen.getByRole('link');
      expect(hyperlink).toBeInTheDocument();
      expect(hyperlink).toHaveAttribute('href', 'https://example.com/video.mp4');
      expect(hyperlink).toHaveAttribute('target', '_blank');
      expect(hyperlink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('does not render hyperlink when videoSource is empty', () => {
      render(
        <VideoPreviewWidget
          videoSource=""
          intl={mockIntl}
          transcripts={[]}
          blockTitle="Test Video"
          thumbnail=""
        />,
      );

      const hyperlink = screen.queryByRole('link');
      expect(hyperlink).not.toBeInTheDocument();
    });

    test('renders YouTube video type as hyperlink when videoSource is YouTube URL', () => {
      render(
        <VideoPreviewWidget
          videoSource="https://youtu.be/dQw4w9WgXcQ"
          intl={mockIntl}
          transcripts={[]}
          blockTitle="YouTube Video"
          thumbnail=""
        />,
      );

      const hyperlink = screen.getByRole('link');
      expect(hyperlink).toBeInTheDocument();
      expect(hyperlink).toHaveAttribute('href', 'https://youtu.be/dQw4w9WgXcQ');
    });
  });
});
