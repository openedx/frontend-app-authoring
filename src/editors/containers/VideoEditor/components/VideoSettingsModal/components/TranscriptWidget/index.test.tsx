import React from 'react';
import { screen, initializeMocks } from '@src/testUtils';
import { editorRender, type PartialEditorState } from '@src/editors/editorTestRender';

import { RequestKeys } from '../../../../../../data/constants/requests';
import { selectors } from '../../../../../../data/redux';
import { TranscriptWidgetInternal as TranscriptWidget, hooks } from './index';

jest.mock('../../../../../../data/redux', () => {
  const actual = jest.requireActual('../../../../../../data/redux');
  return {
    ...actual, // keep initializeStore and other real exports
    actions: {
      video: {
        updateField: jest.fn().mockName('actions.video.updateField'),
      },
    },
    thunkActions: {
      video: {
        deleteTranscript: jest.fn().mockName('thunkActions.video.deleteTranscript'),
        updateTranscriptHandlerUrl: jest.fn().mockName('thunkActions.video.updateTranscriptHandlerUrl'),
      },
    },
    selectors: {
      app: {
        isLibrary: jest.fn(() => false),
        shouldCreateBlock: jest.fn(() => false),
      },
      video: {
        transcripts: (state) => state.video.transcripts,
        selectedVideoTranscriptUrls: (state) => state.video.selectedVideoTranscriptUrls,
        allowTranscriptDownloads: (state) => state.video.allowTranscriptDownloads,
        showTranscriptByDefault: (state) => state.video.showTranscriptByDefault,
        allowTranscriptImport: (state) => state.video.allowTranscriptImport,
      },
      requests: {
        isFailed: (state, { requestKey }) => state.requests[requestKey] || false,
      },
    },
  };
});

jest.mock('../CollapsibleFormWidget', () => 'CollapsibleFormWidget');
jest.mock('./Transcript', () => 'Transcript');

// helper for tests
const makeInitialState = (overrides: PartialEditorState = {}): PartialEditorState => ({
  video: {
    transcripts: [],
    selectedVideoTranscriptUrls: {},
    allowTranscriptDownloads: false,
    showTranscriptByDefault: false,
    allowTranscriptImport: false,
    ...overrides.video,
  },
  app: {
    blockTitle: 'Test Block',
    ...overrides.app,
  },
  requests: {
    [RequestKeys.uploadTranscript]: { status: 'inactive' },
    [RequestKeys.deleteTranscript]: { status: 'inactive' },
    ...overrides.requests,
  },
});

describe('TranscriptWidget', () => {
  beforeEach(() => {
    initializeMocks();
    jest.spyOn(selectors.app, 'shouldCreateBlock').mockReturnValue(false);
  });

  describe('hooks', () => {
    describe('transcriptLanguages', () => {
      test('empty list of transcripts returns ', () => {
        expect(hooks.transcriptLanguages([])).toEqual('None');
      });
      test('unset gives none', () => {
        expect(hooks.transcriptLanguages(['', ''])).toEqual('');
      });
      test('en gives English', () => {
        expect(hooks.transcriptLanguages(['en'])).toEqual('English');
      });
      test('en, FR gives English, French', () => {
        expect(hooks.transcriptLanguages(['en', 'fr'])).toEqual('English, French');
      });
    });
    describe('hasTranscripts', () => {
      test('null returns false ', () => {
        expect(hooks.hasTranscripts(null)).toEqual(false);
      });
      test('empty list returns false', () => {
        expect(hooks.hasTranscripts([])).toEqual(false);
      });
      test('content returns true', () => {
        expect(hooks.hasTranscripts(['en'])).toEqual(true);
      });
    });
    describe('onAddNewTranscript', () => {
      const mockUpdateField = jest.fn();
      test('null returns [empty string] ', () => {
        hooks.onAddNewTranscript({ transcripts: null, updateField: mockUpdateField });
        expect(mockUpdateField).toHaveBeenCalledWith({ transcripts: [''] });
      });
      test(' transcripts return list with blank added', () => {
        const mocklist = ['en', 'fr', 3];
        hooks.onAddNewTranscript({ transcripts: mocklist, updateField: mockUpdateField });

        expect(mockUpdateField).toHaveBeenCalledWith({ transcripts: ['en', 'fr', 3, ''] });
      });
    });
  });

  describe('component', () => {
    test('renders as expected with default state', () => {
      editorRender(<TranscriptWidget />, {
        initialState: makeInitialState(),
      });
      expect(screen.getByText('Add video transcripts (.srt files only) for improved accessibility.')).toBeInTheDocument();
    });

    test('renders with allowTranscriptImport true', () => {
      editorRender(<TranscriptWidget />, {
        initialState: makeInitialState({ video: { allowTranscriptImport: true } }),
      });
      expect(screen.getByText('We found transcript for this video on YouTube. Would you like to import it now?')).toBeInTheDocument();
    });

    test('renders with transcripts', () => {
      editorRender(<TranscriptWidget />, {
        initialState: makeInitialState({ video: { transcripts: ['en'] as any } }),
      });
      const widget = screen.getByTestId('redux-provider').querySelector('collapsibleformwidget');
      expect(widget).toHaveAttribute('subtitle', 'English');
    });

    test('renders with transcript URLs', () => {
      editorRender(<TranscriptWidget />, {
        initialState: makeInitialState({
          video: {
            transcripts: ['en'] as any,
            selectedVideoTranscriptUrls: { en: 'url' } as any,
          },
        }),
      });
      const widget = screen.getByTestId('redux-provider').querySelector('collapsibleformwidget');
      expect(widget).toHaveAttribute('subtitle', 'English');
    });

    test('renders with allowTranscriptDownloads true', () => {
      editorRender(<TranscriptWidget />, {
        initialState: makeInitialState({
          video: { transcripts: ['en'] as any, allowTranscriptDownloads: true },
        }),
      });
      const checkbox = screen.getByRole('checkbox', { name: 'Allow transcript downloads' });
      expect(checkbox).toBeChecked();
    });

    test('renders with showTranscriptByDefault true', () => {
      editorRender(<TranscriptWidget />, {
        initialState: makeInitialState({
          video: { transcripts: ['en'] as any, showTranscriptByDefault: true },
        }),
      });
      const checkbox = screen.getByRole('checkbox', {
        name: 'Show transcript in the video player by default',
      });
      expect(checkbox).toBeChecked();
    });

    test('renders upload error', () => {
      editorRender(<TranscriptWidget />, {
        initialState: makeInitialState({
          video: { transcripts: ['en'] as any },
          requests: { [RequestKeys.uploadTranscript]: { status: 'failed' } },
        }),
      });
      expect(screen.getByText('Failed to upload transcript. Please try again.')).toBeInTheDocument();
    });

    test('renders delete error', () => {
      editorRender(<TranscriptWidget />, {
        initialState: makeInitialState({
          video: { transcripts: ['en'] as any },
          requests: { [RequestKeys.deleteTranscript]: { status: 'failed' } },
        }),
      });
      expect(screen.getByText('Failed to delete transcript. Please try again.')).toBeInTheDocument();
    });

    test('renders create workflow screen when shouldCreateBlock is true', () => {
      jest.spyOn(selectors.app, 'shouldCreateBlock').mockReturnValue(true);
      editorRender(<TranscriptWidget />, {
        initialState: makeInitialState(),
      });
      expect(screen.getByText('Transcripts')).toBeInTheDocument();
      expect(screen.getByText('To add transcripts, save and reopen this video')).toBeInTheDocument();
    });
  });
});
