import { initialState, actions, reducer } from './reducer';

describe('video reducer', () => {
  it('returns the initial state when called with undefined', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  describe('initial state', () => {
    it('includes audioDescriptionUrl as empty string', () => {
      expect(initialState.audioDescriptionUrl).toBe('');
    });
  });

  describe('handling actions', () => {
    const testingState = {
      ...initialState,
      arbitraryField: 'arbitrary',
    };

    describe('updateField', () => {
      it('merges the payload into state (audioDescriptionUrl)', () => {
        const result = reducer(
          testingState,
          actions.updateField({ audioDescriptionUrl: 'https://cdn.example.com/ad.mp3' }),
        );
        expect(result.audioDescriptionUrl).toBe('https://cdn.example.com/ad.mp3');
        expect(result.arbitraryField).toBe('arbitrary');
      });
      it('clears audioDescriptionUrl (delete pattern)', () => {
        const stateWithAD = {
          ...testingState,
          audioDescriptionUrl: '/asset@ad-file.mp3',
        };
        const result = reducer(
          stateWithAD,
          actions.updateField({ audioDescriptionUrl: '' }),
        );
        expect(result.audioDescriptionUrl).toBe('');
      });
    });

    describe('load', () => {
      it('replaces the entire state with payload', () => {
        const newState = {
          videoSource: 'https://example.com/video.mp4',
          videoId: 'test-video-id',
          audioDescriptionUrl: '/asset@narration.mp3',
        };
        const result = reducer(testingState, actions.load(newState));
        expect(result).toEqual(newState);
        expect(result.arbitraryField).toBeUndefined();
      });
    });
  });
});
