import React from 'react';
import {
  render, screen, initializeMocks,
} from '@src/testUtils';
import * as reactredux from 'react-redux';

import { RequestKeys } from '../../../../../../data/constants/requests';

import { formatMessage } from '../../../../../../testUtils';
import { actions, selectors } from '../../../../../../data/redux';
import {
  TranscriptWidgetInternal as TranscriptWidget, mapStateToProps, mapDispatchToProps, hooks,
} from './index';

jest.mock('../../../../../../data/redux', () => ({
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
      isLibrary: jest.fn(state => ({ isLibrary: state })),
      shouldCreateBlock: jest.fn(() => false),
    },
    video: {
      transcripts: jest.fn(state => ({ transcripts: state })),
      selectedVideoTranscriptUrls: jest.fn(state => ({ selectedVideoTranscriptUrls: state })),
      allowTranscriptDownloads: jest.fn(state => ({ allowTranscriptDownloads: state })),
      showTranscriptByDefault: jest.fn(state => ({ showTranscriptByDefault: state })),
      allowTranscriptImport: jest.fn(state => ({ allowTranscriptImport: state })),
    },
    requests: {
      isFailed: jest.fn(state => ({ isFailed: state })),
    },
  },
}));
jest.mock('../CollapsibleFormWidget', () => 'CollapsibleFormWidget');
jest.mock('./Transcript', () => 'Transcript');

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(() => jest.fn()),
  useSelector: jest.fn(),
}));

jest.spyOn(reactredux, 'useSelector').mockImplementation((selectorFn) => selectorFn({}));

describe('TranscriptWidget', () => {
  beforeEach(() => {
    jest.spyOn(selectors.app, 'shouldCreateBlock').mockReset();
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
    const props = {
      error: {},
      subtitle: 'SuBTItle',
      title: 'tiTLE',
      intl: { formatMessage },
      transcripts: [],
      selectedVideoTranscriptUrls: {},
      allowTranscriptDownloads: false,
      showTranscriptByDefault: false,
      allowTranscriptImport: false,
      updateField: jest.fn().mockName('args.updateField'),
      isUploadError: false,
      isDeleteError: false,
    };

    beforeEach(() => {
      initializeMocks();
    });

    describe('render component', () => {
      test('renders as expected with default props', () => {
        const { container } = render(<TranscriptWidget {...props} />);
        expect(container.querySelector('collapsibleformwidget')).toBeInTheDocument();
        expect(screen.getByText('Add video transcripts (.srt files only) for improved accessibility.')).toBeInTheDocument();
      });

      test('renders as expected with allowTranscriptImport true', () => {
        render(<TranscriptWidget {...props} allowTranscriptImport />);
        expect(screen.getByText('We found transcript for this video on YouTube. Would you like to import it now?')).toBeInTheDocument();
      });

      test('renders as expected with transcripts', () => {
        const { container } = render(<TranscriptWidget {...props} transcripts={['en']} />);
        expect(container.querySelector('transcript')).toBeInTheDocument();
        expect(container.querySelector('transcript')).toHaveAttribute('language', 'en');
      });

      test('renders as expected with transcripts and urls', () => {
        const { container } = render(<TranscriptWidget {...props} transcripts={['en']} selectedVideoTranscriptUrls={{ en: 'url' }} />);
        expect(container.querySelector('transcript')).toBeInTheDocument();
        expect(container.querySelector('transcript')).toHaveAttribute('language', 'en');
        expect(container.querySelector('transcript')).toHaveAttribute('transcriptUrl', 'url');
      });

      test('renders as expected with allowTranscriptDownloads true', () => {
        const { container } = render(<TranscriptWidget {...props} allowTranscriptDownloads transcripts={['en']} />);
        expect(container.querySelector('transcript')).toBeInTheDocument();
        expect(container.querySelector('transcript')).toHaveAttribute('language', 'en');
        const checkbox = screen.getByRole('checkbox', { name: 'Allow transcript downloads' });
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).toBeChecked();
      });

      test('renders as expected with showTranscriptByDefault true', () => {
        render(<TranscriptWidget {...props} showTranscriptByDefault transcripts={['en']} />);
        const checkbox = screen.getByRole('checkbox', { name: 'Show transcript in the video player by default' });
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).toBeChecked();
      });

      test('snapshot: renders ErrorAlert with upload error message', () => {
        render(<TranscriptWidget {...props} isUploadError transcripts={['en', 'fr']} />);
        expect(screen.getByText('Failed to upload transcript. Please try again.')).toBeInTheDocument();
      });

      test('snapshot: renders ErrorAlert with delete error message', () => {
        render(<TranscriptWidget {...props} isDeleteError transcripts={['en']} />);
        expect(screen.getByText('Failed to delete transcript. Please try again.')).toBeInTheDocument();
      });

      test('snapshot: render when `isCreateWorkflow` is `True`', () => {
        jest.spyOn(selectors.app, 'shouldCreateBlock').mockReturnValue(true);
        render(<TranscriptWidget {...props} />);
        expect(screen.getByText('Transcripts')).toBeInTheDocument();
        expect(screen.getByText('To add transcripts, save and reopen this video')).toBeInTheDocument();
      });
    });
    describe('mapStateToProps', () => {
      const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
      test('transcripts from video.transcript', () => {
        expect(
          mapStateToProps(testState).transcripts,
          // @ts-ignore
        ).toEqual(selectors.video.transcripts(testState));
      });
      test('allowTranscriptDownloads from video.allowTranscriptDownloads', () => {
        expect(
          mapStateToProps(testState).allowTranscriptDownloads,
          // @ts-ignore
        ).toEqual(selectors.video.allowTranscriptDownloads(testState));
      });
      test('showTranscriptByDefault from video.showTranscriptByDefault', () => {
        expect(
          mapStateToProps(testState).showTranscriptByDefault,
          // @ts-ignore
        ).toEqual(selectors.video.showTranscriptByDefault(testState));
      });
      test('allowTranscriptImport from video.allowTranscriptImport', () => {
        expect(
          mapStateToProps(testState).allowTranscriptImport,
          // @ts-ignore
        ).toEqual(selectors.video.allowTranscriptImport(testState));
      });
      test('isUploadError from requests.isFinished', () => {
        expect(
          mapStateToProps(testState).isUploadError,
        ).toEqual(selectors.requests.isFailed(testState, { requestKey: RequestKeys.uploadTranscript }));
      });
      test('isDeleteError from requests.isFinished', () => {
        expect(
          mapStateToProps(testState).isDeleteError,
        ).toEqual(selectors.requests.isFailed(testState, { requestKey: RequestKeys.deleteTranscript }));
      });
    });
    describe('mapDispatchToProps', () => {
      const dispatch = jest.fn();
      test('updateField from actions.video.updateField', () => {
        // @ts-ignore
        expect(mapDispatchToProps.updateField).toEqual(dispatch(actions.video.updateField));
      });
    });
  });
});
