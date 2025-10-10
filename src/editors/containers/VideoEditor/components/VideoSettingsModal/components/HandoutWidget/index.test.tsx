import React from 'react';
import { screen, initializeMocks } from '@src/testUtils';
import { editorRender, type PartialEditorState } from '@src/editors/editorTestRender';
import { RequestKeys } from '../../../../../../data/constants/requests';
import HandoutWidget from '.';

describe('HandoutWidget', () => {
  const makeInitialState = (overrides: PartialEditorState = {}): PartialEditorState => ({
    app: {
      ...overrides.app,
    },
    video: {
      handout: null,
      ...overrides.video,
    },
    requests: {
      [RequestKeys.uploadAsset]: {
        status: 'failed', // or 'FAILED' for error case
      },
    },
    ...overrides,
  });

  jest.mock('../../../../../../data/redux', () => ({
    ...jest.requireActual('../../../../../../data/redux'),
    selectors: {
      ...jest.requireActual('../../../../../../data/redux').selectors,
      video: {
        ...jest.requireActual('../../../../../../data/redux').selectors.video,
        getHandoutDownloadUrl: jest.fn(() => jest.fn(({ handout }) => `http://mock-download-url/${handout}`)),
      },
    },
  }));
  beforeEach(() => {
    initializeMocks();
    jest.clearAllMocks();
  });

  describe('renders', () => {
    test('renders as expected with default Redux state', () => {
      const initialState = makeInitialState();
      editorRender(<HandoutWidget />, { initialState });
      expect(screen.getByText('Handout')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Upload Handout' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Handout' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Collapse' })).toBeInTheDocument();
    });

    test('does not render when isLibrary is true', () => {
      const initialState = makeInitialState({
        app: { learningContextId: 'library-v1', blockId: 'lb:xyz' },
      });
      editorRender(<HandoutWidget />, {
        initialState,
      });
      expect(screen.queryByText('Handout')).not.toBeInTheDocument();
    });

    test('renders correctly with a handout URL', () => {
      const handoutUrl = '  some-url.pdf  ';
      const initialState = makeInitialState({
        video: { handout: handoutUrl } as any,
      });
      editorRender(<HandoutWidget />, {
        initialState,
      });
      expect(screen.getByText('Handout')).toBeInTheDocument();
      expect(screen.getByText(handoutUrl.trim())).toBeInTheDocument();
    });
  });
});
