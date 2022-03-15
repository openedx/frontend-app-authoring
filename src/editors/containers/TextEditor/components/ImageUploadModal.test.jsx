import * as module from './ImageUploadModal';

describe('ImageUploadModal hooks', () => {
  describe('getImgTag', () => {
    const mockSelection = { externalUrl: 'sOmEuRl.cOm' };
    let output;
    test('It returns a html string which matches an image tag', () => {
      const mockSettings = {
        altText: 'aLt tExt',
        isDecorative: false,
        dimensions: {
          width: 2022,
          height: 1619,
        },

      };
      output = module.hooks.getImgTag({ selection: mockSelection, settings: mockSettings });
      expect(output).toEqual(`<img src="${mockSelection.externalUrl}" alt="${mockSettings.altText}" width="${mockSettings.dimensions.width}" height="${mockSettings.dimensions.height}">`);
    });
    test('If Is decorative is true, alt text is an empty string', () => {
      const mockSettings = {
        isDecorative: true,
        altText: 'aLt tExt',
        dimensions: {
          width: 2022,
          height: 1619,
        },
      };
      output = module.hooks.getImgTag({ selection: mockSelection, settings: mockSettings });
      expect(output).toEqual(`<img src="${mockSelection.externalUrl}" alt="" width="${mockSettings.dimensions.width}" height="${mockSettings.dimensions.height}">`);
    });
  });

  describe('createSaveCallback', () => {
    const close = jest.fn();
    const execCommandMock = jest.fn();
    const editorRef = { current: { some: 'dATa', execCommand: execCommandMock } };
    const setSelection = jest.fn();
    const selection = jest.fn();
    const mockSettings = {
      altText: 'aLt tExt',
      isDecorative: false,
      dimensions: {
        width: 2022,
        height: 1619,
      },
    };
    let output;
    beforeEach(() => {
      output = module.hooks.createSaveCallback({
        close, editorRef, setSelection, selection,
      });
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    test('It creates a callback, that when called, inserts to the editor, sets the selection to be null, and calls close', () => {
      jest.spyOn(module.hooks, 'getImgTag').mockImplementationOnce(({ settings }) => ({ selection, settings }));
      expect(execCommandMock).not.toBeCalled();
      expect(setSelection).not.toBeCalled();
      expect(close).not.toBeCalled();
      output(mockSettings);
      expect(execCommandMock).toBeCalledWith('mceInsertContent', false, { selection, settings: mockSettings });
      expect(setSelection).toBeCalledWith(null);
      expect(close).toBeCalled();
    });
  });
});
