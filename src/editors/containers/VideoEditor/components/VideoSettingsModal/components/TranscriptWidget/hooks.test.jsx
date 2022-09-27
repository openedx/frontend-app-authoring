import * as module from './hooks';

import { actions, thunkActions } from '../../../../../../data/redux';
import { MockUseState } from '../../../../../../../testUtils';

const lang1 = 'Kalaallisut';
const lang2 = 'Greek';
const lang1Code = 'kl';
const lang2Code = 'el';
const transcript1 = 'fIlEnAme1.srt';
const transcript2 = 'fIlenAME2.srt';

const transcripts = {
  [lang1Code]: {
    filename: transcript1,
  },
  [lang2Code]: {
    filename: transcript2,
  },
};

jest.mock('../../../../../../data/redux', () => ({
  thunkActions: {
    video: {
      replaceTranscript: jest.fn(args => ({ replaceTranscript: args })).mockName('thunkActions.video.replaceTranscript'),
      uploadTranscript: jest.fn(args => ({ uploadTranscript: args })).mockName('thunkActions.video.uploadTranscript'),
    },
  },
  actions: {
    video: {
      updateField: jest.fn(args => ({ updateField: args })).mockName('actions.video.updateField'),
    },
  },
}));

describe('VideoEditorTranscript hooks', () => {
  describe('transcriptLanguages', () => {
    test('it returns none when given empty object', () => {
      expect(module.transcriptLanguages({})).toEqual('None');
    });
    test('it creates a list based on transcript object', () => {
      expect(module.transcriptLanguages(transcripts)).toEqual(`${lang1}, ${lang2}`);
    });
  });

  describe('onSelectLanguage', () => {
    const mockLangValue = 'soMeLanGuaGeCoDE';
    const mockEvent = { target: { value: mockLangValue } };
    const mockDispatch = jest.fn();

    test('it dispatches the correct thunk', () => {
      const cb = module.onSelectLanguage({
        filename: transcript1, dispatch: mockDispatch, transcripts, languageBeforeChange: lang1Code,
      });
      const newTranscripts = {
        transcripts: { [lang2Code]: { filename: transcript2 }, [mockLangValue]: { filename: transcript1 } },
      };
      cb(mockEvent);
      expect(actions.video.updateField).toHaveBeenCalledWith(newTranscripts);
      expect(mockDispatch).toHaveBeenCalledWith({ updateField: newTranscripts });
    });
  });

  describe('replaceFileCallback', () => {
    const mockFile = 'sOmeEbytes';
    const mockFileName = 'one.srt';
    const mockEvent = { mockFile, name: mockFileName };
    const mockDispatch = jest.fn();

    const result = { newFile: { mockFile, name: mockFileName }, newFilename: mockFileName, language: lang1Code };

    test('it dispatches the correct thunk', () => {
      const cb = module.replaceFileCallback({
        dispatch: mockDispatch, language: lang1Code,
      });
      cb(mockEvent);
      expect(thunkActions.video.replaceTranscript).toHaveBeenCalledWith(result);
      expect(mockDispatch).toHaveBeenCalledWith({ replaceTranscript: result });
    });
  });
  describe('addFileCallback', () => {
    const mockFile = 'sOmeEbytes';
    const mockFileName = 'one.srt';
    const mockEvent = { mockFile, name: mockFileName };
    const mockDispatch = jest.fn();

    const result = { file: { mockFile, name: mockFileName }, filename: mockFileName, language: null };

    test('it dispatches the correct thunk', () => {
      const cb = module.addFileCallback({
        dispatch: mockDispatch,
      });
      cb(mockEvent);
      expect(thunkActions.video.uploadTranscript).toHaveBeenCalledWith(result);
      expect(mockDispatch).toHaveBeenCalledWith({ uploadTranscript: result });
    });
  });

  describe('state hooks', () => {
    const state = new MockUseState(module);

    beforeEach(() => {
      jest.clearAllMocks();
    });
    describe('state hooks', () => {
      state.testGetter(state.keys.inDeleteConfirmation);
    });

    describe('setUpDeleteConfirmation hook', () => {
      beforeEach(() => {
        state.mock();
      });
      afterEach(() => {
        state.restore();
      });
      test('inDeleteConfirmation: state values', () => {
        expect(module.setUpDeleteConfirmation().inDeleteConfirmation).toEqual(false);
      });
      test('inDeleteConfirmation setters: launch', () => {
        module.setUpDeleteConfirmation().launchDeleteConfirmation();
        expect(state.setState[state.keys.inDeleteConfirmation]).toHaveBeenCalledWith(true);
      });
      test('inDeleteConfirmation setters: cancel', () => {
        module.setUpDeleteConfirmation().cancelDelete();
        expect(state.setState[state.keys.inDeleteConfirmation]).toHaveBeenCalledWith(false);
      });
    });
  });
});
