import React from 'react';
import {
  screen,
  fireEvent,
  initializeMocks,
} from '@src/testUtils';
import { editorRender, type PartialEditorState } from '@src/editors/editorTestRender';
import { thunkActions } from '../../../../../../data/redux';
import { initialState as editorInitialState } from '../../../../../../data/redux/video/reducer';

import * as componentModule from './TranscriptActionMenu';

const TranscriptActionMenu = componentModule.TranscriptActionMenuInternal;

jest.mock('react-redux', () => {
  const dispatchFn = jest.fn().mockName('mockUseDispatch');
  return {
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(() => dispatchFn),
  };
});

jest.mock('../../../../../../data/redux', () => {
  const actual = jest.requireActual('../../../../../../data/redux');
  return {
    ...actual, // keep initializeStore, selectors, etc.
    thunkActions: {
      ...actual.thunkActions,
      video: {
        ...actual.thunkActions.video,
        deleteTranscript: jest.fn().mockName('thunkActions.video.deleteTranscript'),
        replaceTranscript: jest.fn((args) => ({ replaceTranscript: args })).mockName('thunkActions.video.replaceTranscript'),
        downloadTranscript: jest.fn().mockName('thunkActions.video.downloadTranscript'),
      },
    },
  };
});

jest.mock('../../../../../../sharedComponents/FileInput', () => ({
  FileInput: 'FileInput',
  fileInput: jest.fn((args) => ({ click: jest.fn().mockName('click input'), onAddFile: args.onAddFile })),
}));

describe('TranscriptActionMenu', () => {
  describe('hooks', () => {
    describe('replaceFileCallback', () => {
      const lang1Code = 'coDe';
      const mockFile = 'sOmeEbytes';
      const mockFileName = 'one.srt';
      const mockEvent = { mockFile, name: mockFileName };
      const mockDispatch = jest.fn();
      const result = { newFile: { mockFile, name: mockFileName }, newFilename: mockFileName, language: lang1Code };

      test('it dispatches the correct thunk', () => {
        const cb = componentModule.hooks.replaceFileCallback({
          dispatch: mockDispatch, language: lang1Code,
        });
        cb(mockEvent);
        expect(thunkActions.video.replaceTranscript).toHaveBeenCalledWith(result);
        expect(mockDispatch).toHaveBeenCalledWith({ replaceTranscript: result });
      });
    });
  });

  describe('renders', () => {
    const props = {
      index: 1,
      language: 'en',
      launchDeleteConfirmation: jest.fn().mockName('launchDeleteConfirmation'),
    };

    beforeEach(() => {
      initializeMocks();
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    const makeInitialState = (overrides: PartialEditorState = {}): PartialEditorState => ({
      ...editorInitialState,
      app: {
        ...editorInitialState.app,
        studioEndpointUrl: '', // ✅ ensure defined
        blockId: 'block-v1:Test+TST101+2025+type@video+block@12345', // ✅ ensure defined
        ...(overrides.app ?? {}),
      },
      video: {
        ...editorInitialState.video,
        transcripts: [], // ✅ avoids selector openLanguages issues
        ...(overrides.video ?? {}),
      },
      ...overrides,
    });

    test('renders as expected with default props', () => {
      editorRender(<TranscriptActionMenu {...props} />, {
        initialState: makeInitialState(),
      });
      expect(screen.getByRole('button', { name: 'Actions dropdown' })).toBeInTheDocument();
    });

    test('renders with transcriptUrl and creates proper download link', () => {
      editorRender(<TranscriptActionMenu {...props} transcriptUrl="url" />, {
        initialState: makeInitialState(),
      });
      const actionsDropdown = screen.getByRole('button', { name: 'Actions dropdown' });
      fireEvent.click(actionsDropdown);
      const downloadOption = screen.getByRole('link', { name: 'Download' });
      expect(downloadOption).toBeInTheDocument();
      expect(downloadOption).toHaveAttribute('href', 'url');
    });
  });
});
