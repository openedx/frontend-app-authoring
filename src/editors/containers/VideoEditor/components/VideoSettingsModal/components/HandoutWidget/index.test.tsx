import React from 'react';
import { screen, initializeMocks } from '@src/testUtils';
import editorRender from '../../../../../../editorTestRender';
import { RequestKeys } from '../../../../../../data/constants/requests';
import HandoutWidget from '.';

describe('HandoutWidget', () => {
  const initialState = {
    app: {
      isLibrary: false,
    },
    video: {
      handout: '',
      getHandoutDownloadUrl: jest.fn(() => 'mock-download-url'), // mock function
    },
    requests: {
      [RequestKeys.uploadAsset]: {
        status: 'failed', // or 'FAILED' for error case
      },
    },
  };

  beforeEach(() => {
    initializeMocks({ initialState });
    jest.clearAllMocks();
  });

  describe('renders', () => {
    test('renders as expected with default Redux state', () => {
      editorRender(<HandoutWidget />, { initialState });
      expect(screen.getByText('Handout')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Upload Handout' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Handout' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Collapse' })).toBeInTheDocument();
    });

    test('does not render when isLibrary is true', () => {
      initializeMocks({
        initialState: {
          ...initialState,
          app: { isLibrary: true, learningContextId: 'lib-v1:abc123', blockId: 'lb:xyz' },
        },
      });
      editorRender(<HandoutWidget />, {
        initialState: {
          ...initialState,
          app: { isLibrary: true, learningContextId: 'lib-v1:abc123', blockId: 'lb:xyz' },
        },
      });
      expect(screen.queryByText('Handout')).not.toBeInTheDocument();
    });

    test('renders correctly with a handout URL', () => {
      const handoutUrl = '  some-url.pdf  ';
      editorRender(<HandoutWidget />, {
        initialState: {
          ...initialState,
          video: { handout: handoutUrl },
        },
      });
      expect(screen.getByText('Handout')).toBeInTheDocument();
      expect(screen.getByText(handoutUrl.trim())).toBeInTheDocument();
    });
  });
});
