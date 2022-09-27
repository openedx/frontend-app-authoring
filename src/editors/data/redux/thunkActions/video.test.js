import { actions } from '..';
import { keyStore } from '../../../utils';
import * as thunkActions from './video';

jest.mock('./requests', () => ({
  deleteTranscript: (args) => ({ deleteTranscript: args }),
  uploadTranscript: (args) => ({ uploadTranscript: args }),
}));
const thunkActionsKeys = keyStore(thunkActions);

const mockLanguage = 'la';
const mockFile = 'soMEtRANscRipT';
const mockFilename = 'soMEtRANscRipT.srt';

const testState = { transcripts: { la: 'test VALUE' }, videoId: 'soMEvIDEo' };
const testUpload = { transcripts: { la: { filename: mockFilename } } };
const testReplaceUpload = {
  file: mockFile,
  language: mockLanguage,
  filename: mockFilename,
};

describe('video thunkActions', () => {
  let dispatch;
  let getState;
  let dispatchedAction;
  beforeEach(() => {
    dispatch = jest.fn((action) => ({ dispatch: action }));
    getState = jest.fn(() => ({
      app: { studioEndpointUrl: 'soMEeNDPoiNT', blockId: 'soMEBloCk' },
      video: testState,
    }));
  });
  describe('deleteTranscript', () => {
    beforeEach(() => {
      thunkActions.deleteTranscript({ language: mockLanguage })(dispatch, getState);
      [[dispatchedAction]] = dispatch.mock.calls;
    });
    it('dispatches deleteTranscript action', () => {
      expect(dispatchedAction.deleteTranscript).not.toEqual(undefined);
    });
    it('dispatches actions.video.updateField on success', () => {
      dispatch.mockClear();
      dispatchedAction.deleteTranscript.onSuccess();
      expect(dispatch).toHaveBeenCalledWith(actions.video.updateField({ transcripts: {} }));
    });
  });
  describe('uploadTranscript', () => {
    beforeEach(() => {
      thunkActions.uploadTranscript({
        language: mockLanguage,
        filename: mockFilename,
        file: mockFile,
      })(dispatch, getState);
      [[dispatchedAction]] = dispatch.mock.calls;
    });
    it('dispatches uploadTranscript action', () => {
      expect(dispatchedAction.uploadTranscript).not.toEqual(undefined);
    });
    it('dispatches actions.video.updateField on success', () => {
      dispatch.mockClear();
      dispatchedAction.uploadTranscript.onSuccess();
      expect(dispatch).toHaveBeenCalledWith(actions.video.updateField(testUpload));
    });
  });
  describe('replaceTranscript', () => {
    const spies = {};
    beforeEach(() => {
      spies.uploadTranscript = jest.spyOn(thunkActions, thunkActionsKeys.uploadTranscript)
        .mockReturnValueOnce(testReplaceUpload);
      thunkActions.replaceTranscript({
        newFile: mockFile,
        newFilename: mockFilename,
        language: mockLanguage,
      })(dispatch, getState, spies.uploadTranscript);
      [[dispatchedAction]] = dispatch.mock.calls;
    });
    it('dispatches deleteTranscript action', () => {
      expect(dispatchedAction.deleteTranscript).not.toEqual(undefined);
    });
    it('dispatches actions.video.updateField and replaceTranscript success', () => {
      dispatch.mockClear();
      dispatchedAction.deleteTranscript.onSuccess();
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, actions.video.updateField({ transcripts: {} }));
      expect(dispatch).toHaveBeenNthCalledWith(2, expect.any(Function));
    });
  });
});
