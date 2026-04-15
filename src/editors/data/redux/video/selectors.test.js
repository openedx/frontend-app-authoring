import { initialState } from './reducer';
import * as selectors from './selectors';

const buildState = (overrides = {}) => ({
  video: { ...initialState, ...overrides },
});

describe('video selectors', () => {
  describe('video root selector', () => {
    it('returns the video slice of state', () => {
      const state = buildState();
      expect(selectors.video(state)).toEqual(state.video);
    });
  });

  describe('simpleSelectors', () => {
    describe('audioDescriptionUrl', () => {
      it('returns the audioDescriptionUrl from state', () => {
        const state = buildState({ audioDescriptionUrl: '/asset@ad-file.mp3' });
        expect(selectors.simpleSelectors.audioDescriptionUrl(state)).toBe('/asset@ad-file.mp3');
      });
      it('returns empty string when no audio description is set', () => {
        const state = buildState();
        expect(selectors.simpleSelectors.audioDescriptionUrl(state)).toBe('');
      });
    });

    describe('existing selectors still work', () => {
      it('returns handout from state', () => {
        const state = buildState({ handout: '/asset@handout.pdf' });
        expect(selectors.simpleSelectors.handout(state)).toBe('/asset@handout.pdf');
      });
      it('returns videoSource from state', () => {
        const state = buildState({ videoSource: 'https://example.com/video.mp4' });
        expect(selectors.simpleSelectors.videoSource(state)).toBe('https://example.com/video.mp4');
      });
    });
  });

  describe('videoSettings', () => {
    it('includes audioDescriptionUrl in the output', () => {
      const state = buildState({
        audioDescriptionUrl: 'https://cdn.example.com/narration.mp3',
      });
      const settings = selectors.videoSettings(state);
      expect(settings.audioDescriptionUrl).toBe('https://cdn.example.com/narration.mp3');
    });
    it('returns default audio description values when not set', () => {
      const state = buildState();
      const settings = selectors.videoSettings(state);
      expect(settings.audioDescriptionUrl).toBe('');
    });
    it('includes all expected keys', () => {
      const state = buildState();
      const settings = selectors.videoSettings(state);
      const expectedKeys = [
        'videoSource',
        'videoId',
        'fallbackVideos',
        'allowVideoDownloads',
        'allowVideoSharing',
        'thumbnail',
        'transcripts',
        'selectedVideoTranscriptUrls',
        'allowTranscriptDownloads',
        'duration',
        'showTranscriptByDefault',
        'handout',
        'audioDescriptionUrl',
        'licenseType',
        'licenseDetails',
      ];
      expectedKeys.forEach((key) => {
        expect(settings).toHaveProperty(key);
      });
    });
  });
});
