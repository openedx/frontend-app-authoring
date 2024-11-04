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

    test('hides transcripts section in preview for libraries', () => {
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
      expect(screen.queryByText('No transcripts added')).not.toBeInTheDocument();
    });
  });
});
