import 'jest-canvas-mock';
import {
  hasValidDimensions,
  getSupportedFormats,
  resampleImage,
  createResampledFile,
  validateForm,
} from './utils';

describe('getSupportedFormats', () => {
  it('should return null', () => {
    const supportedFileFormats = getSupportedFormats('');
    expect(supportedFileFormats).toBeNull();
  });
  it('should return provided supportedFileFormats', () => {
    const expected = ['image/png', 'video/mp4'];
    const actual = getSupportedFormats(expected);
    expect(expected).toEqual(actual);
  });
  it('should return array of valid file types', () => {
    const expected = ['image/png'];
    const actual = getSupportedFormats({ 'image/*': '.png' });
    expect(expected).toEqual(actual);
  });
  it('should return array of valid file types', () => {
    const expected = ['video/mp4', 'video/mov'];
    const actual = getSupportedFormats({ 'video/*': ['.mp4', '.mov'] });
    expect(expected).toEqual(actual);
  });
});
describe('createResampledFile', () => {
  it('should return resampled file object', () => {
    const expected = new File([{ name: 'imageName', size: 20000 }], 'testVALUEVALIDIMAGE');
    const actual = createResampledFile({
      canvasUrl: 'data:MimETYpe,sOMEUrl',
      filename: 'imageName',
      mimeType: 'sOmEuiMAge',
    });

    expect(expected).toEqual(actual);
  });
});
describe('resampleImage', () => {
  it('should return filename and file', () => {
    const resampledFile = new File([{ name: 'testVALUEVALIDIMAGE', size: 20000 }], 'testVALUEVALIDIMAGE');
    const image = document.createElement('img');
    image.height = '800';
    image.width = '800';
    const actualImage = resampleImage({ image, filename: 'testVALUEVALIDIMAGE' });

    expect(actualImage).toEqual(resampledFile);
  });
});
describe('checkValidDimensions', () => {
  it('returns false for images less than min width and min height', () => {
    const image = { width: 500, height: 281 };
    const actual = hasValidDimensions(image);
    expect(actual).toBeFalsy();
  });
  it('returns false for images that do not have a 16:9 aspect ratio', () => {
    const image = { width: 800, height: 800 };
    const actual = hasValidDimensions(image);
    expect(actual).toBeFalsy();
  });
  it('returns true for images that have a 16:9 aspect ratio and larger than min width/height', () => {
    const image = { width: 1280, height: 720 };
    const actual = hasValidDimensions(image);
    expect(actual).toBeTruthy();
  });
});

describe('validateForm', () => {
  describe('provider equals Cielo24', () => {
    describe('with credentials', () => {
      it('should return false', () => {
        const isValid = validateForm(
          true,
          false,
          'Cielo24',
          {
            cielo24Fidelity: 'test-fidelity',
            cielo24Turnaround: 'test-turnaround',
            preferredLanguages: [],
            videoSourceLanguage: 'test-source',
          },
        );
        expect(isValid).toBeFalsy();
      });
      it('should return true', () => {
        const isValid = validateForm(
          true,
          false,
          'Cielo24',
          {
            cielo24Fidelity: 'test-fidelity',
            cielo24Turnaround: 'test-turnaround',
            preferredLanguages: ['test-language'],
            videoSourceLanguage: 'test-source',
          },
        );
        expect(isValid).toBeTruthy();
      });
    });
    describe('with no credentials', () => {
      it('should return false', () => {
        const isValid = validateForm(
          false,
          false,
          'Cielo24',
          {
            apiKey: 'test-key',
            username: '',
          },
        );
        expect(isValid).toBeFalsy();
      });
      it('should return true', () => {
        const isValid = validateForm(
          false,
          false,
          'Cielo24',
          {
            apiKey: 'test-key',
            username: 'test-username',
          },
        );
        expect(isValid).toBeTruthy();
      });
    });
  });
  describe('provider equals 3PlayMedia', () => {
    describe('with credentials', () => {
      it('should return false', () => {
        const isValid = validateForm(
          false,
          true,
          '3PlayMedia',
          {
            threePlayTurnaround: 'test-turnaround',
            preferredLanguages: ['test-language'],
            videoSourceLanguage: '',
          },
        );
        expect(isValid).toBeFalsy();
      });
      it('should return true', () => {
        const isValid = validateForm(
          true,
          true,
          '3PlayMedia',
          {
            threePlayTurnaround: 'test-turnaround',
            preferredLanguages: ['test-language'],
            videoSourceLanguage: 'test-source',
          },
        );
        expect(isValid).toBeTruthy();
      });
    });
    describe('with no credentials', () => {
      it('should return false', () => {
        const isValid = validateForm(
          true,
          false,
          '3PlayMedia',
          {
            apiKey: 'test-key',
            username: '',
          },
        );
        expect(isValid).toBeFalsy();
      });
      it('should return true', () => {
        const isValid = validateForm(
          false,
          false,
          '3PlayMedia',
          {
            apiKey: 'test-key',
            apiSecretKey: 'test-username',
          },
        );
        expect(isValid).toBeTruthy();
      });
    });
  });
  describe('provider equals order', () => {
    it('should return true', () => {
      const isValid = validateForm(
        false,
        false,
        'order',
        {},
      );
      expect(isValid).toBeTruthy();
    });
  });
  describe('provider equals null', () => {
    it('should return false', () => {
      const isValid = validateForm(
        false,
        false,
        null,
        {},
      );
      expect(isValid).toBeFalsy();
    });
  });
});
